# IP Allowlist Setup

## Обзор

Система IP allowlist защищает приложение от несанкционированного доступа, проверяя IP адреса пользователей против разрешенного списка. Если IP адрес не найден в списке, пользователь видит белый экран с сообщением об отказе в доступе.

## Компоненты системы

### 1. Middleware (`middleware.ts`)
- Проверяет каждый запрос на соответствие IP allowlist
- Поддерживает точные IP адреса и CIDR блоки
- Возвращает белый экран для неразрешенных IP
- Логирует все попытки доступа

### 2. API Routes (`/api/ip-allowlist`)
- `GET` - получение списка IP адресов
- `POST` - добавление нового IP адреса
- `PUT` - обновление существующего IP адреса
- `DELETE` - удаление IP адреса

### 3. Database Table (`ip_allowlist`)
- Хранит IP адреса, описания и статус активности
- Поддерживает CIDR нотацию для блоков IP
- Включает RLS (Row Level Security) для безопасности

## Установка

### 1. Создание таблицы в Hasura

Выполните SQL скрипт из файла `database/ip_allowlist_table.sql`:

```sql
-- Создание таблицы ip_allowlist
CREATE TABLE ip_allowlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT ip_allowlist_ip_address_check CHECK (ip_address ~ '^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$')
);

-- Вставка ваших IP адресов
INSERT INTO ip_allowlist (ip_address, description, is_active) VALUES
('103.228.170.175', 'Основной IP адрес', true),
('212.34.152.216', 'Резервный IP адрес', true);
```

### 2. Настройка переменных окружения

Убедитесь, что в `.env` файле настроены:

```env
HASURA_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=your_admin_secret
```

### 3. Настройка RLS в Hasura

1. Откройте Hasura Console
2. Перейдите в Data → ip_allowlist
3. Включите RLS (Row Level Security)
4. Создайте политики доступа:
   - **Read**: Все могут читать активные IP адреса
   - **Insert/Update/Delete**: Только администраторы

## Использование

### Добавление IP адреса

```bash
curl -X POST http://localhost:3000/api/ip-allowlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "ip_address": "192.168.1.0/24",
    "description": "Офисная сеть"
  }'
```

### Обновление статуса IP адреса

```bash
curl -X PUT http://localhost:3000/api/ip-allowlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id": "uuid-here",
    "is_active": false
  }'
```

### Удаление IP адреса

```bash
curl -X DELETE "http://localhost:3000/api/ip-allowlist?id=uuid-here" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Поддерживаемые форматы IP

### Точные IP адреса
- `192.168.1.100`
- `10.0.0.1`
- `203.0.113.1`

### CIDR блоки
- `192.168.1.0/24` - вся подсеть 192.168.1.x
- `10.0.0.0/8` - вся сеть 10.x.x.x
- `203.0.113.0/28` - блок из 16 IP адресов

## Безопасность

### Middleware защита
- Проверяет каждый HTTP запрос
- Игнорирует API routes и статические файлы
- Возвращает 403 Forbidden для неразрешенных IP

### База данных
- RLS ограничивает доступ к данным
- Только администраторы могут управлять IP списком
- Валидация формата IP адресов

### Логирование
- Все попытки доступа логируются
- Успешные и неудачные попытки отслеживаются
- IP адреса записываются в консоль

## Тестирование

### Проверка доступа
1. Откройте приложение с разрешенного IP
2. Должна загрузиться обычная страница
3. Попробуйте открыть с неразрешенного IP
4. Должен появиться белый экран с сообщением об отказе

### Проверка API
```bash
# Тест получения списка IP
curl http://localhost:3000/api/ip-allowlist

# Тест добавления IP (требует авторизации)
curl -X POST http://localhost:3000/api/ip-allowlist \
  -H "Content-Type: application/json" \
  -d '{"ip_address": "1.2.3.4", "description": "Test IP"}'
```

## Мониторинг

### Логи middleware
```bash
# В консоли приложения будут видны:
Checking IP access for: 192.168.1.100 on path: /
Access granted for IP: 192.168.1.100

# Или для неразрешенных IP:
Checking IP access for: 1.2.3.4 on path: /
Access denied for IP: 1.2.3.4
```

### Статистика доступа
- Количество разрешенных запросов
- Количество заблокированных запросов
- Популярные IP адреса

## Troubleshooting

### Проблема: IP не распознается
**Решение**: Проверьте заголовки `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`

### Проблема: CIDR блок не работает
**Решение**: Убедитесь, что формат правильный (например, `192.168.1.0/24`)

### Проблема: Middleware не срабатывает
**Решение**: Проверьте переменные окружения `HASURA_URL` и `HASURA_ADMIN_SECRET`

### Проблема: API возвращает ошибки
**Решение**: Убедитесь, что таблица `ip_allowlist` создана и RLS настроен правильно

## Обновление IP списка

### Через веб-интерфейс
1. Войдите как администратор
2. Перейдите в Admin → IP Allowlist
3. Добавьте, отредактируйте или удалите IP адреса

### Через API
```bash
# Добавить новый IP
curl -X POST http://localhost:3000/api/ip-allowlist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"ip_address": "NEW_IP", "description": "Description"}'
```

## Важные замечания

1. **Всегда добавляйте свои IP адреса** перед развертыванием
2. **Тестируйте с разных IP** для проверки работы
3. **Мониторьте логи** для выявления проблем
4. **Регулярно обновляйте** список разрешенных IP
5. **Используйте CIDR блоки** для экономии места в списке
