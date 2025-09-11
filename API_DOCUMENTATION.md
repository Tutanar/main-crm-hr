# API Документация CRM-HR

## Обзор

API построен на Next.js App Router с полной интеграцией Hasura GraphQL. Все endpoints возвращают JSON с единообразной структурой ответов.

## Базовый URL

```
http://localhost:3000/api
```

## Аутентификация

API использует JWT токены для аутентификации. Токен должен передаваться в заголовке `Authorization: Bearer <token>`.

## Endpoints

### 1. POST /api/login

Аутентификация пользователя в системе.

#### Запрос

```json
{
  "username": "admin",
  "password": "admin123"
}
```

#### Успешный ответ (200)

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@company.com",
    "role": "admin",
    "is_active": true
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Ошибки

- **400 Bad Request**: Неверные входные данные
- **401 Unauthorized**: Неверные учетные данные
- **503 Service Unavailable**: База данных недоступна
- **500 Internal Server Error**: Внутренняя ошибка сервера

#### Примеры ошибок

```json
{
  "success": false,
  "error": "Username is required and must be a string",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. POST /api/validate

Валидация JWT токена.

#### Запрос

```
Authorization: Bearer <token>
```

#### Успешный ответ (200)

```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Ошибки

- **401 Unauthorized**: Токен недействителен или истек
- **500 Internal Server Error**: Внутренняя ошибка сервера

### 3. GET /api/me

Получение данных текущего пользователя.

#### Запрос

```
Authorization: Bearer <token>
```

#### Успешный ответ (200)

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@company.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "created_by": null,
    "last_login": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Ошибки

- **401 Unauthorized**: Токен недействителен или истек
- **404 Not Found**: Пользователь не найден
- **503 Service Unavailable**: База данных недоступна
- **500 Internal Server Error**: Внутренняя ошибка сервера

### 4. POST /api/me

Обновление данных текущего пользователя.

#### Запрос

```
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@company.com"
}
```

#### Успешный ответ (200)

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "newemail@company.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:30:00.000Z",
    "created_by": null,
    "last_login": "2024-01-01T12:00:00.000Z"
  },
  "timestamp": "2024-01-01T12:30:00.000Z"
}
```

#### Ошибки

- **400 Bad Request**: Неверные данные для обновления
- **401 Unauthorized**: Токен недействителен или истек
- **404 Not Found**: Пользователь не найден
- **500 Internal Server Error**: Внутренняя ошибка сервера

### 5. GET /api/health

Проверка здоровья системы и базы данных.

#### Запрос

```
GET /api/health
```

#### Успешный ответ (200)

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "responseTime": 45,
      "message": "Database query successful"
    },
    "hasura": {
      "status": "healthy",
      "responseTime": 32,
      "message": "Hasura connection successful"
    }
  },
  "environment": {
    "nodeEnv": "development",
    "hasuraUrl": "http://localhost:8080/v1/graphql",
    "hasJwtSecret": true,
    "hasAdminSecret": true
  }
}
```

#### Ошибка (503)

```json
{
  "status": "unhealthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "unhealthy",
      "responseTime": 5000,
      "message": "Connection timeout"
    },
    "hasura": {
      "status": "unhealthy",
      "responseTime": 5000,
      "message": "Connection timeout"
    }
  },
  "environment": {
    "nodeEnv": "development",
    "hasuraUrl": "http://localhost:8080/v1/graphql",
    "hasJwtSecret": true,
    "hasAdminSecret": false
  }
}
```

## Коды ошибок

### HTTP Status Codes

- **200 OK**: Успешный запрос
- **400 Bad Request**: Неверные входные данные
- **401 Unauthorized**: Ошибка аутентификации
- **403 Forbidden**: Недостаточно прав
- **404 Not Found**: Ресурс не найден
- **500 Internal Server Error**: Внутренняя ошибка сервера
- **503 Service Unavailable**: Сервис недоступен

### Детальные коды ошибок

API возвращает детальные коды ошибок в поле `errorCode` для точной диагностики проблем:

#### Аутентификация (AUTH_*)
- **AUTH_001**: Отсутствует заголовок авторизации
- **AUTH_002**: Неверный формат токена
- **AUTH_003**: Токен истек
- **AUTH_004**: Неверная подпись токена
- **AUTH_005**: Токен еще не активен
- **AUTH_006**: Неверные данные в токене

#### Пользователь (USER_*)
- **USER_001**: Пользователь не найден
- **USER_002**: Пользователь неактивен
- **USER_003**: Данные пользователя повреждены
- **USER_004**: Неверная роль пользователя

#### База данных (DB_*)
- **DB_001**: Ошибка подключения к базе данных
- **DB_002**: Ошибка запроса к базе данных
- **DB_003**: Таймаут базы данных
- **DB_004**: Нет прав доступа к базе данных
- **DB_005**: Нарушение ограничений базы данных

#### Система (SYS_*)
- **SYS_001**: Внутренняя ошибка сервера
- **SYS_002**: Ошибка конфигурации
- **SYS_003**: Сервис недоступен
- **SYS_004**: Превышен лимит запросов

#### Валидация (VAL_*)
- **VAL_001**: Неверный формат запроса
- **VAL_002**: Отсутствуют обязательные поля
- **VAL_003**: Неверные значения полей
- **VAL_004**: Запрос слишком большой

### Типы ошибок

#### Валидация входных данных
- `Username is required and must be a string`
- `Password is required and must be a string`
- `Username cannot be empty`
- `Password cannot be empty`
- `Username is too long (max 255 characters)`
- `Password is too long (max 255 characters)`
- `Invalid characters detected in input`

#### Аутентификация
- `Invalid credentials`
- `User not found or inactive`
- `Token expired`
- `Invalid token format`
- `Token validation failed`

#### База данных
- `Database is unhealthy: Connection timeout`
- `Database query failed: HTTP 500`
- `GraphQL errors: Permission denied`
- `Connection error: ECONNREFUSED`

#### Система
- `Internal server error`
- `Invalid JSON in request body`
- `Failed to create authentication token`
- `Password verification failed`

## Безопасность

### Защита от SQL Injection
API включает базовую защиту от SQL injection атак:
- Валидация входных данных
- Проверка на опасные символы
- Использование параметризованных запросов через GraphQL

### Валидация JWT
- Проверка подписи токена
- Проверка срока действия
- Проверка обязательных полей
- Валидация пользователя в базе данных

### Rate Limiting
Рекомендуется добавить rate limiting для предотвращения брутфорс атак.

## Мониторинг

### Health Check
Используйте `/api/health` для мониторинга состояния системы:
- Проверка подключения к Hasura
- Проверка доступности базы данных
- Валидация конфигурации
- Измерение времени отклика

### Логирование
Все ошибки логируются в консоль сервера с подробной информацией для отладки.

## Примеры использования

### JavaScript/TypeScript

```typescript
// Логин
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();

if (loginData.success) {
  const token = loginData.token;
  // Сохранить токен и использовать для последующих запросов
}

// Валидация токена
const validateResponse = await fetch('/api/validate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const validateData = await validateResponse.json();

// Проверка здоровья
const healthResponse = await fetch('/api/health');
const healthData = await healthResponse.json();
```

### cURL

```bash
# Логин
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Валидация токена
curl -X POST http://localhost:3000/api/validate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# Проверка здоровья
curl http://localhost:3000/api/health
```

## Конфигурация

### Переменные окружения

```env
HASURA_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=your_admin_secret_here
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your_jwt_secret_key_here"}
NEXT_PUBLIC_HASURA_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### JWT Secret Format

```json
{
  "type": "HS256",
  "key": "your-secret-key-here"
}
```
