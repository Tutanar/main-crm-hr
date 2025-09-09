# Настройка новой схемы пользователей в Hasura

## Проблема
Таблица `users` была создана в базе данных, но не зарегистрирована в Hasura Console.

## Решение

### 1. Откройте Hasura Console
Перейдите по адресу: `https://api.skyr1m-f0r-n0rds.sbs/console`

### 2. Зарегистрируйте таблицу users
1. Перейдите в раздел **Data**
2. Нажмите **Track All** или **Track Table**
3. Найдите таблицу `users` и нажмите **Track**
4. Убедитесь, что все поля отображаются правильно

### 3. Настройте разрешения
1. Перейдите в **Data → users → Permissions**
2. Настройте разрешения для ролей:
   - **admin**: полный доступ (select, insert, update, delete)
   - **chief-hr**: select, insert, update
   - **hr**: select

### 4. Проверьте схему
После регистрации таблица должна появиться в GraphQL схеме.

## Структура новой таблицы users

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'chief-hr', 'hr')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMPTZ,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);
```

## Новые возможности

### 🔐 Улучшенное шифрование
- **PBKDF2-SHA512** с 100,000 итераций
- **Соль** для каждого пароля
- **Валидация сложности** паролей

### 📧 Логин по email
- Вместо username используется email
- Email должен быть уникальным
- Поддержка подтверждения email

### 👤 Полное имя
- Поле `full_name` для отображения
- Пример: "Admin Sony Ericson"

### 🔒 Дополнительная безопасность
- Блокировка аккаунта после неудачных попыток
- Токены для сброса пароля
- Токены для подтверждения email
- Отслеживание попыток входа

## После настройки Hasura

Запустите создание администратора:
```bash
node create-admin.js
```

Это создаст нового администратора с:
- Email: `admin@company.com`
- Полное имя: `Admin Sony Ericson`
- Безопасный пароль (16 символов)
- Роль: `admin`
