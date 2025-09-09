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
