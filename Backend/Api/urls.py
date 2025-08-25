from django.urls import path, include
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

urlpatterns = [
    # Autenticación y tokens
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
    
    # Rutas de usuarios
    path('crear/', views.CrearUsuarioView.as_view(), name='crear_usuario'),
    path('perfil/', views.ObtenerPerfilUsuarioView.as_view(), name='obtener_perfil'),
    
]