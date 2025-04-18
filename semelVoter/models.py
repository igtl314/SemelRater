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
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    def __str__(self):
        return f"{self.bakery} - {self.city} - {self.kind}"
    def update_rating(self, new_rating):
        """
        Update the Semla rating based on the old and new ratings.
        """
        try:
            old_ratings = self.ratings.all()
            self.rating = (sum([int(rating.rating) for rating in old_ratings]) + int(new_rating)) / (len(old_ratings) + 1)
            self.save()
        except Exception as e:
            print(f"Error updating rating: {e}")
class Ratings(models.Model):
    semla = models.ForeignKey(Semla, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField()
    comment = models.TextField(null=True, blank=True)
    date = models.DateField(default=date.today())
    def __str__(self):
        return f"{self.semla.bakery} - {self.rating}"
    @classmethod
    def get_semel_rating(cls, semla_id):
        """
        Get all ratings for a specific Semla.
        """
        return cls.objects.filter(semla_id=semla_id).order_by('-date').exclude(comment__isnull=True)
class RatingTracker(models.Model):
    ip_address = models.CharField(max_length=45)  # IPv6 can be long
    user_agent = models.TextField()
    date = models.DateField(default=date.today)
    count = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = ('ip_address', 'user_agent', 'date')
        
    @classmethod
    def get_today_count(cls, ip_address, user_agent):
        """
        Get the count of ratings for today for a specific IP address and user agent.
        """
        today = date.today()
        try:
            tracker = cls.objects.get(
                ip_address=ip_address,
                user_agent=user_agent,
                date=today
            )
            return tracker.count
        except cls.DoesNotExist:
            return 0
            
    @classmethod
    def increment_count(cls, ip_address, user_agent):
        """
        Increment the count for today's date for a specific IP address and user agent.
        """
        today = date.today()
        tracker, created = cls.objects.get_or_create(
            ip_address=ip_address,
            user_agent=user_agent,
            date=today,
            defaults={'count': 1}
        )
        if not created:
            tracker.count += 1
            tracker.save()
        return tracker.count