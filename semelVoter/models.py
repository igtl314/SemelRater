from django.db import models
from datetime import date
# Create your models here.
from django.db import models
class Semla(models.Model):
    bakery = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    picture = models.CharField(max_length=255)  # Will store as /images/user-input
    vegan = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=5, decimal_places=2)
    kind = models.CharField(max_length=255)
    def __str__(self):
        return f"{self.bakery} - {self.city} - {self.kind}"
class Ratings(models.Model):
    semla = models.ForeignKey(Semla, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    date = models.DateField(default=date.today)
    def __str__(self):
        return f"{self.semla.bakery} - {self.rating}"
