import { supabaseAdmin } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRelativeTime } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: 'Step 1 信息收集', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  matching: { label: 'Step 2 院校匹配', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  writing: { label: 'Step 3 文书生成', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  completed: { label: 'Step 4 已完成', className: 'bg-green-50 text-green-800 border-green-200' },
}

async function getCases() {
  const { data } = await supabaseAdmin
    .from('cases')
    .select(`
      id, student_name, status, created_at, updated_at,
      consultant:consultants(
        email, display_name,
        company:companies(name)
      )
    `)
    .order('updated_at', { ascending: false })
    .limit(100)
  return data || []
}

export default async function CasesPage() {
  const cases = await getCases()
  const now = Date.now()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案例管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {cases.length} 个案例（最近 100 条）</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700">学生</TableHead>
              <TableHead className="font-semibold text-gray-700">负责顾问</TableHead>
              <TableHead className="font-semibold text-gray-700">所属公司</TableHead>
              <TableHead className="font-semibold text-gray-700">当前阶段</TableHead>
              <TableHead className="font-semibold text-gray-700">最近更新</TableHead>
              <TableHead className="font-semibold text-gray-700">停滞</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-12">
                  暂无案例数据
                </TableCell>
              </TableRow>
            ) : cases.map((c) => {
              const daysSinceUpdate = Math.floor((now - new Date(c.updated_at).getTime()) / 86400000)
              const isStale = daysSinceUpdate >= 7 && c.status !== 'completed'
              const cfg = statusConfig[c.status] || statusConfig.draft
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const consultant = c.consultant as any
              return (
                <TableRow key={c.id} className={`border-b border-gray-100 ${isStale ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <TableCell className="font-medium text-gray-900">{c.student_name}</TableCell>
                  <TableCell className="text-gray-700">
                    {consultant?.display_name || consultant?.email || '—'}
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {consultant?.company?.name || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs border ${cfg.className}`}>{cfg.label}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {formatRelativeTime(c.updated_at)}
                  </TableCell>
                  <TableCell>
                    {isStale ? (
                      <span className="text-xs text-red-500 font-medium">⚠ {daysSinceUpdate}天未更新</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
