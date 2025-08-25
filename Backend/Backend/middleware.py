import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware personalizado para logging detallado de requests.
    """
    
    def process_request(self, request):
        """Inicia el tiempo de procesamiento del request"""
        request._start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Loggea información detallada del request y response"""
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
            
            # Obtener información del usuario
            user_info = 'Anonymous'
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_info = request.user.username
            
            # Loggear solo endpoints de API para evitar spam
            if request.path.startswith('/api/'):
                logger.info(
                    f"{request.method} {request.path} - "
                    f"Usuario: {user_info} - "
                    f"Status: {response.status_code} - "
                    f"Tiempo: {duration:.3f}s"
                )
        
        return response
