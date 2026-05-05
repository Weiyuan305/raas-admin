import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { DashboardStats } from '@/types'

export async function GET(_req: NextRequest) {
  try {
    // 并行拉取所有统计数据
    const [
      { count: totalCompanies },
      { count: totalConsultants },
      { data: casesData },
      { data: todayUsage },
      { data: monthUsage }
    ] = await Promise.all([
      supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('consultants').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('cases').select('status'),
      supabaseAdmin
        .from('api_usage')
        .select('tokens_total')
        .gte('created_at', new Date().toISOString().split('T')[0]),
      supabaseAdmin
        .from('api_usage')
        .select('tokens_total')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ])

    const cases = casesData || []
    const stats: DashboardStats = {
      total_companies: totalCompanies || 0,
      total_consultants: totalConsultants || 0,
      total_cases: cases.length,
      active_cases: cases.filter(c => c.status !== 'completed').length,
      completed_cases: cases.filter(c => c.status === 'completed').length,
      total_tokens_today: (todayUsage || []).reduce((s, r) => s + (r.tokens_total || 0), 0),
      total_tokens_month: (monthUsage || []).reduce((s, r) => s + (r.tokens_total || 0), 0),
      new_cases_this_month: cases.filter(c => {
        // 筛选本月新增（需要 created_at 字段）
        return true
      }).length,
      step_funnel: {
        step1: cases.filter(c => c.status === 'draft').length,
        step2: cases.filter(c => c.status === 'matching').length,
        step3: cases.filter(c => c.status === 'writing').length,
        step4: cases.filter(c => c.status === 'completed').length
      }
    }

    return NextResponse.json(stats)
  } catch (e) {
    console.error('Dashboard stats error:', e)
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 })
  }
}
