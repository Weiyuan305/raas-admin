// ============================================================
// RAAS Admin 全局 TypeScript 类型
// ============================================================

export type CompanyStatus = 'active' | 'suspended'
export type PlanType = 'starter' | 'pro' | 'enterprise'
export type AdminRole = 'super_admin' | 'company_admin'
export type CaseStatus = 'draft' | 'matching' | 'writing' | 'completed'

export interface Company {
  id: string
  name: string
  logo_url?: string
  status: CompanyStatus
  plan_type: PlanType
  max_consultants: number
  monthly_ai_quota: number
  created_at: string
  updated_at: string
  // 聚合字段（join 查询）
  consultant_count?: number
  case_count?: number
  active_case_count?: number
  total_tokens?: number
}

export interface Consultant {
  id: string
  email: string
  display_name?: string
  company_id?: string
  status: 'active' | 'suspended'
  created_at: string
  // 聚合字段
  company?: { name: string }
  case_count?: number
  active_case_count?: number
  last_active?: string
  total_tokens?: number
}

export interface Case {
  id: string
  consultant_id: string
  student_name: string
  status: CaseStatus
  created_at: string
  updated_at: string
  // 关联
  consultant?: { email: string; display_name?: string; company?: { name: string } }
  university_count?: number
  document_count?: number
  days_since_update?: number
}

export interface RaasAdmin {
  id: string
  email: string
  role: AdminRole
  company_id?: string
  display_name?: string
  last_login_at?: string
  created_at: string
}

export interface ApiUsageStat {
  date: string
  tokens_total: number
  consultant_id?: string
  company_id?: string
  action?: string
}

export interface DashboardStats {
  total_companies: number
  total_consultants: number
  total_cases: number
  active_cases: number
  completed_cases: number
  total_tokens_today: number
  total_tokens_month: number
  new_cases_this_month: number
  step_funnel: {
    step1: number
    step2: number
    step3: number
    step4: number
  }
}

export interface AdminSession {
  admin: RaasAdmin
  token: string
}
