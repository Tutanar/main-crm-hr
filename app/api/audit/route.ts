import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

interface AuditResponse {
  success: boolean;
  data?: any[];
  error?: string;
  timestamp: string;
}

function buildAuditQuery(): string {
  return `
    query GetAuditLogs {
      audit_log(order_by: { created_at: desc }, limit: 500) {
        id
        user_id
        action
        table_name
        record_id
        old_values
        new_values
        ip_address
        user_agent
        created_at
      }
    }
  `;
}

export async function GET(): Promise<NextResponse<AuditResponse>> {
  const timestamp = new Date().toISOString();
  try {
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({ query: buildAuditQuery() }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Database query failed: HTTP ${response.status}`, timestamp }, { status: 500 });
    }

    const data = await response.json();
    if (data.errors) {
      return NextResponse.json({ success: false, error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`, timestamp }, { status: 500 });
    }

    const rows = data.data?.audit_log || [];
    return NextResponse.json({ success: true, data: rows, timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error', timestamp }, { status: 500 });
  }
}

