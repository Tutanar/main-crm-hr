import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      message: string;
    };
    hasura: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      message: string;
    };
  };
  environment: {
    nodeEnv: string;
    hasuraUrl: string;
    hasJwtSecret: boolean;
    hasAdminSecret: boolean;
  };
}

// Проверка подключения к Hasura
async function checkHasuraConnection(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  message: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query HealthCheck {
            __schema {
              types {
                name
              }
            }
          }
        `,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'unhealthy',
        responseTime,
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    if (data.errors) {
      return {
        status: 'unhealthy',
        responseTime,
        message: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`,
      };
    }

    return {
      status: 'healthy',
      responseTime,
      message: 'Hasura connection successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Проверка базы данных через Hasura
async function checkDatabaseHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  message: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query DatabaseHealthCheck {
            users(limit: 1) {
              id
            }
          }
        `,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        status: 'unhealthy',
        responseTime,
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    if (data.errors) {
      return {
        status: 'unhealthy',
        responseTime,
        message: `Database query errors: ${data.errors.map((e: any) => e.message).join(', ')}`,
      };
    }

    return {
      status: 'healthy',
      responseTime,
      message: 'Database query successful',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Проверка конфигурации окружения
function checkEnvironmentConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    hasuraUrl: config.hasura.url,
    hasJwtSecret: !!config.hasura.jwtSecret && config.hasura.jwtSecret !== '{"type":"HS256","key":"default-secret-key"}',
    hasAdminSecret: !!config.hasura.adminSecret && config.hasura.adminSecret !== '',
  };
}

// Основная функция GET для проверки здоровья
export async function GET(request: NextRequest): Promise<NextResponse<HealthResponse>> {
  const timestamp = new Date().toISOString();
  
  try {
    // Проверяем все сервисы параллельно
    const [hasuraCheck, databaseCheck] = await Promise.all([
      checkHasuraConnection(),
      checkDatabaseHealth(),
    ]);

    const environment = checkEnvironmentConfig();
    
    // Определяем общий статус
    const isHealthy = hasuraCheck.status === 'healthy' && databaseCheck.status === 'healthy';
    
    const response: HealthResponse = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp,
      version: '1.0.0',
      services: {
        database: databaseCheck,
        hasura: hasuraCheck,
      },
      environment,
    };

    return NextResponse.json(response, { 
      status: isHealthy ? 200 : 503 
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp,
      version: '1.0.0',
      services: {
        database: {
          status: 'unhealthy',
          message: 'Health check failed',
        },
        hasura: {
          status: 'unhealthy',
          message: 'Health check failed',
        },
      },
      environment: checkEnvironmentConfig(),
    }, { status: 503 });
  }
}
