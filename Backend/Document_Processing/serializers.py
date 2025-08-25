from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DocumentoProcesado

class DocumentoProcesadoSerializer(serializers.ModelSerializer):
    """
    Serializer para DocumentoProcesado con campos optimizados para API.
    
    Técnicas implementadas:
    - Campos de solo lectura para datos calculados
    - Validaciones personalizadas
    - Representación optimizada de relaciones
    """
    
    # Campos calculados de solo lectura
    tamaño_legible = serializers.ReadOnlyField()
    resumen_texto = serializers.ReadOnlyField()
    
    # Información del usuario (solo lectura)
    usuario_info = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoProcesado
        fields = [
            'id',
            'nombre_archivo',
            'tamaño_bytes',
            'tamaño_legible',
            'texto_extraido',
            'resumen_texto',
            'metodo_extraccion',
            'tiempo_procesamiento',
            'fecha_procesamiento',
            'usuario_info',
            'eliminado'
        ]
        read_only_fields = [
            'id',
            'fecha_procesamiento',
            'usuario_info',
            'tamaño_legible',
            'resumen_texto'
        ]
    
    def get_usuario_info(self, obj):
        """
        Devuelve información básica del usuario sin exponer datos sensibles.
        """
        return {
            'id': obj.usuario.id,
            'username': obj.usuario.username,
            'nombre_completo': f"{obj.usuario.first_name} {obj.usuario.last_name}".strip()
        }
    
    def validate_texto_extraido(self, value):
        """
        Validación personalizada para el texto extraído.
        """
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError(
                "El texto extraído debe tener al menos 10 caracteres significativos."
            )
        return value.strip()
    
    def validate_tamaño_bytes(self, value):
        """
        Validación del tamaño del archivo.
        """
        MAX_SIZE = 50 * 1024 * 1024  # 50MB
        if value > MAX_SIZE:
            raise serializers.ValidationError(
                f"El archivo excede el tamaño máximo permitido ({MAX_SIZE // (1024*1024)}MB)."
            )
        return value


class DocumentoBusquedaSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para resultados de búsqueda.
    
    Características:
    - Campos mínimos para performance
    - Fragmentos relevantes del texto
    - Información contextual del usuario
    """
    
    usuario_info = serializers.SerializerMethodField()
    fragmento_relevante = serializers.SerializerMethodField()
    
    class Meta:
        model = DocumentoProcesado
        fields = [
            'id',
            'nombre_archivo',
            'tamaño_legible',
            'metodo_extraccion',
            'fecha_procesamiento',
            'usuario_info',
            'fragmento_relevante'
        ]
    
    def get_usuario_info(self, obj):
        """Información básica del usuario."""
        return {
            'username': obj.usuario.username,
            'nombre_completo': f"{obj.usuario.first_name} {obj.usuario.last_name}".strip()
        }
    
    def get_fragmento_relevante(self, obj):
        """
        Devuelve un fragmento del texto que contiene el término de búsqueda.
        
        Técnica: Extracción contextual de texto relevante
        """
        termino = self.context.get('termino_busqueda', '')
        if not termino:
            return obj.resumen_texto
        
        texto = obj.texto_extraido.lower()
        termino_lower = termino.lower()
        
        # Buscar la primera ocurrencia del término
        posicion = texto.find(termino_lower)
        if posicion == -1:
            return obj.resumen_texto
        
        # Extraer contexto alrededor del término (200 caracteres)
        inicio = max(0, posicion - 100)
        fin = min(len(obj.texto_extraido), posicion + 100)
        
        fragmento = obj.texto_extraido[inicio:fin]
        
        # Agregar puntos suspensivos si es necesario
        if inicio > 0:
            fragmento = "..." + fragmento
        if fin < len(obj.texto_extraido):
            fragmento = fragmento + "..."
        
        return fragmento


class DocumentoListaSerializer(serializers.ModelSerializer):
    """
    Serializer para listado de documentos del usuario.
    
    Optimizado para:
    - Carga rápida de listas
    - Información esencial
    - Paginación eficiente
    """
    
    tamaño_legible = serializers.ReadOnlyField()
    
    class Meta:
        model = DocumentoProcesado
        fields = [
            'id',
            'nombre_archivo',
            'tamaño_legible',
            'metodo_extraccion',
            'fecha_procesamiento',
            'resumen_texto'
        ]


class DocumentoCreacionSerializer(serializers.ModelSerializer):
    """
    Serializer específico para la creación de nuevos documentos.
    
    Características:
    - Validaciones estrictas para creación
    - Campos obligatorios claramente definidos
    - Optimizado para el proceso de guardado automático
    """
    
    class Meta:
        model = DocumentoProcesado
        fields = [
            'nombre_archivo',
            'tamaño_bytes',
            'texto_extraido',
            'metodo_extraccion',
            'tiempo_procesamiento'
        ]
    
    def create(self, validated_data):
        """
        Creación personalizada que asigna automáticamente el usuario actual.
        """
        # El usuario se obtiene del contexto de la request
        usuario = self.context['request'].user
        validated_data['usuario'] = usuario
        
        return super().create(validated_data)
