import csv
import os
from django.conf import settings
from .models import Semel

def import_semlor_from_csv():
    csv_path = os.path.join(settings.BASE_DIR, 'your_app', 'semlor.csv')

    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Use get_or_create to avoid duplicates
            Semel.objects.get_or_create(
                name=row['name'],
                defaults={'description': row.get('description', '')}
            )