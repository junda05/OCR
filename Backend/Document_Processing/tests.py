from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import DocumentoProcesado
import json

class DocumentoProcesadoModelTest(TestCase):
    """
    Test del modelo DocumentoProcesado
    """
    
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
    
    def test_crear_documento(self):
        """Test de creación básica de documento"""
        documento = DocumentoProcesado.objects.create(
            usuario=self.usuario,
            nombre_archivo='test.pdf',
            tamaño_bytes=1024,
            texto_extraido='Este es un texto de prueba para testing.',
            metodo_extraccion='pypdf',
            tiempo_procesamiento=1.5
        )
        
        self.assertEqual(documento.usuario, self.usuario)
        self.assertEqual(documento.nombre_archivo, 'test.pdf')
        self.assertFalse(documento.eliminado)
        self.assertIsNotNone(documento.fecha_procesamiento)
    
    def test_tamaño_legible(self):
        """Test de la propiedad tamaño_legible"""
        documento = DocumentoProcesado.objects.create(
            usuario=self.usuario,
            nombre_archivo='test.pdf',
            tamaño_bytes=2048,
            texto_extraido='Texto de prueba.',
            metodo_extraccion='pypdf'
        )
        
        self.assertEqual(documento.tamaño_legible, '2.0 KB')
    
    def test_soft_delete(self):
        """Test del soft delete"""
        documento = DocumentoProcesado.objects.create(
            usuario=self.usuario,
            nombre_archivo='test.pdf',
            tamaño_bytes=1024,
            texto_extraido='Texto de prueba.',
            metodo_extraccion='pypdf'
        )
        
        # Soft delete
        documento.delete()
        
        # Verificar que está marcado como eliminado
        documento.refresh_from_db()
        self.assertTrue(documento.eliminado)
        self.assertIsNotNone(documento.fecha_eliminacion)
    
    def test_manager_activos(self):
        """Test del manager personalizado"""
        # Crear documentos
        doc1 = DocumentoProcesado.objects.create(
            usuario=self.usuario,
            nombre_archivo='activo.pdf',
            tamaño_bytes=1024,
            texto_extraido='Documento activo.',
            metodo_extraccion='pypdf'
        )
        
        doc2 = DocumentoProcesado.objects.create(
            usuario=self.usuario,
            nombre_archivo='eliminado.pdf',
            tamaño_bytes=1024,
            texto_extraido='Documento eliminado.',
            metodo_extraccion='pypdf'
        )
        
        # Eliminar uno
        doc2.delete()
        
        # Test del manager
        activos = DocumentoProcesado.objects.activos()
        self.assertEqual(activos.count(), 1)
        self.assertEqual(activos.first(), doc1)


class PDFProcessingViewTest(APITestCase):
    """
    Test de la vista de procesamiento de PDFs
    """
    
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        
        # Crear token JWT para autenticación
        refresh = RefreshToken.for_user(self.usuario)
        self.access_token = str(refresh.access_token)
        
        self.url = reverse('extraer_texto')  # Necesitaremos definir este nombre en urls.py
    
    def test_procesamiento_sin_autenticacion(self):
        """Test que verifica que se requiere autenticación"""
        # Crear archivo PDF falso
        pdf_content = b'%PDF-1.4 fake pdf content'
        archivo = SimpleUploadedFile('test.pdf', pdf_content, content_type='application/pdf')
        
        response = self.client.post(self.url, {'archivo': archivo}, format='multipart')
        
        # Debe retornar 401 sin autenticación
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_procesamiento_archivo_no_pdf(self):
        """Test con archivo que no es PDF"""
        # Autenticarse
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        
        # Crear archivo que no es PDF
        archivo = SimpleUploadedFile('test.txt', b'texto plano', content_type='text/plain')
        
        response = self.client.post(self.url, {'archivo': archivo}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_procesamiento_sin_archivo(self):
        """Test sin enviar archivo"""
        # Autenticarse
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.access_token)
        
        response = self.client.post(self.url, {}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)


class DocumentoManagerTest(TestCase):
    """
    Test específico del DocumentoManager
    """
    
    def setUp(self):
        self.usuario1 = User.objects.create_user(username='user1', password='pass123')
        self.usuario2 = User.objects.create_user(username='user2', password='pass123')
    
    def test_busqueda_global(self):
        """Test de búsqueda global en todos los documentos"""
        # Crear documentos de diferentes usuarios
        DocumentoProcesado.objects.create(
            usuario=self.usuario1,
            nombre_archivo='doc1.pdf',
            tamaño_bytes=1024,
            texto_extraido='Este documento contiene información importante.',
            metodo_extraccion='pypdf'
        )
        
        DocumentoProcesado.objects.create(
            usuario=self.usuario2,
            nombre_archivo='doc2.pdf',
            tamaño_bytes=1024,
            texto_extraido='Otro documento con contenido relevante.',
            metodo_extraccion='ocr'
        )
        
        # Búsqueda global
        resultados = DocumentoProcesado.objects.busqueda_global('documento')
        self.assertEqual(resultados.count(), 2)
        
        resultados_especificos = DocumentoProcesado.objects.busqueda_global('importante')
        self.assertEqual(resultados_especificos.count(), 1)
    
    def test_busqueda_por_usuario(self):
        """Test de búsqueda por usuario específico"""
        DocumentoProcesado.objects.create(
            usuario=self.usuario1,
            nombre_archivo='doc1.pdf',
            tamaño_bytes=1024,
            texto_extraido='Documento del usuario uno.',
            metodo_extraccion='pypdf'
        )
        
        DocumentoProcesado.objects.create(
            usuario=self.usuario2,
            nombre_archivo='doc2.pdf',
            tamaño_bytes=1024,
            texto_extraido='Documento del usuario dos.',
            metodo_extraccion='pypdf'
        )
        
        # Búsqueda por usuario
        resultados_user1 = DocumentoProcesado.objects.busqueda_usuario(self.usuario1, 'usuario')
        self.assertEqual(resultados_user1.count(), 1)
        self.assertEqual(resultados_user1.first().usuario, self.usuario1)


