import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from django.contrib.auth.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(username='Mauricio', email='Mauricio@gmail.com', password='123Mauricio')
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
