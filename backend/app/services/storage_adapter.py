import os
import hashlib
from typing import Optional, Tuple
import httpx
from app.core.config import settings

class StorageAdapter:
    """
    Document storage adapter supporting Supabase Storage bucket
    with resilient local filesystem fallback.
    """
    def __init__(self):
        self.bucket = settings.SUPABASE_STORAGE_BUCKET
        self.supabase_url = settings.SUPABASE_URL
        self.service_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.local_dir = settings.STORAGE_LOCAL_FALLBACK_DIR
        os.makedirs(self.local_dir, exist_ok=True)

    def save_document(
        self,
        content: bytes,
        filename: str,
        content_type: str = "application/pdf",
    ) -> Tuple[str, str]:
        """
        Saves document bytes safely.
        Returns: (storage_path_or_url, sha256_hash)
        """
        # 1. Enforce file size limit (default max 15MB)
        max_bytes = settings.SCRAPER_MAX_PDF_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise ValueError(f"Document exceeds maximum permitted size of {settings.SCRAPER_MAX_PDF_SIZE_MB}MB")

        # 2. Compute SHA-256 content hash
        content_hash = hashlib.sha256(content).hexdigest()
        sanitized_filename = f"{content_hash}_{filename}"

        # 3. Attempt Supabase Storage upload if credentials are provided
        if self.supabase_url and self.service_key and "supabase.co" in self.supabase_url:
            try:
                storage_endpoint = f"{self.supabase_url}/storage/v1/object/{self.bucket}/{sanitized_filename}"
                headers = {
                    "Authorization": f"Bearer {self.service_key}",
                    "Content-Type": content_type,
                    "x-upsert": "true",
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(storage_endpoint, content=content, headers=headers)
                    if resp.status_code in [200, 201]:
                        public_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket}/{sanitized_filename}"
                        return public_url, content_hash
            except Exception as e:
                # Fall back to local file storage
                pass

        # 4. Local storage fallback
        local_path = os.path.join(self.local_dir, sanitized_filename)
        with open(local_path, "wb") as f:
            f.write(content)

        return f"file://{os.path.abspath(local_path)}", content_hash

storage_adapter = StorageAdapter()
