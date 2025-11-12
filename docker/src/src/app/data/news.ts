export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  views: number;
  cover: string;
  excerpt: string;
  content: string;
};

export const NEWS: NewsItem[] = [
  {
    id: "a7b8a9b2-6b0f-4430-9a31-3db2b3bf7d14",
    slug: "whatsapp-telegram-bitrix24-connector-part1",
    title:
      "WhatsApp Web и Telegram коннектор для Bitrix24: наш опыт реализации и внедрения. Часть 1",
    date: "2025-09-03",
    views: 2000,
    cover: "/img/news/bitrix24-wa-tg-connector.svg",
    excerpt:
      "Практический кейс: как связать Bitrix24 с WhatsApp Web и Telegram, какие модели и API нужны, как настроить авторизацию и открытые линии.",
    content: `
      <p>Привет, мир! Меня зовут Павел, я IT инженер и руководитель службы технической поддержки. Работая в формате крупного IT-аутсорсинга, мы столкнулись с проблемой: общий WhatsApp/Telegram Web на компьютерах операторов поддержки плохо контролируется, история диалогов не конвертируется в структурированные тикеты. Поэтому мы начали разработку коннектора к корпоративному порталу Bitrix24.</p>
      <p>В этой статье — основы технической реализации и ключевой функционал коннектора (макеты страниц, тесты и кастомизация админки остаются на ваше усмотрение).</p>

      <h2>Технологический стек</h2>
      <p>Основа — <strong>Python</strong> и <strong>Django</strong> (простота, гибкость, богатая экосистема), что позволило быстро собрать MVP и оставить задел под масштабирование.</p>
      <ul>
        <li>REST — <strong>Django REST Framework</strong>.</li>
        <li>Фоновые задачи — <strong>Redis</strong> и <strong>Celery</strong>.</li>
      </ul>

      <h2>Основной функционал Bitrix (модели)</h2>
      <p>Создаём Django-приложение <code>bitrix</code> и добавляем модели:</p>
      <pre><code class="language-python"># models.py
import uuid
from django.conf import settings
from django.contrib.sites.models import Site
from django.db import models
from django.contrib.auth.models import User

class Bitrix(models.Model):
    PROTOCOL_CHOICES = [('http','HTTP'),('https','HTTPS')]
    protocol = models.CharField(max_length=5, choices=PROTOCOL_CHOICES, default='https')
    domain = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    user_id = models.CharField(max_length=255, blank=True, null=True)
    member_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    license_expired = models.BooleanField(default=False)
    def __str__(self): return self.domain

class Connector(models.Model):
    TYPE_CHOICES = [('telegram','Telegram Bot'),('waweb','WhatsApp Web')]
    code = models.CharField(max_length=255, default=uuid.uuid4(), unique=True)
    service = models.CharField(max_length=255, choices=TYPE_CHOICES, blank=True, null=True)
    name = models.CharField(max_length=255, default="itsource.kg")
    icon = models.FileField(upload_to="connector_icons/", blank=True, null=True,
                            default="connector_icons/cloud-rain-alt.svg")
    def __str__(self): return self.name

class App(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    site  = models.ForeignKey(Site, on_delete=models.SET_NULL, related_name="apps", blank=True, null=True)
    name = models.CharField(max_length=255, blank=True)
    page_url = models.CharField(max_length=255, blank=True, default="/")
    connectors = models.ManyToManyField(Connector, blank=True, related_name="apps")
    asterisk = models.BooleanField(default=False, help_text="Check for Asterisk connector")
    client_id = models.CharField(max_length=255, blank=True)
    client_secret = models.CharField(max_length=255, blank=True)
    def __str__(self): return self.name

class AppInstance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    app   = models.ForeignKey(App, on_delete=models.SET_NULL, related_name="installations", blank=True, null=True)
    portal = models.ForeignKey(Bitrix, on_delete=models.CASCADE, related_name="installations", blank=True, null=True)
    auth_status = models.CharField(max_length=1)
    application_token = models.CharField(max_length=255, blank=True)
    storage_id = models.CharField(max_length=255, blank=True)
    status = models.IntegerField(default=0, blank=True)
    attempts = models.IntegerField(default=0, blank=True)
    access_token = models.CharField(max_length=255, blank=True, null=True, editable=False)
    refresh_token = models.CharField(max_length=255, blank=True, null=True, editable=False)
    def __str__(self): return f"{self.app.name} on {self.portal.domain}"

class Line(models.Model):
    line_id = models.CharField(max_length=50)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True)
    app_instance = models.ForeignKey(AppInstance, on_delete=models.CASCADE, related_name="lines", null=True)
    connector = models.ForeignKey(Connector, on_delete=models.SET_NULL, related_name="lines", null=True)
    portal = models.ForeignKey(Bitrix, on_delete=models.CASCADE, related_name="lines", blank=True, null=True)
    def __str__(self): return f"Line {self.line_id}"</code></pre>

      <h2>API-модуль</h2>
      <p>Выносим веб-хуки и сервисные ручки в модуль <code>bitrix.api</code>:</p>
      <pre><code class="language-python"># api/serializers.py
from rest_framework import serializers
from bitrix.models import Bitrix

class PortalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bitrix
        fields = ["owner","user_id","domain"]
    def create(self, validated_data):
        return Bitrix.objects.create(**validated_data)</code></pre>

      <pre><code class="language-python"># api/views.py
from rest_framework.mixins import CreateModelMixin
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from bitrix.models import Bitrix
from bitrix.utils import event_processor
from .serializers import PortalSerializer

class PortalViewSet(CreateModelMixin, GenericViewSet):
    queryset = Bitrix.objects.all()
    serializer_class = PortalSerializer
    def create(self, request, *args, **kwargs):
        print("create func")
        return event_processor(request)
    def head(self, request, *args, **kwargs):
        print("head func")
        return Response(headers={"Allow":"POST, HEAD"})</code></pre>

      <h2>Настройки DRF и токены</h2>
      <pre><code class="language-python"># settings.py (фрагмент)
REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": (
    "rest_framework.authentication.SessionAuthentication",
    "rest_framework.authentication.TokenAuthentication",
    "core.qpta.QueryParamTokenAuthentication",
  ),
  "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
  "DEFAULT_RENDERER_CLASSES": ("rest_framework.renderers.JSONRenderer",),
}</code></pre>

      <pre><code class="language-python"># core/qpta.py
from rest_framework.authentication import TokenAuthentication

class QueryParamTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        token = request.query_params.get("api-key")
        if not token:
            return super().authenticate(request)
        user, token = self.authenticate_credentials(token)
        return (user, token)</code></pre>

      <h2>Роутинг API</h2>
      <pre><code class="language-python"># core/api_router.py
from django.conf import settings
from rest_framework.routers import DefaultRouter, SimpleRouter
from bitrix.api.views import PortalViewSet
from users.api.views import UserViewSet
from waweb.api.views import EventsHandler
from telegram.api.views import TelegramEventsHandler

router = DefaultRouter() if settings.DEBUG else SimpleRouter()
router.register("users", UserViewSet)
router.register("bitrix", PortalViewSet)
router.register("waweb", EventsHandler, basename="waevents")
router.register("telegram", TelegramEventsHandler, basename="tgevents")

app_name = "api"
urlpatterns = router.urls</code></pre>

      <pre><code class="language-python"># urls.py (корневой)
from django.urls import include, path
urlpatterns += [
    path("api/", include("core.api_router")),  # core → модуль с ядром проекта
]</code></pre>

      <h2>Утилиты, интеграция и подключение открытой линии</h2>
      <p>Базовые хелперы, задачи Celery и интеграция с Bitrix24 (фрагменты):</p>
      <pre><code class="language-python"># bitrix/utils.py (фрагменты)
import base64, json, logging, re, redis, requests
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.contrib import messages
from django.conf import settings
from django.shortcuts import redirect, get_object_or_404
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.http import HttpResponse

from waweb.models import Session
import waweb.utils as waweb
import waweb.tasks as waweb_tasks
import telegram.tasks as telegram_tasks

from .crest import call_method
from .models import App, AppInstance, Bitrix, Line, Connector
import bitrix.tasks as bitrix_tasks
from telegram.models import TelegramBot

redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=6379, db=0)
logger = logging.getLogger("django")

GENERAL_EVENTS = ["ONAPPUNINSTALL"]
CONNECTOR_EVENTS = ["ONIMCONNECTORMESSAGEADD","ONIMCONNECTORLINEDELETE","ONIMCONNECTORSTATUSDELETE"]</code></pre>

      <pre><code class="language-python">def connect_line(request, line_id, entity, connector, redirect_to):
    line_id = str(line_id)
    if line_id.startswith("create__"):
        instance_id = line_id.split("__")[1]
        app_instance = get_object_or_404(AppInstance, id=instance_id, owner=request.user)
        if not app_instance.portal:
            messages.error(request, "Невозможно создать линию: портал не найден")
            return redirect(redirect_to)
        if entity.line:
            call_method(app_instance, "imconnector.activate", {
                "CONNECTOR": connector.code, "LINE": entity.line.line_id, "ACTIVE": 0
            })
        line_name = entity.bot_username if connector.service == "telegram" else entity.phone
        create_payload = {"PARAMS": {"LINE_NAME": line_name}}
        result = call_method(app_instance, "imopenlines.config.add", create_payload)
        if result and result.get("result"):
            new_line_id = result["result"]
            line = Line.objects.create(
                line_id=new_line_id, portal=app_instance.portal,
                connector=connector, app_instance=app_instance, owner=request.user
            )
            entity.line = line
            entity.app_instance = app_instance
            entity.save()
            call_method(app_instance, "imconnector.activate", {
                "CONNECTOR": connector.code, "LINE": new_line_id, "ACTIVE": 1
            })
            messages.success(request, f"Создана и подключена линия {new_line_id}")
        else:
            messages.error(request, f"Ошибка при создании линии: {result}")
        return redirect(redirect_to)
    else:
        line = get_object_or_404(Line, id=line_id)
        # проверки, деактивации и привязки...
        # ...
</code></pre>

      <h2>Что в итоге</h2>
      <ul>
        <li>Единый рабочий канал в Bitrix24 без переключения между мессенджерами.</li>
        <li>История переписки и файлы привязаны к сделке.</li>
        <li>Можно отслеживать SLA и делать базовую аналитику по каналам.</li>
      </ul>

      <p><em>Продолжение следует (маршрутизация обращений, связка с телефонией и др.).</em></p>
    `,
  },
  {
    id: "b9f4ad2a-2d2d-4f2c-9d2a-5a9a1e3f7c60",
    slug: "bitrix24-connectors-whatsapp-telegram-part2",
    title:
      "WhatsApp Web и Telegram коннектор для Bitrix24: наш опыт реализации и внедрения. Часть 2 — WhatsApp и Telegram коннектор",
    date: "2025-09-06",
    views: 13000,
    cover: "/img/news/bitrix24-wa-tg-connector-part2.svg",
    excerpt:
      "Вторая часть кейса: обработчик WhatsApp Web на Evolution API, Django-модели и API для сообщений (включая медиа и локации), страницы подключения с QR и модуль интеграции Telegram с вебхуками, отправкой текста и медиа. Завершаем связкой с Открытыми линиями Bitrix24.",
    content: `
      <p>Привет, мир! Меня зовут Павел, я IT инженер и руководитель службы технической поддержки.
      Это <strong>вторая часть</strong> инструкции по внедрению коннектора WhatsApp и Telegram для Открытых линий CRM Bitrix24.
      С логикой подключения к Битрикс можно ознакомиться в <a href="https://habr.com/ru/articles/943596/" target="_blank" rel="noopener">первой части</a>, а здесь — реализация логики обмена сообщениями (WA/Telegram).</p>

      <h2>Обработчик WhatsApp Web</h2>
      <p>В качестве транспорта используем <strong>Evolution API</strong> (удобная документация и живое сообщество).
      Рекомендованный образ — <code>evoapicloud/evolution-api:v2.3.1</code> (фикс групповых чатов).</p>
      <pre><code class="language-bash"># .env Evolution API (важные параметры)
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL='https://&lt;url_коннектора&gt;/api/waweb/?api-key=XXXX'
AUTHENTICATION_API_KEY=YYY
CONFIG_SESSION_PHONE_VERSION="2.3000.1025062854"</code></pre>

      <h2>Модуль коннектора WhatsApp в веб-приложении</h2>
      <p>Создаём Django-приложение <code>waweb</code>. Базовые модели:</p>
      <pre><code class="language-python"># waweb/models.py
import uuid
from django.conf import settings
from django.db import models
from bitrix.models import AppInstance, Line

class Server(models.Model):
    url = models.URLField(max_length=255, unique=True, verbose_name="Server URL")
    api_key = models.CharField(max_length=255, verbose_name="API Key")
    max_connections = models.PositiveIntegerField(default=100)
    groups_ignore = models.BooleanField(default=True)
    always_online = models.BooleanField(default=False)
    read_messages = models.BooleanField(default=False)
    def __str__(self): return self.url

class Session(models.Model):
    session = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    server = models.ForeignKey(Server, on_delete=models.SET_NULL, related_name="sessions", null=True, blank=True)
    apikey = models.CharField(max_length=255, blank=True, null=True)
    instanceId = models.CharField(max_length=255, blank=True, null=True)
    date_end = models.DateTimeField(null=True, blank=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    groups_ignore = models.BooleanField(default=True)
    sms_service = models.BooleanField(default=True)
    status = models.CharField(max_length=15, blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    app_instance = models.ForeignKey(AppInstance, on_delete=models.SET_NULL, related_name="wawebs", null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.SET_NULL, related_name="wawebs", null=True, blank=True)
    def __str__(self): return f"Session: {self.session}, Phone: {self.phone or 'Not connected'}"</code></pre>

      <h3>API обработчик событий WhatsApp</h3>
      <p>Принимаем события от Evolution API, нормализуем payload под открытые линии Bitrix24.
      Обрабатываем текст, локации, контакты, шаблоны, медиа; защищаемся от дублей по <code>message_id</code>, работаем с группами и профилем собеседника.</p>
      <pre><code class="language-python"># waweb/api/views.py (фрагменты)
import logging, uuid, re, requests, redis
from django.conf import settings
from django.utils import timezone
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from waweb.models import Session
import waweb.tasks as tasks
import waweb.utils as utils
import bitrix.utils as bitrix_utils
import bitrix.tasks as bitrix_tasks

redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=6379, db=0)

class EventsHandler(GenericViewSet):
    def create(self, request, *args, **kwargs):
        event_data = request.data
        sessionid = event_data.get('instance')
        if not sessionid:
            return Response({'error': 'sessionId is required'})
        try:
            session = Session.objects.get(session=sessionid)
        except Session.DoesNotExist:
            return Response({'error': f'Session with sessionId {sessionid} does not exist'})
        if not session.owner:
            return Response({'error': 'Session has no owner'})

        event = event_data.get("event")
        data = event_data.get("data", {})
        apikey = event_data.get('apikey')
        if apikey and session.apikey != apikey:
            session.apikey = apikey
            session.save(update_fields=["apikey"])

        # connection.update, messages.upsert, send.message ...
        # ... извлечение профиля/группы, подготовка payload, скачивание медиа и загрузка в Bitrix Disk ...
        return Response({'message': 'ok'})

    @action(detail=False, methods=['post'], url_path=r'(?P&lt;session&gt;[^/.]+)/send')
    def send(self, request, session=None, *args, **kwargs):
        # отправка сообщений из Bitrix в WA (текст/медиа)
        return Response({'message': 'sent'})</code></pre>

      <h3>Создание инстанса и QR-подключение</h3>
      <p>Генерируем сессию, создаём инстанс на сервере Evolution API, получаем base64 QR, показываем страницу с QR и публичной ссылкой на него.
      Дополнительно — возможность повторного получения QR при 404.</p>
      <pre><code class="language-python"># waweb/views.py (фрагменты)
import uuid, redis, requests
from requests.exceptions import RequestException
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Session
redis_client = redis.StrictRedis(host=settings.REDIS_HOST, port=6379, db=0)

LINK_TTL = 60 * 60 * 24

@login_required
def qr_code_page(request, session_id):
    qr_image = request.session.pop('qr_image', '')
    try:
        session = Session.objects.get(session=session_id)
    except Session.DoesNotExist:
        messages.error(request, "Session not found.")
        return redirect('waweb')
    if not qr_image:
        qr_image = get_gr(request, session)
    if not qr_image:
        return redirect('waweb')
    public_id = redis_client.get(f"public_qr:{session_id}") or str(uuid.uuid4())
    redis_client.set(f"public_qr:{session_id}", public_id, ex=LINK_TTL)
    redis_client.set(f"public_qr:{public_id}", str(session_id), ex=LINK_TTL)
    return render(request, 'waweb/qr_code.html', {'qr_image': qr_image, 'public_id': public_id})

def get_gr(request, session):
    server = session.server
    if not server:
        messages.error(request, "Session is not attached to a server.")
        return
    # если сессия уже open — предупреждаем
    # иначе тянем QR с сервера /instance/connect/{session}
    # при 404 — пересоздаём инстанс и возвращаем qr base64
    return "..."</code></pre>

      <p>Маршруты:</p>
      <pre><code class="language-python"># waweb/urls.py
from django.urls import path
from . import views
urlpatterns = [
  path('waweb/', views.wa_sessions, name='waweb'),
  path('connect/', views.connect_number, name='connect_number'),
  path('qr/&lt;uuid:session_id&gt;/', views.qr_code_page, name='qr_code_page'),
]</code></pre>

      <h2>Модуль Telegram коннектора</h2>
      <p>Интеграция с Telegram проще (официальный API, меньше костылей). Храним токен/юзернейм бота, выставляем Webhook на свой обработчик.</p>
      <pre><code class="language-python"># telegram/models.py
import requests
from django.conf import settings
from django.db import models
from bitrix.models import AppInstance, Line

class TelegramBot(models.Model):
    bot_token = models.CharField(max_length=255, unique=True, verbose_name="Bot Token")
    bot_username = models.CharField(max_length=255, verbose_name="Bot Username", blank=True, null=True)
    receive_messages = models.BooleanField(default=True)
    send_typing_actions = models.BooleanField(default=True)
    groups_ignore = models.BooleanField(default=True)
    date_end = models.DateTimeField(null=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    app_instance = models.ForeignKey(AppInstance, on_delete=models.SET_NULL, related_name="telegrams", null=True, blank=True)
    line = models.ForeignKey(Line, on_delete=models.SET_NULL, related_name="telegrams", null=True, blank=True)
    def __str__(self): return self.bot_username
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.bot_token and self.bot_username:
            site_domain = self.app_instance.app.site.domain
            webhook_url = f"https://{site_domain}/api/telegram/{self.bot_username}/"
            requests.post(f"https://api.telegram.org/bot{self.bot_token}/setWebhook", data={"url": webhook_url})</code></pre>

      <h3>Обработчик событий Telegram</h3>
      <p>Структура аналогична WA: парсинг апдейтов, маппинг на чат в Открытой линии, пересылка текста/медиа.</p>
      <pre><code class="language-python"># telegram/api/views.py (фрагменты)
import os, tempfile, requests, redis, logging
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from rest_framework.decorators import action
from django.conf import settings
from telegram.models import TelegramBot
import bitrix.tasks as bitrix_tasks

TELEGRAM_API_BASE = "https://api.telegram.org/bot{token}"

class TelegramEventsHandler(GenericViewSet):
    def create(self, request, *args, **kwargs):
        # приём апдейтов с вебхука, маршрутизация, вложения...
        return Response({"message": "ok"})

    @action(detail=False, methods=["post"], url_path=r"(?P&lt;bot_username&gt;[^/.]+)/send")
    def send(self, request, bot_username=None, *args, **kwargs):
        # отправка сообщений в Telegram: текст и media (download → temp → multipart)
        return Response({"message": "sent"})</code></pre>

      <h3>UI: список ботов и привязка к линиям</h3>
      <p>Отдельная страница под управлением (подключение к существующим линиям / создание новой, проверки, уведомления).</p>
      <pre><code class="language-python"># telegram/views.py (фрагменты)
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.conf import settings
from bitrix.models import AppInstance, Line, Connector
from .models import TelegramBot

@login_required
def tg_bots(request):
    connector = Connector.objects.filter(service="telegram").first()
    if request.method == "POST":
        # привязка бота к линии через bitrix_utils.connect_line(...)
        return redirect('telegram')
    bots = TelegramBot.objects.filter(owner=request.user)
    instances = AppInstance.objects.filter(owner=request.user, app__connectors=connector)
    tg_lines = Line.objects.filter(connector=connector, owner=request.user)
    return render(request, 'telegram/tg_sessions.html', {"bots": bots, "instances": instances, "tg_lines": tg_lines})</code></pre>

      <h2>Итоги</h2>
      <ul>
        <li>WA: Evolution API + Django-обработчики → текст/медиа/локации/группы → Bitrix24 (Disk, OpenLines, SLA).</li>
        <li>Telegram: модель бота, вебхук, одинаковая схема пересылки, отправка текста и медиа.</li>
        <li>Админ-страницы для подключения/привязки, анти-дубли, проверка статусов сессии.</li>
      </ul>

      <p><em>В третьей части — подключение локальных приложений к Открытым линиям Bitrix24.</em></p>
    `,
  },
];





