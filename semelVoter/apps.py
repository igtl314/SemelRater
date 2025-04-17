from django.apps import AppConfig


class SemelvoterConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'semelVoter'
    def ready(self):
        from .utils import import_semlor_from_csv
        import_semlor_from_csv()
