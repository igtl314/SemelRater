from django.contrib import admin
from django.contrib import messages
from .models import Semla, SemlaImage, Ratings, RatingTracker, SemlaCreationTracker


class SemlaImageInline(admin.TabularInline):
    """Inline admin for SemlaImage to show images within Semla admin"""
    model = SemlaImage
    extra = 0
    readonly_fields = ('id', 'created_at')


class RatingsInline(admin.TabularInline):
    """Inline admin for Ratings to show ratings within Semla admin"""
    model = Ratings
    extra = 0
    readonly_fields = ('date',)


@admin.register(Semla)
class SemlaAdmin(admin.ModelAdmin):
    list_display = ('bakery', 'city', 'kind', 'price', 'rating', 'vegan')
    list_filter = ('city', 'vegan', 'kind')
    search_fields = ('bakery', 'city', 'kind')
    list_editable = ('price', 'vegan')
    ordering = ('-rating',)
    inlines = [SemlaImageInline, RatingsInline]
    
    actions = ['reset_ratings', 'delete_all_semlor']
    
    @admin.action(description='Reset ratings to 0 for selected semlor')
    def reset_ratings(self, request, queryset):
        """Reset ratings for selected Semlor"""
        for semla in queryset:
            semla.ratings.all().delete()
            semla.rating = 0.00
            semla.save()
        self.message_user(
            request,
            f"Reset ratings for {queryset.count()} semlor.",
            messages.SUCCESS
        )
    
    @admin.action(description='DELETE all semlor (use with caution!)')
    def delete_all_semlor(self, request, queryset):
        """Delete all Semlor in the database"""
        count = Semla.objects.count()
        Semla.objects.all().delete()
        self.message_user(
            request,
            f"Deleted all {count} semlor from the database.",
            messages.WARNING
        )


@admin.register(SemlaImage)
class SemlaImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'semla', 'image_url', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('semla__bakery', 'image_url')
    readonly_fields = ('id', 'created_at')


@admin.register(Ratings)
class RatingsAdmin(admin.ModelAdmin):
    list_display = ('semla', 'rating', 'date', 'comment_preview')
    list_filter = ('rating', 'date')
    search_fields = ('semla__bakery', 'comment')
    ordering = ('-date',)
    
    actions = ['delete_all_ratings']
    
    @admin.display(description='Comment')
    def comment_preview(self, obj):
        """Show truncated comment preview"""
        if obj.comment:
            return obj.comment[:50] + '...' if len(obj.comment) > 50 else obj.comment
        return '-'
    
    @admin.action(description='DELETE all ratings (use with caution!)')
    def delete_all_ratings(self, request, queryset):
        """Delete all ratings and reset semla ratings"""
        count = Ratings.objects.count()
        Ratings.objects.all().delete()
        # Reset all semla ratings to 0
        Semla.objects.update(rating=0.00)
        self.message_user(
            request,
            f"Deleted all {count} ratings and reset semla ratings to 0.",
            messages.WARNING
        )


@admin.register(RatingTracker)
class RatingTrackerAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'date', 'count')
    list_filter = ('date',)
    search_fields = ('ip_address',)
    ordering = ('-date',)
    
    actions = ['clear_all_trackers']
    
    @admin.action(description='Clear all rating trackers')
    def clear_all_trackers(self, request, queryset):
        """Clear all rating trackers"""
        count = RatingTracker.objects.count()
        RatingTracker.objects.all().delete()
        self.message_user(
            request,
            f"Cleared {count} rating trackers.",
            messages.SUCCESS
        )


@admin.register(SemlaCreationTracker)
class SemlaCreationTrackerAdmin(admin.ModelAdmin):
    list_display = ('ip_address', 'date', 'count')
    list_filter = ('date',)
    search_fields = ('ip_address',)
    ordering = ('-date',)
    
    actions = ['clear_all_creation_trackers']
    
    @admin.action(description='Clear all creation trackers')
    def clear_all_creation_trackers(self, request, queryset):
        """Clear all semla creation trackers"""
        count = SemlaCreationTracker.objects.count()
        SemlaCreationTracker.objects.all().delete()
        self.message_user(
            request,
            f"Cleared {count} creation trackers.",
            messages.SUCCESS
        )
