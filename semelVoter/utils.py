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
            # Use get_or_create to avoid duplicate,s
            print(f"Processing row: {row}")
            selma = Semla(bakery=row['Bakery'],
                          city=row['City'],
                          picture=row['Picture'],
                          vegan=row['Vegan'].lower() != 'false',  # Convert string to boolean
                          price=row['Price'],
                          kind=row['Kind'])
            selma.save()