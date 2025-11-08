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
