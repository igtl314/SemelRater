from rest_framework import serializers
from .models import Semla

class SemlaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semla
        fields = '__all__'
