
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import SerializadorRegistroUsuario, SerializadorPerfilUsuario

class CrearUsuarioView(generics.CreateAPIView):
    """
    Vista para crear un nuevo usuario.
    """
    queryset = User.objects.all()
    serializer_class = SerializadorRegistroUsuario
    
    def get_permissions(self):
        permission_classes = []
        if self.request.method != 'POST':
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        response.data = {"mensaje": "Usuario creado exitosamente"}
        return response

class ObtenerPerfilUsuarioView(generics.RetrieveAPIView):
    """
    Vista para obtener los datos completos del usuario autenticado.
    
    Retorna:
    - username: Nombre de usuario
    - email: Correo electrónico
    - first_name: Primer nombre
    - last_name: Apellido
    - date_joined: Fecha de registro
    - is_active: Estado activo
    """
    serializer_class = SerializadorPerfilUsuario
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """
        Retorna el usuario autenticado actual.
        """
        return self.request.user
    
    def retrieve(self, request, *args, **kwargs):
        """
        Extrae los datos del usuario autenticado.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                'exito': True,
                'usuario': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'exito': False,
                'error': 'Error al obtener datos del usuario',
                'detalle': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)