import django
import uuid
from django.db import models
from django.utils.timezone import localdate
# Create your models here.
class Semla(models.Model):
    bakery = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    picture = models.CharField(max_length=255, blank=True, default='')  # Will store as /images/user-input
    vegan = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=5, decimal_places=2)
    kind = models.CharField(max_length=255)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    def __str__(self):
        return f"{self.bakery} - {self.city} - {self.kind}"
    def update_rating(self, new_rating):
        """
        Update the Semla rating based on the old and new ratings.
        Handles both legacy single ratings and new category ratings.
        
        Args:
            new_rating: Either an int (legacy) or a dict with category ratings
        """
        try:
            old_ratings = self.ratings.all()
            
            # Calculate scores for existing ratings
            total = 0
            for rating_obj in old_ratings:
                total += rating_obj.get_average_rating()
            
            # Add the new rating
            if isinstance(new_rating, dict):
                # New category-based rating
                new_avg = (new_rating['gradde'] + new_rating['mandelmassa'] + 
                          new_rating['lock'] + new_rating['helhet'] + new_rating['bulle']) / 5
            else:
                # Legacy single rating
                new_avg = int(new_rating)
            
            self.rating = (total + new_avg) / (len(old_ratings) + 1)
            self.save()
        except Exception as e:
            print(f"Error updating rating: {e}")


class SemlaImage(models.Model):
    """Stores images associated with a Semla. UUID is used as S3 filename."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    semla = models.ForeignKey(Semla, on_delete=models.CASCADE, related_name='images')
    image_url = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Image {self.id} for {self.semla.bakery}"

class Ratings(models.Model):
    semla = models.ForeignKey(Semla, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField()  # Legacy field, kept for backward compatibility
    comment = models.TextField(null=True, blank=True)
    name = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateField(default=django.utils.timezone.now)
    # Category ratings (nullable for backward compatibility with legacy ratings)
    gradde = models.IntegerField(null=True, blank=True)  # Cream
    mandelmassa = models.IntegerField(null=True, blank=True)  # Almond paste
    lock = models.IntegerField(null=True, blank=True)  # Lid
    helhet = models.IntegerField(null=True, blank=True)  # Overall
    bulle = models.IntegerField(null=True, blank=True)  # Bun

    def __str__(self):
        return f"{self.semla.bakery} - {self.rating}"

    def get_average_rating(self):
        """Calculate average from category ratings if available, else use legacy rating."""
        if all([self.gradde, self.mandelmassa, self.lock, self.helhet, self.bulle]):
            return (self.gradde + self.mandelmassa + self.lock + self.helhet + self.bulle) / 5
        return self.rating

    @classmethod
    def get_semel_rating(cls, semla_id):
        """
        Get all ratings for a specific Semla.
        """
        return cls.objects.filter(semla_id=semla_id).order_by('-date').exclude(comment__isnull=True)


class BaseTracker(models.Model):
    """Abstract base class for IP/user-agent rate limiting trackers"""
    ip_address = models.CharField(max_length=45)  # IPv6 can be long
    user_agent = models.TextField()
    date = models.DateField(default=django.utils.timezone.now)
    count = models.PositiveIntegerField(default=1)

    class Meta:
        abstract = True
        unique_together = ('ip_address', 'user_agent', 'date')

    @classmethod
    def get_today_count(cls, ip_address, user_agent):
        """Get the count for today for a specific IP address and user agent."""
        today = localdate()
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
        """Increment the count for today's date for a specific IP address and user agent."""
        today = localdate()
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


class RatingTracker(BaseTracker):
    """Tracks rating attempts per IP/user-agent to enforce rate limiting"""

    class Meta(BaseTracker.Meta):
        pass


class SemlaCreationTracker(BaseTracker):
    """Tracks semla creation attempts per IP/user-agent to enforce rate limiting"""

    class Meta(BaseTracker.Meta):
        pass