export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'worker' | 'company' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  phone?: string;
  phone_verified: boolean;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  work_style?: string;
  affiliation?: string;
  id_document_url?: string;
  preferred_prefecture?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface UserUpdatePayload {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: string;
  work_style?: string;
  affiliation?: string;
  preferred_prefecture?: string;
  latitude?: number;
  longitude?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'application' | 'assignment' | 'payment' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  salary_min: number;
  salary_max: number;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  required_skills: string[];
  employer_id: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  worker_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'worker' | 'company';
}

export interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code?: string;
  branch_name: string;
  branch_code?: string;
  account_type: 'ordinary' | 'current';
  account_number: string;
  account_holder_name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccountCreate {
  bank_name: string;
  bank_code?: string;
  branch_name: string;
  branch_code?: string;
  account_type: 'ordinary' | 'current';
  account_number: string;
  account_holder_name: string;
  is_default?: boolean;
}

export interface BankAccountUpdate {
  bank_name?: string;
  bank_code?: string;
  branch_name?: string;
  branch_code?: string;
  account_type?: 'ordinary' | 'current';
  account_number?: string;
  account_holder_name?: string;
  is_default?: boolean;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  bank_account_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processed_at?: string;
  notes?: string;
  admin_notes?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
}

export interface WithdrawalRequestCreate {
  bank_account_id: string;
  amount: number;
  notes?: string;
}

export interface WithdrawalBalance {
  available: number;
  pending: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type?: string;
  entity_id?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
