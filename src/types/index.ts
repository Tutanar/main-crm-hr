export type UserRole = 'admin' | 'chief-hr' | 'hr';

export interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  status: 'NEW' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'HIRED';
  cv_url?: string;
  cv_filename?: string;
  cv_size?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Staff {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  iban?: string;
  salary?: number;
  hire_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  candidate_id?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  last_login?: string;
  login_attempts: number;
  locked_until?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  table_name: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface IpAllowlist {
  id: string;
  ip_address: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc' | null;
}

export interface FilterConfig {
  search?: string;
  status?: string;
  department?: string;
  role?: string;
  is_active?: boolean;
}

// Справочные типы (получаются из базы данных)
export interface ReferenceItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface EmployeeType extends ReferenceItem {}
export interface Status extends ReferenceItem {
  employee_type_id: number;
}
export interface Segment extends ReferenceItem {}
export interface Team extends ReferenceItem {}
export interface Language extends ReferenceItem {}
export interface Source extends ReferenceItem {}

// Основные типы для людей
export interface Person {
  id: number;
  name: string;
  phone?: string;
  registration_date: string;
  status_code: string;
  status_name: string;
  employee_type_code: string;
  employee_type_name: string;
  comment?: string;
  last_comment_date?: string;
  segment_code: string;
  segment_name: string;
  team_code: string;
  team_name: string;
  language_code: string;
  language_name: string;
  source_code: string;
  source_name: string;
  created_at: string;
  updated_at: string;
}

export interface PersonCreateRequest {
  name: string;
  phone?: string;
  status_id: number;
  employee_type_id: number;
  comment?: string;
  segment_id: number;
  team_id: number;
  language_id: number;
  source_id: number;
}

export interface PersonUpdateRequest {
  name?: string;
  phone?: string;
  status_id?: number;
  employee_type_id?: number;
  comment?: string;
  last_comment_date?: string;
  segment_id?: number;
  team_id?: number;
  language_id?: number;
  source_id?: number;
}

export interface PeopleFilterConfig {
  search?: string;
  status_id?: number;
  employee_type_id?: number;
  segment_id?: number;
  team_id?: number;
  language_id?: number;
  source_id?: number;
  date_from?: string;
  date_to?: string;
}
