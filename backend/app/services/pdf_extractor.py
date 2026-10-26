import io
import re
from typing import Dict, List, Tuple
from pypdf import PdfReader

class PDFExtractor:
    """
    Safely extracts text and structured page excerpts from official recruitment PDFs.
    Handles scanned document detection and text sanitization.
    """

    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes, max_pages: int = 50) -> Tuple[str, List[Dict[str, any]]]:
        """
        Extracts sanitized plain text and per-page records.
        Returns: (full_text, pages_list)
        """
        reader = PdfReader(io.BytesIO(pdf_bytes))
        total_pages = len(reader.pages)
        pages_to_process = min(total_pages, max_pages)

        extracted_pages = []
        combined_text_parts = []

        for page_idx in range(pages_to_process):
            page = reader.pages[page_idx]
            raw_text = page.extract_text() or ""
            
            # Clean and sanitize control characters
            sanitized_text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", raw_text)
            sanitized_text = re.sub(r"\s+", " ", sanitized_text).strip()

            page_info = {
                "page_number": page_idx + 1,
                "text_length": len(sanitized_text),
                "content": sanitized_text,
            }
            extracted_pages.append(page_info)
            if sanitized_text:
                combined_text_parts.append(f"--- Page {page_idx + 1} ---\n{sanitized_text}")

        full_text = "\n\n".join(combined_text_parts)

        # Scanned document detection: if total processed pages > 0 but extracted text is tiny
        is_likely_scanned = total_pages > 0 and len(full_text) < 100
        if is_likely_scanned:
            full_text = (
                "[NOTICE: Document appears to be a scanned image PDF. "
                "Plain text extraction produced minimal output. OCR processing recommended.]\n"
                + full_text
            )

        return full_text, extracted_pages

pdf_extractor = PDFExtractor()
