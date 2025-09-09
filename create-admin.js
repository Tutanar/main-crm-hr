// Создание нового администратора с улучшенным шифрованием
require('dotenv').config({ path: '.env.local' });

// Импортируем функции шифрования
const crypto = require('crypto');

// Функции шифрования (копируем из encryption.ts)
function generateSalt() {
  return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password, salt) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  return hash.toString('hex');
}

function createPasswordHash(password) {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  return { hash, salt };
}

function generateSecurePassword(length = 16) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  return password;
}

function validatePasswordStrength(password) {
  const feedback = [];
  let score = 0;
  
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
    feedback.push('Пароль должен содержать минимум 12 символов');
  } else {
    feedback.push('Пароль слишком короткий');
  }
  
  if (/[A-Z]/.test(password)) score += 1; else feedback.push('Добавьте заглавные буквы');
  if (/[a-z]/.test(password)) score += 1; else feedback.push('Добавьте строчные буквы');
  if (/\d/.test(password)) score += 1; else feedback.push('Добавьте цифры');
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1; else feedback.push('Добавьте специальные символы');
  if (!/(.)\1{2,}/.test(password)) score += 1; else feedback.push('Избегайте повторяющихся символов');
  
  const isValid = score >= 5;
  if (isValid) feedback.push('Пароль достаточно сложный');
  
  return { isValid, score, feedback };
}

const HASURA_URL = process.env.HASURA_URL || 'https://api.skyr1m-f0r-n0rds.sbs/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET || '';

async function createNewAdmin() {
  console.log('🔐 Создание нового администратора...');
  
  // Данные нового администратора
  const adminData = {
    email: 'admin@company.com',
    full_name: 'Admin Sony Ericson',
    role: 'admin',
    is_active: true,
    is_email_verified: true
  };
  
  // Генерируем безопасный пароль
  const password = generateSecurePassword(16);
  console.log('🔑 Сгенерированный пароль:', password);
  
  // Проверяем сложность пароля
  const passwordValidation = validatePasswordStrength(password);
  console.log('📊 Оценка пароля:', passwordValidation.score, '/ 6');
  console.log('📝 Отзыв о пароле:', passwordValidation.feedback.join(', '));
  
  if (!passwordValidation.isValid) {
    console.log('❌ Пароль не соответствует требованиям безопасности');
    return;
  }
  
  // Создаем хеш пароля
  const { hash, salt } = createPasswordHash(password);
  console.log('🔒 Хеш пароля создан');
  console.log('🧂 Соль:', salt);
  
  try {
    // Создаем пользователя в базе данных
    const response = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: `
          mutation CreateAdmin($email: String!, $full_name: String!, $password_hash: String!, $password_salt: String!, $role: String!, $is_active: Boolean!, $is_email_verified: Boolean!) {
            insert_users(objects: [{
              email: $email,
              full_name: $full_name,
              password_hash: $password_hash,
              password_salt: $password_salt,
              role: $role,
              is_active: $is_active,
              is_email_verified: $is_email_verified
            }]) {
              returning {
                id
                email
                full_name
                role
                is_active
                is_email_verified
                created_at
              }
            }
          }
        `,
        variables: {
          email: adminData.email,
          full_name: adminData.full_name,
          password_hash: hash,
          password_salt: salt,
          role: adminData.role,
          is_active: adminData.is_active,
          is_email_verified: adminData.is_email_verified
        }
      }),
    });

    if (!response.ok) {
      console.log('❌ Ошибка при создании администратора');
      const errorData = await response.json();
      console.log('Error:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    
    if (data.errors) {
      console.log('❌ GraphQL ошибки:', JSON.stringify(data.errors, null, 2));
      return;
    }
    
    const admin = data.data?.insert_users?.returning?.[0];
    
    if (admin) {
      console.log('✅ Администратор успешно создан!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Полное имя:', admin.full_name);
      console.log('🔑 Пароль:', password);
      console.log('🆔 ID:', admin.id);
      console.log('📅 Создан:', admin.created_at);
      
      console.log('\n🔐 Данные для входа:');
      console.log('Email:', admin.email);
      console.log('Пароль:', password);
      console.log('\n⚠️  ВАЖНО: Сохраните пароль в безопасном месте!');
      
    } else {
      console.log('❌ Не удалось создать администратора');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

createNewAdmin();
