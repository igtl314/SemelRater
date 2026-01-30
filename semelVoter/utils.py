import csv
import os
import uuid
import logging
from django.conf import settings
from django.core.files.storage import default_storage
from semelVoter.models import Semla

logger = logging.getLogger(__name__)

# Map content types to file extensions
CONTENT_TYPE_TO_EXT = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
}


def upload_image_to_s3(file) -> tuple[uuid.UUID, str] | None:
    """
    Upload image to S3 with UUID filename.
    
    Args:
        file: An uploaded file object with content_type attribute
        
    Returns:
        (uuid, url) tuple on success, None on failure
    """
    try:
        image_uuid = uuid.uuid4()
        content_type = getattr(file, 'content_type', 'image/jpeg')
        extension = CONTENT_TYPE_TO_EXT.get(content_type, 'jpg')
        s3_key = f"semlor/{image_uuid}.{extension}"
        
        saved_path = default_storage.save(s3_key, file)
        url = default_storage.url(saved_path)
        
        return (image_uuid, url)
    except Exception as e:
        logger.warning(f"Failed to upload image to S3: {e}")
        return None

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
            vegan = row['Vegan'].lower() == 't'
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
