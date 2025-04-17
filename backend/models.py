from django.db import models
#Bakery;City;Picture;Vegan;Price;Kind
class Semla(models.Model):
    bakery = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    picture = models.CharField(max_length=255) # Change to ImageField if you want to store images
    vegan = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=3)
    kind = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.bakery} - {self.city} - {self.kind}"
    
class Ratings(models.Model):
    semla = models.ForeignKey(Semla, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"{self.semla.bakery} - {self.rating}"