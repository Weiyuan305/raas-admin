import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Zap, TrendingUp } from 'lucide-react'

async function getUsageStats() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const todayStart = now.toISOString().split('T')[0]

  const [{ data: monthData }, { data: byAction }] = await Promise.all([
    supabaseAdmin
      .from('api_usage')
      .select('tokens_total, tokens_input, tokens_output, action, created_at')
      .gte('created_at', monthStart),
    supabaseAdmin
      .from('api_usage')
      .select('action, tokens_total')
      .gte('created_at', monthStart)
  ])

  const month = monthData || []
  const tokensMonth = month.reduce((s, r) => s + (r.tokens_total || 0), 0)
  const tokensToday = month
    .filter(r => r.created_at?.startsWith(todayStart))
    .reduce((s, r) => s + (r.tokens_total || 0), 0)

  // 按 action 聚合
  const actionMap: Record<string, number> = {}
  for (const r of byAction || []) {
    actionMap[r.action] = (actionMap[r.action] || 0) + (r.tokens_total || 0)
  }

  // 按天聚合（本月）
  const dailyMap: Record<string, number> = {}
  for (const r of month) {
    const day = r.created_at?.split('T')[0] || ''
    dailyMap[day] = (dailyMap[day] || 0) + (r.tokens_total || 0)
  }
  const dailyTrend = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)

  return { tokensMonth, tokensToday, actionMap, dailyTrend, totalCalls: month.length }
}

const actionLabels: Record<string, string> = {
  document_generate: '文书生成',
  university_match: '院校匹配',
  chat_edit: '对话修改',
  file_parse: '文件解析'
}

export default async function UsagePage() {
  const stats = await getUsageStats()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">AI 用量监控</h1>
        <p className="text-sm text-gray-500 mt-1">本月 Token 消耗分析</p>
      </div>

      {/* 汇总卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap size={14} />今日 Token
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.tokensToday)}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp size={14} />本月 Token
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.tokensMonth)}</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-medium text-gray-600">本月调用次数</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-bold text-gray-900">{stats.totalCalls.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 按功能分布 */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">按功能消耗</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {Object.keys(stats.actionMap).length === 0 ? (
              <p className="text-sm text-gray-500">暂无数据</p>
            ) : Object.entries(stats.actionMap)
              .sort(([, a], [, b]) => b - a)
              .map(([action, tokens]) => {
                const pct = stats.tokensMonth > 0 ? Math.round((tokens / stats.tokensMonth) * 100) : 0
                return (
                  <div key={action}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{actionLabels[action] || action}</span>
                      <span className="text-sm font-medium text-gray-900">{formatNumber(tokens)} <span className="text-gray-500 text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            }
          </CardContent>
        </Card>

        {/* 最近 14 天趋势 */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-base font-semibold text-gray-900">最近 14 天趋势</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {stats.dailyTrend.length === 0 ? (
              <p className="text-sm text-gray-500">暂无数据</p>
            ) : (
              <div className="flex items-end gap-1.5 h-32">
                {stats.dailyTrend.map(([day, tokens]) => {
                  const max = Math.max(...stats.dailyTrend.map(([, v]) => v), 1)
                  const h = Math.max(Math.round((tokens / max) * 100), 4)
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className="w-full bg-gray-800 rounded-sm hover:bg-black transition-all"
                        style={{ height: `${h}%` }}
                        title={`${day}: ${formatNumber(tokens)}`}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
