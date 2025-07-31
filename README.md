# LO-FI study

Приложение для фонового прослушивания lo-fi музыки и радио. Идеально подходит для учёбы, работы или релаксации.

**Особенности:**

- Плеер с lo-fi треками
- Радиостанции в реальном времени
- Минималистичный интерфейс
- Работает через Yandex Music API

## Разделы

1. [Установка](#installation)
2. [Настройка](#configuration)
3. [Запуск](#starting)
4. [Скриншоты](#screenshots)

## 📦 Установка <a id="installation"></a>

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/animeybe/LO-FIstudy.git
   ```
2. Установите зависимости для фронтенда:
   cd lofi-study/
   npm install
3. Установите зависимости для бэкенда:
   cd src/services/yandex-music-proxy/
   npm install

## ⚙ Настройка <a id="configuration"></a>

1. Создайте файл `.env` в папке `yandex-music-proxy/`:
   ```env
   YANDEX_MUSIC_TOKEN=ваш_токен
   YANDEX_UID=ваш_uid
   PORT=3001
   ```
2. Получите токен [здесь](https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d) и идентификатор [здесь](https://mail.yandex.ru/).
   P.s. Смотри в адресной строке

## 🚀 Запуск <a id="starting"></a>

### Backend (Yandex Music Proxy):

Перейдём в директорию сервера:

```bash
cd /src/services/yandex-music-proxy
```

Запускаем север:

```bash
node yandex-music-proxy.js
```

или же

```bash
nodemon yandex-music-proxy.js
```

### Frontend (Веб-приложение):

Перейдём в директорию проекта:

```bash
cd lofi-study/
```

Запускаем сайт:

```bash
npm run dev
```

## 🖼 Скриншоты <a id="screenshots"></a>

(ПОКА ПУСТО)
