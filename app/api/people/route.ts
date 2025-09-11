import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { Person } from '@/types';

interface PeopleResponse {
  success: boolean;
  data?: Person[];
  total?: number;
  error?: string;
  timestamp: string;
}

function parseParams(searchParams: URLSearchParams): {
  type: 'candidates' | 'employees';
  page: number;
  limit: number;
  search?: string;
  error?: string;
} {
  let type: 'candidates' | 'employees' = 'candidates';
  const typeParam = (searchParams.get('type') || '').toLowerCase();
  const employeeTypeId = searchParams.get('employee_type_id');
  if (typeParam === 'employees' || typeParam === 'employee') type = 'employees';
  if (typeParam === 'candidates' || typeParam === 'candidate') type = 'candidates';
  if (employeeTypeId === '2') type = 'employees';
  if (employeeTypeId === '1') type = 'candidates';

  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || '20')));
  const searchRaw = (searchParams.get('search') || '').trim();
  const search = searchRaw ? searchRaw : undefined;
  if (search && search.length > 100) return { type, page, limit, error: 'Search term too long (max 100)' };
  return { type, page, limit, search };
}

function buildQuery(entity: 'candidates' | 'employees', search: string | undefined, page: number, limit: number): string {
  const where: string[] = [];
  if (search) where.push(`name: { _ilike: "%${search}%" }`);
  const whereClause = where.length ? `where: { ${where.join(', ')} }` : '';
  const offset = (page - 1) * limit;
  const aggregate = entity === 'candidates' ? 'candidates_aggregate' : 'employees_aggregate';
  const aggregateArgs = whereClause ? `(${whereClause})` : '';
  return `
    query GetPeople {
      ${entity}(
        ${whereClause}
        order_by: [{ created_at: desc }, { id: desc }]
        limit: ${limit}
        offset: ${offset}
      ) {
        id
        name
        phone
        registration_date
        status_code
        status_name
        employee_type_code
        employee_type_name
        comment
        last_comment_date
        segment_code
        segment_name
        team_code
        team_name
        language_code
        language_name
        source_code
        source_name
        created_at
        updated_at
      }
      ${aggregate}${aggregateArgs} { aggregate { count } }
    }
  `;
}

export async function GET(request: NextRequest): Promise<NextResponse<PeopleResponse>> {
  const timestamp = new Date().toISOString();
  try {
    const { searchParams } = new URL(request.url);
    const params = parseParams(searchParams);
    if (params.error) {
      return NextResponse.json({ success: false, error: params.error, timestamp }, { status: 400 });
    }

    const query = buildQuery(params.type, params.search, params.page, params.limit);
    const response = await fetch(config.hasura.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': config.hasura.adminSecret,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: `Database query failed: HTTP ${response.status}`, timestamp }, { status: 500 });
    }

    const data = await response.json();
    if (data.errors) {
      return NextResponse.json({ success: false, error: `GraphQL errors: ${data.errors.map((e: any) => e.message).join(', ')}`, timestamp }, { status: 500 });
    }

    const list = data.data?.[params.type] || [];
    const total = data.data?.[`${params.type}_aggregate`]?.aggregate?.count || 0;

    const people: Person[] = list.map((p: any) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      registration_date: p.registration_date,
      status_code: p.status_code,
      status_name: p.status_name,
      employee_type_code: p.employee_type_code,
      employee_type_name: p.employee_type_name,
      comment: p.comment,
      last_comment_date: p.last_comment_date,
      segment_code: p.segment_code,
      segment_name: p.segment_name,
      team_code: p.team_code,
      team_name: p.team_name,
      language_code: p.language_code,
      language_name: p.language_name,
      source_code: p.source_code,
      source_name: p.source_name,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    return NextResponse.json({ success: true, data: people, total, timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error', timestamp }, { status: 500 });
  }
}

