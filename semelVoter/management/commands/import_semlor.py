from django.core.management.base import BaseCommand
from semelVoter.utils import import_semlor_from_csv

class Command(BaseCommand):
    help = 'Import semlor from CSV file'

    def handle(self, *args, **options):
        self.stdout.write('Importing semlor from CSV...')
        import_semlor_from_csv()
        self.stdout.write(self.style.SUCCESS('Successfully imported semlor'))