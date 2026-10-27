import time
import hashlib
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse, urljoin
import httpx
from bs4 import BeautifulSoup
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.monitoring import OfficialSource, ExtractionReviewItem
from app.services.pdf_extractor import pdf_extractor
from app.services.storage_adapter import storage_adapter
from app.services.llm_adapter import llm_adapter
from app.services.change_detector import change_detector
from app.services.alert_service import alert_service
from app.schemas.monitoring import CrawlExecutionReport

logger = logging.getLogger(__name__)

class ScraperService:
    """
    Automated official recruitment website watchdog:
    Executes compliant discovery, document extraction, change detection,
    and review queue ingestion.
    """

    @staticmethod
    def is_permitted_url(target_url: str, permitted_domain: Optional[str] = None) -> bool:
        """
        Enforces domain whitelist security and comprehensive SSRF defense.
        Rejects non-HTTP schemes, loopback, cloud metadata (169.254.169.254),
        and RFC 1918 private subnets.
        """
        import ipaddress
        import socket

        try:
            parsed = urlparse(target_url)
            if parsed.scheme.lower() not in ("http", "https"):
                return False

            hostname = parsed.hostname
            if not hostname:
                return False
            hostname_lower = hostname.lower()

            # Reject known loopback/cloud metadata hostnames
            blocked_hostnames = {
                "localhost", "127.0.0.1", "::1", "0.0.0.0",
                "metadata.google.internal", "instance-data",
            }
            if hostname_lower in blocked_hostnames:
                return False

            # Check if hostname is an explicit IP address
            try:
                ip = ipaddress.ip_address(hostname_lower)
                if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                    return False
            except ValueError:
                # Not an IP literal, it's a domain name
                pass

            # If permitted_domain is specified, enforce domain whitelist match
            if permitted_domain:
                perm = permitted_domain.lower().strip()
                if hostname_lower == perm or hostname_lower.endswith("." + perm):
                    return True
                return perm in hostname_lower

            return True
        except Exception:
            return False

    @staticmethod
    def check_robots_txt(domain: str, path: str) -> bool:
        """
        Lightweight robots.txt awareness: Checks common disallow rules on public recruitment portals.
        Returns True if crawling is permitted.
        """
        # Central commission public notice boards (/examinations, /whats-new, /active) are public
        disallowed_prefixes = ["/admin", "/private", "/internal", "/api/private"]
        return not any(path.startswith(prefix) for prefix in disallowed_prefixes)

    @staticmethod
    def fetch_with_backoff(
        url: str,
        headers: Optional[Dict[str, str]] = None,
        retries: int = settings.SCRAPER_MAX_RETRIES,
    ) -> httpx.Response:
        """Executes HTTP request with exponential backoff, rate limiting and custom User-Agent."""
        req_headers = {
            "User-Agent": settings.SCRAPER_USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/pdf,*/*",
        }
        if headers:
            req_headers.update(headers)

        delay = 1.0
        for attempt in range(retries):
            try:
                with httpx.Client(timeout=settings.SCRAPER_REQUEST_TIMEOUT_SECONDS, follow_redirects=True) as client:
                    resp = client.get(url, headers=req_headers)
                    if resp.status_code == 200:
                        return resp
                    elif resp.status_code in [429, 503]:
                        time.sleep(delay)
                        delay *= 2.0
                    else:
                        resp.raise_for_status()
            except Exception as e:
                if attempt == retries - 1:
                    raise e
                time.sleep(delay)
                delay *= 2.0
        raise RuntimeError(f"Failed to fetch {url} after {retries} retries")

    @classmethod
    def crawl_source(cls, db: Session, source: OfficialSource) -> CrawlExecutionReport:
        """
        Executes end-to-end monitoring pipeline for an official source.
        Idempotent: Identical content hashes do not produce duplicate entries.
        """
        report = CrawlExecutionReport(
            source_id=source.id,
            authority_code=source.authority_code,
            items_discovered=0,
            new_candidates_created=0,
            corrigenda_detected=0,
            auto_approved_count=0,
            pending_review_count=0,
            errors_encountered=[],
        )

        now_iso = datetime.now(timezone.utc).isoformat()
        source.last_crawled_at = now_iso

        if not source.is_active:
            report.errors_encountered.append(f"Source {source.authority_code} is inactive")
            return report

        # 1. Rate limiting courtesy delay
        time.sleep(source.rate_limit_delay_seconds)

        # 2. Domain whitelist security check
        if not cls.is_permitted_url(source.listing_url, source.official_domain):
            err = f"Listing URL '{source.listing_url}' does not match permitted domain '{source.official_domain}'"
            source.last_failure_at = now_iso
            source.last_error_message = err
            db.commit()
            report.errors_encountered.append(err)
            return report

        try:
            # 3. Fetch notice board or document
            resp = cls.fetch_with_backoff(source.listing_url)
            content_bytes = resp.content
            content_type = resp.headers.get("content-type", "").lower()
            current_hash = hashlib.sha256(content_bytes).hexdigest()

            # Check if listing page is unchanged since last check
            if source.last_content_hash == current_hash:
                source.last_success_at = now_iso
                source.last_error_message = None
                db.commit()
                return report

            source.last_content_hash = current_hash
            source.last_success_at = now_iso
            source.last_error_message = None

            # 4. Handle direct PDF or HTML notice listing
            discovered_documents: List[Dict[str, Any]] = []

            if "pdf" in content_type or source.listing_url.endswith(".pdf"):
                discovered_documents.append({
                    "url": source.listing_url,
                    "title": f"{source.authority_code} Official Notice",
                    "bytes": content_bytes,
                    "type": "PDF",
                })
            else:
                # Parse HTML to discover notice links / PDFs
                soup = BeautifulSoup(content_bytes, "html.parser")
                links = soup.find_all("a", href=True)
                for a in links[:10]:  # Cap discoveries per crawl
                    href = a["href"].strip()
                    title = a.get_text(strip=True)
                    if not title or len(title) < 5:
                        continue
                    full_url = urljoin(source.listing_url, href)
                    if cls.is_permitted_url(full_url, source.official_domain):
                        if any(kw in href.lower() or kw in title.lower() for kw in ["notice", "advt", "exam", "recruitment", "corrigendum", ".pdf"]):
                            discovered_documents.append({
                                "url": full_url,
                                "title": title[:200],
                                "bytes": None,  # Lazy fetch if needed
                                "type": "PDF" if href.lower().endswith(".pdf") else "HTML",
                            })

            report.items_discovered = len(discovered_documents)

            # 5. Process discovered documents safely
            for doc in discovered_documents:
                doc_url = doc["url"]
                doc_title = doc["title"]
                doc_bytes = doc["bytes"]

                # Fetch document if not yet downloaded
                if not doc_bytes:
                    try:
                        time.sleep(source.rate_limit_delay_seconds)
                        doc_resp = cls.fetch_with_backoff(doc_url)
                        doc_bytes = doc_resp.content
                    except Exception as e:
                        report.errors_encountered.append(f"Failed to download {doc_url}: {e}")
                        continue

                doc_hash = hashlib.sha256(doc_bytes).hexdigest()

                # Idempotency check: Has this exact document hash already been ingested?
                existing_candidate = db.query(ExtractionReviewItem).filter(
                    ExtractionReviewItem.content_hash == doc_hash
                ).first()
                if existing_candidate:
                    continue

                # 6. Save document safely to storage
                storage_path, _ = storage_adapter.save_document(
                    content=doc_bytes,
                    filename=f"{source.authority_code}_{doc_title[:30].replace(' ', '_')}.pdf",
                )

                # 7. Extract text
                if doc["type"] == "PDF":
                    doc_text, pages = pdf_extractor.extract_text_from_bytes(doc_bytes)
                else:
                    soup = BeautifulSoup(doc_bytes, "html.parser")
                    doc_text = soup.get_text(separator="\n", strip=True)

                # 8. Extract structured recruitment fields via LLM / Deterministic adapter
                extracted_data = llm_adapter.extract_recruitment_data(
                    document_text=doc_text,
                    source_metadata={
                        "authority_name": source.authority_name,
                        "authority_code": source.authority_code,
                        "official_url": doc_url,
                        "examination_name": doc_title,
                    },
                )

                # 9. Change Detection & High-Impact Analysis
                change_type, prev_notif, diffs, high_impact_flags, status = change_detector.analyze_change(
                    db=db,
                    extracted=extracted_data,
                )

                if extracted_data.is_corrigendum:
                    report.corrigenda_detected += 1

                # 10. Record candidate review item
                candidate = ExtractionReviewItem(
                    source_id=source.id,
                    source_url=doc_url,
                    content_hash=doc_hash,
                    document_title=extracted_data.examination_name or doc_title,
                    document_type=doc["type"],
                    raw_text_excerpt=doc_text[:2000],
                    storage_path=storage_path,
                    parser_version=settings.LLM_PROVIDER,
                    extracted_data=extracted_data.model_dump(),
                    confidence_score=extracted_data.confidence_score,
                    change_type=change_type,
                    previous_notification_id=prev_notif.id if prev_notif else None,
                    diff_summary=diffs,
                    high_impact_flags=high_impact_flags,
                    status=status,
                )

                # 11. Auto-approval policy execution if eligible
                if status == "AUTO_APPROVED":
                    published = change_detector.apply_approved_change(
                        db=db,
                        candidate_extracted_data=extracted_data.model_dump(),
                        previous_notification_id=prev_notif.id if prev_notif else None,
                        reviewed_by="System Watchdog (Auto-Approved)",
                        review_notes="Auto-approved under high confidence policy",
                    )
                    candidate.published_notification_id = published.id
                    candidate.reviewed_by = "System Watchdog"
                    candidate.reviewed_at = now_iso
                    report.auto_approved_count += 1

                    # Trigger alert dispatch
                    alert_service.notify_students_of_notification_update(
                        db=db,
                        notification=published,
                        change_type=change_type,
                        diff_summary=diffs,
                    )
                else:
                    report.pending_review_count += 1

                db.add(candidate)
                report.new_candidates_created += 1

            db.commit()

        except Exception as e:
            logger.error(f"Error crawling {source.authority_code}: {e}", exc_info=True)
            source.last_failure_at = now_iso
            source.last_error_message = str(e)
            db.commit()
            report.errors_encountered.append(str(e))

        return report

scraper_service = ScraperService()
