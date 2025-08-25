import os
import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_path
from django.conf import settings

class PDFExtractor:
    """
    Servicio para extraer texto de PDFs con estrategia híbrida:
    1. Intento con PyMuPDF para PDFs nativos
    2. Fallback a pytesseract+pdf2image para PDFs escaneados
    """
    
    def __init__(self):
        # Configuración de rutas desde settings
        self.poppler_path = getattr(settings, 'POPPLER_PATH', None)
        self.tesseract_cmd = getattr(settings, 'TESSERACT_CMD', None)

        if self.tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = self.tesseract_cmd
            
    def extract_text(self, pdf_path):
        """
        Extrae texto de un PDF utilizando estrategia híbrida
        """
        # Primer intento con PyMuPDF
        text = self.extract_with_pymupdf(pdf_path)
        method = "PyMuPDF"
        
        # Verificar si se extrajo un texto significativo
        if not text or len(text.strip()) < 100:
            print("Texto insuficiente con PyMuPDF, intentando OCR...")
            text = self.extract_with_ocr(pdf_path)
            method = "Tesseract OCR"
            
        return {
            "text": text,
            "method": method
        }
            
    def extract_with_pymupdf(self, pdf_path):
        """Extrae texto usando PyMuPDF (método rápido para PDFs nativos)"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            print(f'Error extrayendo texto: {e}')
            return ""
        
    def extract_with_ocr(self, pdf_path):
        """Extrae texto usando OCR (para PDFs escaneados)"""
        try:
            # Convertir PDF a imágenes
            pages = convert_from_path(pdf_path, dpi=500, poppler_path=self.poppler_path)
            
            text = ""
            for page in pages:
                page_text = pytesseract.image_to_string(page, lang='spa')
                text = page_text + "\n\n"
            return text
        except Exception as e:
            print(f'Error extrayendo texto con OCR: {e}')
            return ""