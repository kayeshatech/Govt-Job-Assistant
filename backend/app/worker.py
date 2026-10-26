import sys
import time
import argparse
import logging
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.models.monitoring import OfficialSource
from app.services.scraper_service import scraper_service
from app.services.alert_service import alert_service

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [Govexa Watchdog] %(message)s",
)
logger = logging.getLogger("worker")

def run_worker_cycle(authority_filter: str = None) -> None:
    """Executes a single monitoring cycle across official government sources."""
    db = SessionLocal()
    try:
        query = db.query(OfficialSource).filter(OfficialSource.is_active == True)
        if authority_filter:
            query = query.filter(OfficialSource.authority_code == authority_filter)
        sources = query.all()

        logger.info(f"Starting watchdog cycle: {len(sources)} active official sources discovered.")

        total_discovered = 0
        total_candidates = 0
        total_approved = 0

        for source in sources:
            logger.info(f"Polling source: {source.authority_name} ({source.authority_code}) -> {source.listing_url}")
            report = scraper_service.crawl_source(db, source)
            total_discovered += report.items_discovered
            total_candidates += report.new_candidates_created
            total_approved += report.auto_approved_count

            if report.errors_encountered:
                logger.warning(f"Issues encountered for {source.authority_code}: {report.errors_encountered}")

        # Scan for closing soon deadlines within 7 days
        current_year = datetime.now(timezone.utc).year
        alert_count = alert_service.generate_closing_soon_alerts(db, target_date_iso=f"{current_year}-12-31")

        logger.info(
            f"Watchdog cycle completed. Discovered: {total_discovered} | "
            f"New Candidates: {total_candidates} | Auto-Approved: {total_approved} | "
            f"Deadline Alerts Checked: {alert_count}"
        )
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Govexa Official Source Monitoring Worker")
    parser.add_argument("--run-once", action="store_true", help="Run a single crawl pass and exit (Render Cron Job)")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background (Render Background Worker)")
    parser.add_argument("--interval", type=int, default=3600, help="Interval in seconds between daemon cycles (default: 3600s)")
    parser.add_argument("--source", type=str, default=None, help="Filter by authority code (e.g. UPSC, SSC, ISRO-ICRB)")

    args = parser.parse_args()

    if args.daemon:
        logger.info(f"Launching Govexa Watchdog daemon. Polling every {args.interval} seconds.")
        while True:
            try:
                run_worker_cycle(authority_filter=args.source)
            except Exception as e:
                logger.error(f"Unhandled error in worker cycle: {e}", exc_info=True)
            time.sleep(args.interval)
    else:
        # Default behavior: run once
        logger.info("Executing single pass watchdog run.")
        run_worker_cycle(authority_filter=args.source)

if __name__ == "__main__":
    main()
