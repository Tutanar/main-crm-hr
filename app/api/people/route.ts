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
  const rawLimit = searchParams.get('limit');
  const limit = rawLimit === 'all'
    ? 1000
    : Math.min(1000, Math.max(1, Number(rawLimit || '100')));
  const searchRaw = (searchParams.get('search') || '').trim();
  const search = searchRaw ? searchRaw : undefined;
  if (search && search.length > 100) return { type, page, limit, error: 'Search term too long (max 100)' };
  return { type, page, limit, search };
}

async function fetchTypeId(typeCode: 'EMPLOYEE' | 'CANDIDATE'): Promise<number | null> {
  const query = `query GetTypeId { employee_types(where: { code: { _eq: "${typeCode}" } }) { id } }`;
  const response = await fetch(config.hasura.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': config.hasura.adminSecret,
    },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  const id = data?.data?.employee_types?.[0]?.id;
  return typeof id === 'number' ? id : null;
}

function buildPeopleAndRefsQuery(typeId: number, search: string | undefined, page: number, limit: number): string {
  const whereParts: string[] = [`employee_type_id: { _eq: ${typeId} }`];
  if (search) whereParts.push(`name: { _ilike: "%${search}%" }`);
  const whereClause = `where: { ${whereParts.join(', ')} }`;
  const offset = (page - 1) * limit;
  return `
    query GetPeopleAndRefs {
      people(
        ${whereClause}
        order_by: [{ created_at: desc }, { id: desc }]
        limit: ${limit}
        offset: ${offset}
      ) {
        id
        name
        phone
        iban
        registration_date
        status_id
        employee_type_id
        comment
        last_comment_date
        segment_id
        team_id
        language_id
        source_id
        created_at
        updated_at
      }
      people_aggregate(${whereClause}) { aggregate { count } }
      statuses { id code name }
      employee_types { id code name }
      segments { id code name }
      teams { id code name }
      languages { id code name }
      sources { id code name }
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

    // Resolve employee_type id by code to avoid relying on specific relation names
    const desiredCode = params.type === 'employees' ? 'EMPLOYEE' : 'CANDIDATE';
    let typeId = await fetchTypeId(desiredCode);
    if (typeId === null) {
      // Fallback if types not seeded exactly
      typeId = params.type === 'employees' ? 2 : 1;
    }

    const query = buildPeopleAndRefsQuery(typeId, params.search, params.page, params.limit);
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

    const list = data.data?.people || [];
    const total = data.data?.people_aggregate?.aggregate?.count || 0;
    const idTo = {
      status: Object.fromEntries((data.data?.statuses || []).map((x: any) => [x.id, x])),
      employeeType: Object.fromEntries((data.data?.employee_types || []).map((x: any) => [x.id, x])),
      segment: Object.fromEntries((data.data?.segments || []).map((x: any) => [x.id, x])),
      team: Object.fromEntries((data.data?.teams || []).map((x: any) => [x.id, x])),
      language: Object.fromEntries((data.data?.languages || []).map((x: any) => [x.id, x])),
      source: Object.fromEntries((data.data?.sources || []).map((x: any) => [x.id, x])),
    } as any;

    let people: Person[] = list.map((p: any) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      iban: p.iban,
      registration_date: p.registration_date,
      status_code: idTo.status[p.status_id]?.code,
      status_name: idTo.status[p.status_id]?.name,
      employee_type_code: idTo.employeeType[p.employee_type_id]?.code,
      employee_type_name: idTo.employeeType[p.employee_type_id]?.name,
      comment: p.comment,
      last_comment_date: p.last_comment_date,
      segment_code: idTo.segment[p.segment_id]?.code,
      segment_name: idTo.segment[p.segment_id]?.name,
      team_code: idTo.team[p.team_id]?.code,
      team_name: idTo.team[p.team_id]?.name,
      language_code: idTo.language[p.language_id]?.code,
      language_name: idTo.language[p.language_id]?.name,
      source_code: idTo.source[p.source_id]?.code,
      source_name: idTo.source[p.source_id]?.name,
      created_at: p.created_at,
      updated_at: p.updated_at,
    }));

    // If requesting candidates, hydrate extras with a separate root query (no relations needed)
    if (desiredCode === 'CANDIDATE' && people.length) {
      const ids = people.map((p) => p.id).join(',');
      const extrasQuery = `query GetExtras { candidates_extra(where: { person_id: { _in: [${ids}] } }) { person_id poly_result background_check_result date_of_start planned_call on_contract conditions } }`;
      const extrasResp = await fetch(config.hasura.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': config.hasura.adminSecret },
        body: JSON.stringify({ query: extrasQuery }),
      });
      if (extrasResp.ok) {
        const extrasData = await extrasResp.json();
        const map: Record<number, any> = Object.fromEntries((extrasData?.data?.candidates_extra || []).map((e: any) => [e.person_id, e]));
        people = people.map((p) => ({
          ...p,
          poly_result: map[p.id]?.poly_result,
          background_check_result: map[p.id]?.background_check_result,
          date_of_start: map[p.id]?.date_of_start,
          planned_call: map[p.id]?.planned_call,
          on_contract: map[p.id]?.on_contract,
          conditions: map[p.id]?.conditions,
        }));
      }
    }

    return NextResponse.json({ success: true, data: people, total, timestamp });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error', timestamp }, { status: 500 });
  }
}

