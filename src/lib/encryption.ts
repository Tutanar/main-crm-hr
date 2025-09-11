import crypto from 'crypto';

// Конфигурация шифрования
const ENCRYPTION_CONFIG = {
  // Алгоритм хеширования
  algorithm: 'sha512',
  // Количество итераций для PBKDF2
  iterations: 100000,
  // Длина ключа в байтах
  keyLength: 64,
  // Длина соли в байтах
  saltLength: 32,
  // Длина IV в байтах
  ivLength: 16,
};

/**
 * Генерирует случайную соль
 */
export function generateSalt(): string {
  return crypto.randomBytes(ENCRYPTION_CONFIG.saltLength).toString('hex');
}

/**
 * Генерирует случайный IV для AES
 */
export function generateIV(): string {
  return crypto.randomBytes(ENCRYPTION_CONFIG.ivLength).toString('hex');
}

/**
 * Хеширует пароль с солью используя PBKDF2
 */
export function hashPassword(password: string, salt: string): string {
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    ENCRYPTION_CONFIG.iterations,
    ENCRYPTION_CONFIG.keyLength,
    ENCRYPTION_CONFIG.algorithm
  );
  
  return hash.toString('hex');
}

/**
 * Проверяет пароль против хеша
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const passwordHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(passwordHash, 'hex')
  );
}

/**
 * Создает хеш пароля с автоматической генерацией соли
 */
export function createPasswordHash(password: string): { hash: string; salt: string } {
  const salt = generateSalt();
  const hash = hashPassword(password, salt);
  
  return { hash, salt };
}

/**
 * Шифрует данные с помощью AES-256-GCM
 */
export function encryptData(data: string, key: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(ENCRYPTION_CONFIG.ivLength);
  const cipher = crypto.createCipher('aes-256-gcm', Buffer.from(key, 'hex'));
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

/**
 * Расшифровывает данные с помощью AES-256-GCM
 */
export function decryptData(encryptedData: string, key: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipher('aes-256-gcm', Buffer.from(key, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Генерирует безопасный случайный пароль
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Проверяет сложность пароля
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Длина пароля
  if (password.length >= 12) {
    score += 2;
  } else if (password.length >= 8) {
    score += 1;
    feedback.push('Пароль должен содержать минимум 12 символов');
  } else {
    feedback.push('Пароль слишком короткий');
  }
  
  // Содержит заглавные буквы
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте заглавные буквы');
  }
  
  // Содержит строчные буквы
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте строчные буквы');
  }
  
  // Содержит цифры
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте цифры');
  }
  
  // Содержит специальные символы
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Добавьте специальные символы');
  }
  
  // Не содержит общие паттерны
  if (!/(.)\1{2,}/.test(password)) {
    score += 1;
  } else {
    feedback.push('Избегайте повторяющихся символов');
  }
  
  const isValid = score >= 5;
  
  if (isValid) {
    feedback.push('Пароль достаточно сложный');
  }
  
  return { isValid, score, feedback };
}

/**
 * Создает токен для сброса пароля
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Создает токен для подтверждения email
 */
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(24).toString('hex');
}
