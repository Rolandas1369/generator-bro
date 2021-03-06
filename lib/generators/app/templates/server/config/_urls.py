# -*- coding: utf-8 -*-
from django.conf import settings
from django.conf.urls import patterns, include, url
from django.conf.urls.static import static
from django.contrib import admin


urlpatterns = patterns(
    '',
    url(r'^admin/', include(admin.site.urls)),
    {{# if drf}}
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    {{/if}}
)

# for internal apps
urlpatterns += patterns(
    '',
)

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
