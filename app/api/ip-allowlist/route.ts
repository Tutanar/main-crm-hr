import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

// GET - получить список IP адресов
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          query GetIpAllowlist {
            ip_allowlist(order_by: { created_at: desc }) {
              id
              ip_address
              description
              is_active
              created_at
              created_by
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch IP allowlist',
          errorCode: 'IP_001'
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          errorCode: 'IP_002',
          details: data.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data?.ip_allowlist || []
    });

  } catch (error) {
    console.error('IP allowlist fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        errorCode: 'IP_003'
      },
      { status: 500 }
    );
  }
}

// POST - добавить новый IP адрес
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ip_address, description } = body;

    // Валидация
    if (!ip_address || typeof ip_address !== 'string') {
      return NextResponse.json(
        { 
          error: 'IP address is required',
          errorCode: 'IP_004'
        },
        { status: 400 }
      );
    }

    // Простая валидация IP адреса или CIDR
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!ipRegex.test(ip_address)) {
      return NextResponse.json(
        { 
          error: 'Invalid IP address format',
          errorCode: 'IP_005'
        },
        { status: 400 }
      );
    }

    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          mutation InsertIpAllowlist($ip_address: String!, $description: String) {
            insert_ip_allowlist_one(object: {
              ip_address: $ip_address,
              description: $description,
              is_active: true
            }) {
              id
              ip_address
              description
              is_active
              created_at
              created_by
            }
          }
        `,
        variables: {
          ip_address,
          description: description || null
        }
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to create IP allowlist entry',
          errorCode: 'IP_006'
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          errorCode: 'IP_007',
          details: data.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data?.insert_ip_allowlist_one
    });

  } catch (error) {
    console.error('IP allowlist create error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        errorCode: 'IP_008'
      },
      { status: 500 }
    );
  }
}

// PUT - обновить IP адрес
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ip_address, description, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { 
          error: 'ID is required',
          errorCode: 'IP_009'
        },
        { status: 400 }
      );
    }

    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          mutation UpdateIpAllowlist($id: uuid!, $ip_address: String, $description: String, $is_active: Boolean) {
            update_ip_allowlist_by_pk(
              pk_columns: { id: $id },
              _set: {
                ip_address: $ip_address,
                description: $description,
                is_active: $is_active
              }
            ) {
              id
              ip_address
              description
              is_active
              created_at
              created_by
            }
          }
        `,
        variables: {
          id,
          ip_address: ip_address || undefined,
          description: description || undefined,
          is_active: is_active !== undefined ? is_active : undefined
        }
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to update IP allowlist entry',
          errorCode: 'IP_010'
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          errorCode: 'IP_011',
          details: data.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data?.update_ip_allowlist_by_pk
    });

  } catch (error) {
    console.error('IP allowlist update error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        errorCode: 'IP_012'
      },
      { status: 500 }
    );
  }
}

// DELETE - удалить IP адрес
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          error: 'ID is required',
          errorCode: 'IP_013'
        },
        { status: 400 }
      );
    }

    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({
        query: `
          mutation DeleteIpAllowlist($id: uuid!) {
            delete_ip_allowlist_by_pk(id: $id) {
              id
              ip_address
            }
          }
        `,
        variables: { id }
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to delete IP allowlist entry',
          errorCode: 'IP_014'
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          errorCode: 'IP_015',
          details: data.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data?.delete_ip_allowlist_by_pk
    });

  } catch (error) {
    console.error('IP allowlist delete error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        errorCode: 'IP_016'
      },
      { status: 500 }
    );
  }
}
