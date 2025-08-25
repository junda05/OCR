from rest_framework import serializers
from django.contrib.auth.models import User

class SerializadorRegistroUsuario(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user 

class SerializadorPerfilUsuario(serializers.ModelSerializer):
    """
    Serializer para mostrar información completa del perfil del usuario.
    
    Incluye todos los campos necesarios para el dashboard:
    - Datos básicos (username, email, nombres)
    - Metadatos útiles (fecha de registro, estado)
    """
    fecha_registro = serializers.DateTimeField(source='date_joined', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id',
            'username', 
            'email', 
            'first_name', 
            'last_name',
            'fecha_registro',
            'is_active'
        )
        read_only_fields = ('id', 'fecha_registro', 'is_active')
