import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()

from django.contrib.auth.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(username='Mauro', email='Mauro@gmail.com', password='123Mauro')
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
