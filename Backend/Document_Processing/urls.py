from django.urls import path
from . import views

urlpatterns = [
    # Procesamiento de PDFs
    path('extraer-texto/', views.PDFProcessingView.as_view(), name='extraer_texto'),
    
    # Gestión de documentos
    path('', views.DocumentoListView.as_view(), name='documentos_lista'),
    path('<int:id>/', views.DocumentoDetailView.as_view(), name='documento_detalle'),
    path('global/<int:id>/', views.DocumentoGlobalDetailView.as_view(), name='documento_detalle_global'),
    path('<int:id>/eliminar/', views.DocumentoDeleteView.as_view(), name='documento_eliminar'),
    
    # Búsqueda
    path('buscar/', views.DocumentoBusquedaView.as_view(), name='documentos_buscar'),
    
    # Estadísticas
    path('estadisticas/', views.DocumentoEstadisticasView.as_view(), name='documentos_estadisticas'),
]