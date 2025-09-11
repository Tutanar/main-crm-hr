# Настройка Hasura для CRM-HR

## 1. Создание таблицы users в Hasura

Выполните следующий SQL в Hasura Console:

```sql
-- Создание таблицы users для аутентификации
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'chief-hr', 'hr')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Создание индексов для оптимизации
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Вставка тестового админа (пароль: admin123)
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  'admin', 
  'admin@company.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'admin'
);
```

## 2. Настройка переменных окружения

Создайте файл `.env.local` на основе `env.example`:

```bash
# Hasura Configuration
HASURA_URL=http://localhost:8080/v1/graphql
HASURA_ADMIN_SECRET=your_admin_secret_here
HASURA_GRAPHQL_JWT_SECRET={"type":"HS256","key":"your_jwt_secret_key_here"}

# Application Configuration
NEXT_PUBLIC_HASURA_URL=http://localhost:8080/v1/graphql
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Настройка JWT в Hasura

1. Откройте Hasura Console
2. Перейдите в Settings → Environment Variables
3. Установите `HASURA_GRAPHQL_JWT_SECRET`:
   ```json
   {
     "type": "HS256",
     "key": "your-secret-key-here"
   }
   ```

## 4. Настройка разрешений (Permissions)

В Hasura Console настройте разрешения для таблицы `users`:

### Для роли `admin`:
- Select: Allow all
- Insert: Allow all
- Update: Allow all
- Delete: Allow all

### Для роли `chief-hr`:
- Select: Allow all
- Insert: Allow all
- Update: Allow all
- Delete: Deny all

### Для роли `hr`:
- Select: Allow all
- Insert: Allow all
- Update: Allow all
- Delete: Deny all

## 5. Тестирование

1. Запустите приложение: `npm run dev`
2. Перейдите на `/hasura-test` для тестирования подключения
3. Попробуйте войти с учетными данными:
   - Username: `admin`
   - Password: `admin123`

## 6. Создание дополнительных пользователей

Для создания пользователей с другими ролями:

```sql
-- Создание пользователя chief-hr
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  'chief-hr', 
  'chief-hr@company.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'chief-hr'
);

-- Создание пользователя hr
INSERT INTO users (username, email, password_hash, role) 
VALUES (
  'hr', 
  'hr@company.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
  'hr'
);
```

## 7. Структура JWT токена

JWT токен содержит следующие claims:
```json
{
  "sub": "user_id",
  "role": "admin|chief-hr|hr",
  "username": "username",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 8. Troubleshooting

### Ошибка подключения к Hasura
- Проверьте, что Hasura запущен на правильном порту
- Убедитесь, что `HASURA_URL` указан правильно
- Проверьте, что `HASURA_ADMIN_SECRET` совпадает с настройками Hasura

### Ошибка аутентификации
- Убедитесь, что таблица `users` создана
- Проверьте, что пользователь существует и активен
- Убедитесь, что пароль хеширован правильно (bcrypt)

### Ошибка JWT
- Проверьте, что `HASURA_GRAPHQL_JWT_SECRET` настроен правильно
- Убедитесь, что ключ JWT совпадает в Hasura и приложении
