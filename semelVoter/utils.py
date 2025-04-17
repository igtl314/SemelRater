import csv
import os
from django.conf import settings
from semelVoter.models import Semla

def import_semlor_from_csv():
    csv_path = os.path.join(settings.BASE_DIR, 'backend', 'semlor.csv')
    if not os.path.exists(csv_path):
        print(f"CSV file not found: {csv_path}")
        return
    print(f"CSV file found: {csv_path}")

    with open(csv_path, newline='', encoding='utf-8', ) as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        print("read csv file")
        for row in reader:
            bakery = row['Bakery']
            city = row['City']
            picture = row['Picture']
            vegan = row['Vegan'].lower() != 'false'
            price = row['Price'].replace(',', '.')
            kind = row['Kind']

            print(f"Processing row: {row}")
            selma, created = Semla.objects.get_or_create(
                bakery=bakery,
                city=city,
                kind=kind,
                defaults={
                    'picture': picture,
                    'vegan': vegan,
                    'price': price,
                })       
            if created:
                print(f"Created new Semla: {selma}")
            else:
                print(f"Semla already exists: {selma}"        
            )
            