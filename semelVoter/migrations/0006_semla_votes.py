# Generated by Django 5.2 on 2025-04-17 21:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('semelVoter', '0005_alter_ratings_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='semla',
            name='votes',
            field=models.IntegerField(default=0),
        ),
    ]
