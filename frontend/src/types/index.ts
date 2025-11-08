export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'worker' | 'employer' | 'admin';
  phone?: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
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
  role: 'worker' | 'employer';
}
