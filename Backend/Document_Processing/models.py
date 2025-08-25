from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinLengthValidator
from django.utils import timezone

class DocumentoManager(models.Manager):
    """
    Manager personalizado para consultas optimizadas de documentos.
    
    Técnicas implementadas:
    - Filtros preconfigurados para documentos activos
    - Métodos de búsqueda optimizados
    - Consultas con prefetch para evitar N+1 queries
    """
    
    def activos(self):
        """Documentos no eliminados."""
        return self.filter(eliminado=False)
    
    def por_usuario(self, usuario):
        """Documentos activos de un usuario específico."""
        return self.activos().filter(usuario=usuario)
    
    def busqueda_global(self, termino):
        """
        Búsqueda de texto en todos los documentos activos.
        Utilizando icontains para búsqueda case-insensitive.
        """
        return self.activos().filter(
            texto_extraido__icontains=termino
        ).select_related('usuario')  # Optimización: evitar consultas adicionales
    
    def busqueda_usuario(self, usuario, termino):
        """Búsqueda de texto en documentos de un usuario específico."""
        return self.por_usuario(usuario).filter(
            texto_extraido__icontains=termino
        )

class DocumentoProcesado(models.Model):
    """
    Modelo para almacenar información de documentos PDF procesados.
    
    Características técnicas:
    - Indexación optimizada para búsquedas de texto completo
    - Relación eficiente con User mediante ForeignKey
    - Campos de auditoría automáticos
    - Soft delete para mantener integridad referencial
    """
    
    # Relación con usuario
    usuario = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='documentos_procesados',
        help_text="Usuario que subió el documento"
    )
    
    # Metadatos del archivo original
    nombre_archivo = models.CharField(
        max_length=255,
        help_text="Nombre original del archivo PDF"
    )
    
    tamaño_bytes = models.PositiveIntegerField(
        help_text="Tamaño del archivo en bytes"
    )
    
    # Contenido extraído - INDEXADO para búsquedas
    texto_extraido = models.TextField(
        validators=[MinLengthValidator(1)],
        help_text="Texto completo extraído del PDF",
        db_index=True  # Índice para búsquedas rápidas
    )
    
    # Metadatos del procesamiento
    metodo_extraccion = models.CharField(
        max_length=50,
        choices=[
            ('pypdf', 'PyPDF2 - Texto directo'),
            ('ocr', 'OCR - Reconocimiento óptico'),
        ],
        help_text="Método utilizado para extraer el texto"
    )
    
    tiempo_procesamiento = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
        help_text="Tiempo de procesamiento en segundos"
    )
    
    # Campos de auditoría
    fecha_procesamiento = models.DateTimeField(
        default=timezone.now,
        db_index=True,  # Índice para filtros por fecha
        help_text="Fecha y hora de procesamiento"
    )
    
    actualizado_en = models.DateTimeField(
        auto_now=True,
        help_text="Última actualización del registro"
    )
    
    # Soft delete
    eliminado = models.BooleanField(
        default=False,
        db_index=True,  # Índice para filtros de documentos activos
        help_text="Indica si el documento fue eliminado lógicamente"
    )
    
    fecha_eliminacion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de eliminación lógica"
    )
    
    # Manager personalizado
    objects = DocumentoManager()
    
    class Meta:
        # Índices compuestos para optimización de consultas
        indexes = [
            # Índice compuesto para búsquedas por usuario y estado
            models.Index(
                fields=['usuario', 'eliminado'], 
                name='doc_usuario_eliminado_idx'
            ),
            # Índice compuesto para búsquedas por usuario y fecha
            models.Index(
                fields=['usuario', 'fecha_procesamiento'], 
                name='doc_usuario_fecha_idx'
            ),
            # Índice para búsquedas globales (todos los usuarios)
            models.Index(
                fields=['eliminado', 'fecha_procesamiento'], 
                name='doc_global_fecha_idx'
            ),
        ]
        
        ordering = ['-fecha_procesamiento']  # Orden descendente por defecto
        verbose_name = "Documento Procesado"
        verbose_name_plural = "Documentos Procesados"
    
    def __str__(self):
        return f"{self.nombre_archivo} - {self.usuario.username}"
    
    def delete(self, *args, **kwargs):
        """
        Override del método delete para implementar soft delete.
        En lugar de eliminar físicamente, marca como eliminado.
        """
        self.eliminado = True
        self.fecha_eliminacion = timezone.now()
        self.save()
    
    def hard_delete(self):
        """
        Método para eliminación física del registro.
        Usar solo cuando sea necesario limpiar completamente.
        """
        super().delete()
    
    @property
    def tamaño_legible(self):
        """
        Convierte el tamaño en bytes a formato legible.
        """
        tamaño = self.tamaño_bytes
        for unidad in ['B', 'KB', 'MB', 'GB']:
            if tamaño < 1024.0:
                return f"{tamaño:.1f} {unidad}"
            tamaño /= 1024.0
        return f"{tamaño:.1f} TB"
    
    @property
    def resumen_texto(self):
        """
        Devuelve un resumen del texto extraído (primeros 200 caracteres).
        Útil para mostrar previsualizaciones en resultados de búsqueda.
        """
        if len(self.texto_extraido) <= 200:
            return self.texto_extraido
        return self.texto_extraido[:197] + "..."


