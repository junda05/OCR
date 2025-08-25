import os
import sys
import django
from django.conf import settings

ocr_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
if ocr_root not in sys.path:
    sys.path.insert(0, ocr_root)

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from Document_Processing.Services.pdf_extractor import PDFExtractor

def main():
    # PDF de ejemplo incluido en el repo
    pdf_path = r'..\Utils\PDFs\Scanned\1.pdf'
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]

    if not os.path.isabs(pdf_path):
        pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), pdf_path))

    if not os.path.exists(pdf_path):
        print(f'Archivo no encontrado: {pdf_path}')
        sys.exit(1)

    extractor = PDFExtractor()
    
    # Monitorear qué método de extracción se usa
    original_extract_with_pymupdf = extractor.extract_with_pymupdf
    original_extract_with_ocr = extractor.extract_with_ocr
    
    extraction_method_used = "No detectado"
    
    def wrapped_pymupdf(*args, **kwargs):
        nonlocal extraction_method_used
        extraction_method_used = "PyMuPDF"
        return original_extract_with_pymupdf(*args, **kwargs)
    
    def wrapped_ocr(*args, **kwargs):
        nonlocal extraction_method_used
        extraction_method_used = "OCR (pytesseract)"
        return original_extract_with_ocr(*args, **kwargs)
    
    extractor.extract_with_pymupdf = wrapped_pymupdf
    extractor.extract_with_ocr = wrapped_ocr
    
    text = extractor.extract_text(pdf_path)
    print(f'Método de extracción usado: {extraction_method_used}')
    print(f'Caracteres extraídos: {len(text)}')
    print('--- Primeros 500 caracteres ---')
    print(text[:500])

if __name__ == '__main__':
    main()