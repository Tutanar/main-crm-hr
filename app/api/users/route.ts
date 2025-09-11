import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface UsersResponse {
  success: boolean;
  data?: any[];
  error?: string;
  timestamp: string;
}

interface UpdateUserRequest {
  id: string;
  is_active: boolean;
}

// Build GraphQL query to fetch users list
function buildUsersQuery(): string {
  return `
    query GetUsers {
      users(order_by: { created_at: desc }) {
        id
        email
        full_name
        role
        is_active
        is_email_verified
        last_login
        login_attempts
        locked_until
        created_at
        updated_at
      }
    }
  `;
}

export async function GET(): Promise<NextResponse<UsersResponse>> {
  const timestamp = new Date().toISOString();
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({ query: buildUsersQuery() }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Database query failed: HTTP ${response.status}`, timestamp }, { status: 500 });
    }

    const data = await response.json();
    if (data.errors) {
      return NextResponse.json({ success: false, error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`, timestamp }, { status: 500 });
    }

    const rows = data.data?.users || [];
    const mapped = rows.map((u: any) => ({
      id: u.id,
      username: u.full_name || (u.email ? u.email.split('@')[0] : u.id),
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      is_email_verified: u.is_email_verified,
      last_login: u.last_login,
      login_attempts: u.login_attempts,
      locked_until: u.locked_until,
      created_at: u.created_at,
      updated_at: u.updated_at,
      full_name: u.full_name,
    }));

    return NextResponse.json({ success: true, data: mapped, timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error', timestamp }, { status: 500 });
  }
}

// Update user active status
export async function PUT(request: NextRequest): Promise<NextResponse<UsersResponse>> {
  const timestamp = new Date().toISOString();
  try {
    const body = (await request.json()) as UpdateUserRequest;
    if (!body?.id || typeof body.is_active !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid body: id and is_active required', timestamp }, { status: 400 });
    }

    const mutation = `
      mutation UpdateUserStatus($id: uuid!, $is_active: Boolean!) {
        update_users_by_pk(pk_columns: { id: $id }, _set: { is_active: $is_active }) {
          id
          is_active
          updated_at
        }
      }
    `;

    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({ query: mutation, variables: { id: body.id, is_active: body.is_active } }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Database mutation failed: HTTP ${response.status}` , timestamp}, { status: 500 });
    }

    const data = await response.json();
    if (data.errors) {
      return NextResponse.json({ success: false, error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`, timestamp }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data.data?.update_users_by_pk ? [data.data.update_users_by_pk] : [], timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error', timestamp }, { status: 500 });
  }
}

