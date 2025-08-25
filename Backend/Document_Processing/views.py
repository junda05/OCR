import os
import tempfile
import time
from django.db import transaction
from django.db.models import Q
from rest_framework import generics, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from .Services.pdf_extractor import PDFExtractor
from .models import DocumentoProcesado
from .serializers import (
    DocumentoCreacionSerializer, 
    DocumentoProcesadoSerializer,
    DocumentoBusquedaSerializer,
    DocumentoListaSerializer
)
import logging

# Configurar logger para auditoría
logger = logging.getLogger(__name__)


class DocumentoPagination(PageNumberPagination):
    """
    Paginación personalizada para documentos.
    
    Técnicas implementadas:
    - Tamaño de página configurable
    - Metadatos adicionales en respuesta
    - Optimizado para interfaces responsivas
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response({
            'resultados': data,
            'paginacion': {
                'siguiente': self.get_next_link(),
                'anterior': self.get_previous_link(),
                'total_paginas': self.page.paginator.num_pages,
                'pagina_actual': self.page.number,
                'total_documentos': self.page.paginator.count,
                'documentos_por_pagina': self.page_size
            }
        })

class PDFProcessingView(APIView):
    """
    Endpoint para procesar PDFs y extraer su texto.
    
    FASE 2: Almacenamiento automático implementado
    
    Características técnicas:
    - Transacciones atómicas para integridad de datos
    - Medición de tiempo de procesamiento
    - Guardado automático en base de datos
    - Logging de operaciones para auditoría
    - Validaciones robustas
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated]  # Requerimos autenticación
    
    @transaction.atomic  # Técnica: Transacción atómica para integridad
    def post(self, request, *args, **kwargs):
        """
        Procesa un archivo PDF, extrae su texto y lo guarda automáticamente.
        
        Técnicas implementadas:
        1. Validación exhaustiva de entrada
        2. Medición de tiempo de procesamiento
        3. Transacciones atómicas para consistencia
        4. Logging para auditoría
        5. Limpieza automática de archivos temporales
        """
        inicio_procesamiento = time.time()  # Técnica: Medición de performance
        temp_path = None
        
        try:
            # Validaciones de entrada
            if 'archivo' not in request.FILES:
                logger.warning(f"Usuario {request.user.username} intentó procesar sin archivo")
                return Response(
                    {"error": "No se envió ningún archivo"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            archivo = request.FILES['archivo']
            
            # Validar extensión PDF
            if not archivo.name.lower().endswith('.pdf'):
                logger.warning(f"Usuario {request.user.username} intentó procesar archivo no-PDF: {archivo.name}")
                return Response(
                    {"error": "El archivo debe ser un PDF"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar tamaño del archivo
            MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
            if archivo.size > MAX_FILE_SIZE:
                logger.warning(f"Usuario {request.user.username} intentó procesar archivo muy grande: {archivo.size} bytes")
                return Response(
                    {"error": f"El archivo es demasiado grande. Máximo 50MB permitido. Tamaño actual: {archivo.size / (1024*1024):.1f}MB"}, 
                    status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
                )
            
            # Guardar temporalmente el archivo para procesarlo
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                for chunk in archivo.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name
            
            # Extraer el texto usando el servicio
            logger.info(f"Iniciando extracción para usuario {request.user.username}, archivo: {archivo.name}")
            extractor = PDFExtractor()
            resultado = extractor.extract_text(temp_path)
            texto = resultado["text"]
            metodo_usado = resultado["method"]
            
            # Mapear métodos del extractor a valores válidos del modelo
            mapeo_metodos = {
                "PyMuPDF": "pypdf",
                "Tesseract OCR": "ocr"
            }
            metodo_bd = mapeo_metodos.get(metodo_usado, "pypdf")  # Fallback a pypdf
            
            # Calcular tiempo de procesamiento
            tiempo_procesamiento = time.time() - inicio_procesamiento
            
            # Validar que se extrajo texto válido
            if not texto or len(texto.strip()) < 10:
                logger.error(f"Texto extraído insuficiente para {archivo.name}: {len(texto)} caracteres")
                return Response({
                    "error": "No se pudo extraer texto suficiente del PDF. El archivo podría estar corrupto o protegido."
                }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            
            # Preparar datos para guardado automático
            datos_documento = {
                'nombre_archivo': archivo.name,
                'tamaño_bytes': archivo.size,
                'texto_extraido': texto,
                'metodo_extraccion': metodo_bd,  # Usar el método mapeado
                'tiempo_procesamiento': round(tiempo_procesamiento, 3)
            }
            
            # Técnica: Usar serializer para validación y guardado
            serializer = DocumentoCreacionSerializer(
                data=datos_documento,
                context={'request': request}
            )
            
            if serializer.is_valid():
                # Guardar documento en base de datos
                documento = serializer.save()
                
                logger.info(
                    f"Documento guardado exitosamente - ID: {documento.id}, "
                    f"Usuario: {request.user.username}, "
                    f"Archivo: {archivo.name}, "
                    f"Método: {metodo_usado}, "
                    f"Tiempo: {tiempo_procesamiento:.3f}s"
                )
                
                # Respuesta exitosa con datos del documento guardado
                return Response({
                    "exito": True,
                    "mensaje": "Documento procesado y guardado exitosamente",
                    "documento_id": documento.id,
                    "texto_extraido": texto,
                    "nombre_archivo": archivo.name,
                    "tamaño_bytes": archivo.size,
                    "tamaño_legible": documento.tamaño_legible,
                    "metodo": metodo_usado,
                    "tiempo_procesamiento": tiempo_procesamiento,
                    "fecha_procesamiento": documento.fecha_procesamiento
                }, status=status.HTTP_201_CREATED)
            else:
                # Error en validación del serializer
                logger.error(f"Error de validación para {archivo.name}: {serializer.errors}")
                return Response({
                    "error": "Error validando datos del documento",
                    "detalles": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            # Manejo de errores durante el procesamiento
            logger.error(
                f"Error procesando PDF para usuario {request.user.username}: {str(e)}", 
                exc_info=True
            )
            return Response({
                "error": f"Error procesando el PDF: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        finally:
            # Técnica: Limpieza garantizada de archivos temporales
            if temp_path and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                    logger.debug(f"Archivo temporal eliminado: {temp_path}")
                except OSError as e:
                    logger.warning(f"No se pudo eliminar archivo temporal {temp_path}: {e}")


# ==================== VISTAS DE GESTIÓN Y BÚSQUEDA ====================

class DocumentoListView(generics.ListAPIView):
    """
    Vista para listar documentos del usuario autenticado.
    
    Técnicas implementadas:
    - Generic ListView con paginación automática
    - Filtros por fecha y método de extracción
    - Ordenamiento flexible
    - Solo documentos del usuario actual
    """
    serializer_class = DocumentoListaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DocumentoPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    
    # Filtros por campos específicos
    filterset_fields = ['metodo_extraccion']
    
    # Campos por los que se puede ordenar
    ordering_fields = ['fecha_procesamiento', 'nombre_archivo', 'tamaño_bytes']
    ordering = ['-fecha_procesamiento']  # Orden por defecto
    
    # Búsqueda en nombre de archivo
    search_fields = ['nombre_archivo']
    
    def get_queryset(self):
        """
        Filtra documentos activos del usuario autenticado.
        
        Técnica: Queryset personalizado para seguridad y performance
        """
        queryset = DocumentoProcesado.objects.por_usuario(self.request.user)
        
        # Filtro opcional por rango de fechas
        fecha_desde = self.request.query_params.get('fecha_desde')
        fecha_hasta = self.request.query_params.get('fecha_hasta')
        
        if fecha_desde:
            queryset = queryset.filter(fecha_procesamiento__gte=fecha_desde)
        if fecha_hasta:
            queryset = queryset.filter(fecha_procesamiento__lte=fecha_hasta)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override para añadir logging y métricas"""
        logger.info(f"Usuario {request.user.username} consultó lista de documentos")
        return super().list(request, *args, **kwargs)


class DocumentoDetailView(generics.RetrieveAPIView):
    """
    Vista para obtener detalles completos de un documento específico.
    
    Técnicas implementadas:
    - Generic RetrieveAPIView para obtención de objetos únicos
    - Validación de permisos por usuario
    - Logging de accesos para auditoría
    """
    serializer_class = DocumentoProcesadoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """
        Solo documentos activos del usuario autenticado.
        """
        return DocumentoProcesado.objects.por_usuario(self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """Override para logging de accesos"""
        documento = self.get_object()
        logger.info(
            f"Usuario {request.user.username} accedió al documento ID: {documento.id} "
            f"({documento.nombre_archivo})"
        )
        return super().retrieve(request, *args, **kwargs)


class DocumentoGlobalDetailView(generics.RetrieveAPIView):
    """
    Vista para obtener detalles de cualquier documento (para búsquedas globales).
    
    Técnicas implementadas:
    - Acceso a documentos de cualquier usuario para búsquedas globales
    - Logging de accesos para auditoría
    - Permisos de autenticación
    """
    serializer_class = DocumentoProcesadoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """
        Todos los documentos activos (para búsquedas globales).
        """
        return DocumentoProcesado.objects.activos()
    
    def retrieve(self, request, *args, **kwargs):
        """Override para logging de accesos globales"""
        documento = self.get_object()
        logger.info(
            f"Usuario {request.user.username} accedió globalmente al documento ID: {documento.id} "
            f"({documento.nombre_archivo}) del usuario {documento.usuario.username}"
        )
        return super().retrieve(request, *args, **kwargs)


class DocumentoBusquedaView(generics.ListAPIView):
    """
    Vista para búsqueda de texto en documentos.
    
    Características implementadas:
    - Búsqueda en contenido completo de documentos
    - Búsqueda global (todos los usuarios) o por usuario
    - Serializer optimizado para resultados de búsqueda
    - Paginación para grandes volúmenes de resultados
    """
    serializer_class = DocumentoBusquedaSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DocumentoPagination
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_procesamiento', 'nombre_archivo']
    ordering = ['-fecha_procesamiento']
    
    def get_queryset(self):
        """
        Realiza búsqueda según los parámetros de la query.
        
        Técnicas implementadas:
        - Búsqueda case-insensitive con icontains
        - Opción de búsqueda global vs. personal
        - Optimización con select_related
        """
        termino = self.request.query_params.get('q', '').strip()
        busqueda_global = self.request.query_params.get('global', 'false').lower() == 'true'
        
        if not termino:
            # Sin término de búsqueda, retornar queryset vacío
            return DocumentoProcesado.objects.none()
        
        if busqueda_global:
            # Búsqueda en todos los documentos activos
            queryset = DocumentoProcesado.objects.busqueda_global(termino)
            logger.info(f"Usuario {self.request.user.username} realizó búsqueda global: '{termino}'")
        else:
            # Búsqueda solo en documentos del usuario
            queryset = DocumentoProcesado.objects.busqueda_usuario(self.request.user, termino)
            logger.info(f"Usuario {self.request.user.username} realizó búsqueda personal: '{termino}'")
        
        return queryset
    
    def get_serializer_context(self):
        """
        Añade el término de búsqueda al contexto para el serializer.
        
        Técnica: Contexto enriquecido para fragmentos relevantes
        """
        context = super().get_serializer_context()
        context['termino_busqueda'] = self.request.query_params.get('q', '')
        return context
    
    def list(self, request, *args, **kwargs):
        """Override para estadísticas de búsqueda"""
        termino = request.query_params.get('q', '').strip()
        if not termino:
            return Response({
                'error': 'Parámetro de búsqueda "q" es requerido',
                'ejemplo': '?q=término de búsqueda&global=true'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        response = super().list(request, *args, **kwargs)
        
        # Añadir información de búsqueda a la respuesta
        if hasattr(response, 'data') and 'paginacion' in response.data:
            response.data['busqueda'] = {
                'termino': termino,
                'global': request.query_params.get('global', 'false').lower() == 'true',
                'resultados_encontrados': response.data['paginacion']['total_documentos']
            }
        
        return response


class DocumentoDeleteView(generics.DestroyAPIView):
    """
    Vista para eliminación (soft delete) de documentos.
    
    Técnicas implementadas:
    - Generic DestroyAPIView para eliminaciones
    - Soft delete automático
    - Validación de permisos por usuario
    - Logging de eliminaciones para auditoría
    """
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        """
        Solo documentos activos del usuario autenticado.
        """
        return DocumentoProcesado.objects.por_usuario(self.request.user)
    
    def perform_destroy(self, instance):
        """
        Override para usar soft delete en lugar de eliminación física.
        
        Técnica: Soft delete para mantener integridad referencial
        """
        logger.info(
            f"Usuario {self.request.user.username} eliminó documento ID: {instance.id} "
            f"({instance.nombre_archivo})"
        )
        
        # Usar nuestro método de soft delete
        instance.delete()
    
    def destroy(self, request, *args, **kwargs):
        """Override para respuesta personalizada"""
        instance = self.get_object()
        nombre_archivo = instance.nombre_archivo
        
        self.perform_destroy(instance)
        
        return Response({
            'exito': True,
            'mensaje': f'Documento "{nombre_archivo}" eliminado exitosamente',
            'documento_eliminado': {
                'id': instance.id,
                'nombre_archivo': nombre_archivo
            }
        }, status=status.HTTP_200_OK)


class DocumentoEstadisticasView(generics.GenericAPIView):
    """
    Vista para obtener estadísticas de documentos del usuario.
    
    Técnicas implementadas:
    - Agregaciones eficientes con ORM
    - Cálculos de métricas en base de datos
    - Respuesta estructurada para dashboards
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retorna estadísticas del usuario autenticado.
        """
        from django.db.models import Count, Sum, Avg
        
        queryset = DocumentoProcesado.objects.por_usuario(request.user)
        
        # Cálculos de estadísticas
        estadisticas = queryset.aggregate(
            total_documentos=Count('id'),
            total_tamaño=Sum('tamaño_bytes'),
            tiempo_promedio=Avg('tiempo_procesamiento')
        )
        
        # Distribución por método de extracción
        por_metodo = queryset.values('metodo_extraccion').annotate(
            cantidad=Count('id')
        ).order_by('metodo_extraccion')
        
        # Documentos recientes (últimos 7 días)
        from django.utils import timezone
        from datetime import timedelta
        
        fecha_limite = timezone.now() - timedelta(days=7)
        recientes = queryset.filter(fecha_procesamiento__gte=fecha_limite).count()
        
        logger.info(f"Usuario {request.user.username} consultó estadísticas")
        
        return Response({
            'estadisticas_generales': {
                'total_documentos': estadisticas['total_documentos'] or 0,
                'total_tamaño_bytes': estadisticas['total_tamaño'] or 0,
                'total_tamaño_legible': self._format_size(estadisticas['total_tamaño'] or 0),
                'tiempo_promedio_procesamiento': round(estadisticas['tiempo_promedio'] or 0, 2)
            },
            'distribucion_por_metodo': list(por_metodo),
            'documentos_recientes_7_dias': recientes,
            'usuario': request.user.username
        })
    
    def _format_size(self, bytes_size):
        """Helper para formatear tamaños de archivo"""
        if not bytes_size:
            return "0 B"
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.1f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.1f} TB"