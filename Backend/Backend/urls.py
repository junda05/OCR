from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('__debug__', include('debug_toolbar.urls')),
    path('api/v1/', include('Api.urls')),
    path('api/v1/documentos/', include('Document_Processing.urls')),
]