class DocumentoAPIViewsTest(APITestCase):
    """
    Tests para las nuevas vistas de gestión y búsqueda
    """
    
    def setUp(self):
        # Crear usuarios
        self.usuario1 = User.objects.create_user(username='user1', password='pass123')
        self.usuario2 = User.objects.create_user(username='user2', password='pass123')
        
        # Tokens JWT
        refresh1 = RefreshToken.for_user(self.usuario1)
        refresh2 = RefreshToken.for_user(self.usuario2)
        self.token1 = str(refresh1.access_token)
        self.token2 = str(refresh2.access_token)
        
        # Crear documentos de prueba
        self.doc1_user1 = DocumentoProcesado.objects.create(
            usuario=self.usuario1,
            nombre_archivo='documento1.pdf',
            tamaño_bytes=1024,
            texto_extraido='Este es el contenido del primer documento',
            metodo_extraccion='pypdf',
            tiempo_procesamiento=1.5
        )
        
        self.doc2_user1 = DocumentoProcesado.objects.create(
            usuario=self.usuario1,
            nombre_archivo='documento2.pdf',
            tamaño_bytes=2048,
            texto_extraido='Contenido diferente en el segundo archivo',
            metodo_extraccion='ocr',
            tiempo_procesamiento=2.1
        )
        
        self.doc1_user2 = DocumentoProcesado.objects.create(
            usuario=self.usuario2,
            nombre_archivo='documento_user2.pdf',
            tamaño_bytes=1536,
            texto_extraido='Documento que pertenece al usuario dos',
            metodo_extraccion='pypdf',
            tiempo_procesamiento=1.8
        )
    
    def test_lista_documentos_usuario(self):
        """Test del endpoint de lista de documentos"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documentos_lista')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('resultados', response.data)
        self.assertIn('paginacion', response.data)
        
        # Debe mostrar solo documentos del usuario 1
        self.assertEqual(response.data['paginacion']['total_documentos'], 2)
        
        nombres_archivos = [doc['nombre_archivo'] for doc in response.data['resultados']]
        self.assertIn('documento1.pdf', nombres_archivos)
        self.assertIn('documento2.pdf', nombres_archivos)
        self.assertNotIn('documento_user2.pdf', nombres_archivos)
    
    def test_detalle_documento(self):
        """Test del endpoint de detalle de documento"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documento_detalle', kwargs={'id': self.doc1_user1.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nombre_archivo'], 'documento1.pdf')
        self.assertEqual(response.data['texto_extraido'], 'Este es el contenido del primer documento')
    
    def test_detalle_documento_otro_usuario(self):
        """Test que no se puede acceder a documentos de otros usuarios"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        # Intentar acceder al documento del usuario 2
        url = reverse('documento_detalle', kwargs={'id': self.doc1_user2.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_busqueda_personal(self):
        """Test de búsqueda en documentos del usuario"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documentos_buscar')
        response = self.client.get(url, {'q': 'contenido'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('resultados', response.data)
        self.assertIn('busqueda', response.data)
        
        # Debe encontrar 2 documentos del usuario 1 que contengan "contenido"
        self.assertEqual(response.data['paginacion']['total_documentos'], 2)
        self.assertEqual(response.data['busqueda']['termino'], 'contenido')
        self.assertFalse(response.data['busqueda']['global'])
    
    def test_busqueda_global(self):
        """Test de búsqueda global en todos los documentos"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documentos_buscar')
        response = self.client.get(url, {'q': 'documento', 'global': 'true'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Debe encontrar 2 documentos que contengan "documento" (doc1_user1 y doc1_user2)
        self.assertEqual(response.data['paginacion']['total_documentos'], 2)
        self.assertTrue(response.data['busqueda']['global'])
    
    def test_busqueda_sin_termino(self):
        """Test de búsqueda sin término de búsqueda"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documentos_buscar')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_eliminar_documento(self):
        """Test de eliminación (soft delete) de documento"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documento_eliminar', kwargs={'id': self.doc1_user1.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('exito', response.data)
        self.assertTrue(response.data['exito'])
        
        # Verificar que el documento fue marcado como eliminado
        self.doc1_user1.refresh_from_db()
        self.assertTrue(self.doc1_user1.eliminado)
        self.assertIsNotNone(self.doc1_user1.fecha_eliminacion)
    
    def test_eliminar_documento_otro_usuario(self):
        """Test que no se puede eliminar documentos de otros usuarios"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documento_eliminar', kwargs={'id': self.doc1_user2.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_estadisticas_usuario(self):
        """Test del endpoint de estadísticas"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token1)
        
        url = reverse('documentos_estadisticas')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('estadisticas_generales', response.data)
        self.assertIn('distribucion_por_metodo', response.data)
        self.assertIn('documentos_recientes_7_dias', response.data)
        
        # Verificar estadísticas del usuario 1
        stats = response.data['estadisticas_generales']
        self.assertEqual(stats['total_documentos'], 2)
        self.assertEqual(stats['total_tamaño_bytes'], 3072)  # 1024 + 2048
