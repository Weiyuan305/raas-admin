import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, FileText, Zap, TrendingUp, Clock } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

async function getDashboardStats() {
  const [
    { count: totalCompanies },
    { count: totalConsultants },
    { data: cases },
    { data: todayUsage },
    { data: monthUsage }
  ] = await Promise.all([
    supabaseAdmin.from('companies').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('consultants').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('cases').select('status, created_at, updated_at'),
    supabaseAdmin.from('api_usage').select('tokens_total')
      .gte('created_at', new Date().toISOString().split('T')[0]),
    supabaseAdmin.from('api_usage').select('tokens_total')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  const allCases = cases || []
  return {
    totalCompanies: totalCompanies || 0,
    totalConsultants: totalConsultants || 0,
    totalCases: allCases.length,
    activeCases: allCases.filter(c => c.status !== 'completed').length,
    completedCases: allCases.filter(c => c.status === 'completed').length,
    tokensToday: (todayUsage || []).reduce((s: number, r: { tokens_total: number }) => s + (r.tokens_total || 0), 0),
    tokensMonth: (monthUsage || []).reduce((s: number, r: { tokens_total: number }) => s + (r.tokens_total || 0), 0),
    funnel: {
      draft: allCases.filter(c => c.status === 'draft').length,
      matching: allCases.filter(c => c.status === 'matching').length,
      writing: allCases.filter(c => c.status === 'writing').length,
      completed: allCases.filter(c => c.status === 'completed').length,
    }
  }
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Step 1 信息收集', color: 'bg-gray-100 text-gray-700' },
  matching: { label: 'Step 2 院校匹配', color: 'bg-blue-50 text-blue-700' },
  writing: { label: 'Step 3 文书生成', color: 'bg-amber-50 text-amber-700' },
  completed: { label: 'Step 4 已完成', color: 'bg-green-50 text-green-700' },
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const metricCards = [
    { title: '公司总数', value: stats.totalCompanies, icon: Building2, sub: '已接入平台' },
    { title: '顾问总数', value: stats.totalConsultants, icon: Users, sub: '活跃账号' },
    { title: '案例总数', value: stats.totalCases, icon: FileText, sub: `${stats.activeCases} 进行中` },
    { title: '今日 Token', value: formatNumber(stats.tokensToday), icon: Zap, sub: `本月 ${formatNumber(stats.tokensMonth)}` },
  ]

  const funnelTotal = stats.totalCases || 1

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">平台总览</h1>
        <p className="text-sm text-gray-500 mt-1">实时数据 · 所有产品线合并视图</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {metricCards.map(({ title, value, icon: Icon, sub }) => (
          <Card key={title} className="border border-gray-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
              <Icon size={16} className="text-gray-400" />
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold text-gray-900">{value}</div>
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 漏斗图 */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-500" />
              <CardTitle className="text-base font-semibold text-gray-900">案例 Step 漏斗</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {Object.entries(stats.funnel).map(([status, count]) => {
              const cfg = statusConfig[status]
              const pct = Math.round((count / funnelTotal) * 100)
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{cfg.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{count} 个</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 快速入口 */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <CardTitle className="text-base font-semibold text-gray-900">快速入口</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/dashboard/companies', label: '管理公司', desc: '查看所有公司' },
                { href: '/dashboard/consultants', label: '管理顾问', desc: '顾问账号列表' },
                { href: '/dashboard/cases', label: '查看案例', desc: '全平台案例' },
                { href: '/dashboard/usage', label: 'AI 用量', desc: 'Token 消耗分析' },
              ].map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  className="p-4 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all group"
                >
                  <div className="font-medium text-sm text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
