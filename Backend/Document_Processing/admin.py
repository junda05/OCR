from django.contrib import admin
from .models import DocumentoProcesado

@admin.register(DocumentoProcesado)
class DocumentoProcesadoAdmin(admin.ModelAdmin):
    """
    Configuración del admin para DocumentoProcesado.
    
    Técnicas aplicadas:
    - Campos de solo lectura para datos de auditoría
    - Filtros laterales para navegación eficiente
    - Búsqueda optimizada en campos clave
    - Paginación para manejar grandes volúmenes
    """
    
    # Lista principal
    list_display = [
        'nombre_archivo',
        'usuario',
        'tamaño_legible',
        'metodo_extraccion',
        'fecha_procesamiento',
        'eliminado'
    ]
    
    # Filtros laterales
    list_filter = [
        'eliminado',
        'metodo_extraccion',
        'fecha_procesamiento',
        'usuario'
    ]
    
    # Campos de búsqueda
    search_fields = [
        'nombre_archivo',
        'usuario__username',
        'usuario__email',
        'texto_extraido'
    ]
    
    # Campos de solo lectura
    readonly_fields = [
        'fecha_procesamiento',
        'actualizado_en',
        'fecha_eliminacion',
        'tamaño_legible'
    ]
    
    # Organización en fieldsets
    fieldsets = (
        ('Información del Documento', {
            'fields': ('nombre_archivo', 'usuario', 'tamaño_bytes', 'tamaño_legible')
        }),
        ('Contenido', {
            'fields': ('texto_extraido',),
            'classes': ('collapse',)  # Colapsado por defecto
        }),
        ('Procesamiento', {
            'fields': ('metodo_extraccion', 'tiempo_procesamiento')
        }),
        ('Auditoría', {
            'fields': ('fecha_procesamiento', 'actualizado_en', 'eliminado', 'fecha_eliminacion'),
            'classes': ('collapse',)
        }),
    )
    
    # Paginación
    list_per_page = 25
    
    # Acciones personalizadas
    actions = ['marcar_como_eliminado', 'restaurar_documentos']
    
    def marcar_como_eliminado(self, request, queryset):
        """Acción para eliminar lógicamente documentos seleccionados."""
        count = 0
        for documento in queryset:
            if not documento.eliminado:
                documento.delete()  # Usa nuestro método de soft delete
                count += 1
        
        self.message_user(
            request,
            f'{count} documento(s) marcado(s) como eliminado(s).'
        )
    marcar_como_eliminado.short_description = "Marcar como eliminado"
    
    def restaurar_documentos(self, request, queryset):
        """Acción para restaurar documentos eliminados lógicamente."""
        count = queryset.filter(eliminado=True).update(
            eliminado=False,
            fecha_eliminacion=None
        )
        
        self.message_user(
            request,
            f'{count} documento(s) restaurado(s).'
        )
    restaurar_documentos.short_description = "Restaurar documentos"
