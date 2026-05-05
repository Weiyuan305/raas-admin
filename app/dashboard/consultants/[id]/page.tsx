'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Building2, Mail, Calendar } from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  draft:     { label: 'Step 1 信息收集', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  matching:  { label: 'Step 2 院校匹配', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  writing:   { label: 'Step 3 文书生成', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  completed: { label: 'Step 4 已完成',   className: 'bg-green-50 text-green-800 border-green-200' },
}

interface Consultant {
  id: string
  email: string
  display_name?: string
  status: 'active' | 'suspended'
  company_id?: string
  created_at: string
  company?: { name: string; plan_type: string }
}

interface Case {
  id: string
  student_name: string
  status: string
  created_at: string
  updated_at: string
}

export default function ConsultantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [id, setId] = useState<string>('')
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/consultants/${id}`).then(r => r.json()),
      fetch(`/api/consultants/${id}/cases`).then(r => r.json())
    ]).then(([c, caseList]) => {
      if (c.error) { setError(c.error); return }
      setConsultant(c)
      setCases(Array.isArray(caseList) ? caseList : [])
    }).catch(() => setError('加载失败')).finally(() => setLoading(false))
  }, [id])

  async function toggleStatus() {
    if (!consultant) return
    const newStatus = consultant.status === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? '停用' : '启用'
    if (!confirm(`确认要${action}顾问「${consultant.display_name || consultant.email}」吗？`)) return

    setToggling(true)
    try {
      const res = await fetch(`/api/consultants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || '操作失败'); return }
      setConsultant(prev => prev ? { ...prev, status: newStatus } : prev)
    } finally {
      setToggling(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex items-center gap-2 text-gray-500">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      加载中...
    </div>
  )

  if (error || !consultant) return (
    <div className="p-8">
      <p className="text-red-600">{error || '顾问不存在'}</p>
      <Link href="/dashboard/consultants" className="text-sm text-gray-500 hover:text-black mt-2 inline-block">← 返回列表</Link>
    </div>
  )

  const activeCases = cases.filter(c => c.status !== 'completed').length
  const completedCases = cases.filter(c => c.status === 'completed').length
  const now = Date.now()

  return (
    <div className="p-8">
      {/* 返回 */}
      <Link
        href="/dashboard/consultants"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        返回顾问列表
      </Link>

      {/* 顾问信息卡 */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* 头像 */}
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
              {(consultant.display_name || consultant.email)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {consultant.display_name || '未设置姓名'}
              </h1>
              <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail size={13} />
                  {consultant.email}
                </span>
                {consultant.company && (
                  <span className="flex items-center gap-1">
                    <Building2 size={13} />
                    {consultant.company.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  注册于 {formatDate(consultant.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={`text-xs border ${
              consultant.status === 'active'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              {consultant.status === 'active' ? '正常' : '已停用'}
            </Badge>
            <button
              onClick={toggleStatus}
              disabled={toggling}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 ${
                consultant.status === 'active'
                  ? 'border-red-200 text-red-600 hover:bg-red-50 bg-white'
                  : 'border-green-200 text-green-700 hover:bg-green-50 bg-white'
              }`}
            >
              {toggling ? '处理中...' : consultant.status === 'active' ? '停用账号' : '启用账号'}
            </button>
          </div>
        </div>

        {/* 数据摘要 */}
        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: '案例总数', value: cases.length },
            { label: '进行中', value: activeCases },
            { label: '已完成', value: completedCases },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 案例列表 */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">名下案例</h2>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-700">学生</TableHead>
                <TableHead className="font-semibold text-gray-700">当前阶段</TableHead>
                <TableHead className="font-semibold text-gray-700">创建时间</TableHead>
                <TableHead className="font-semibold text-gray-700">最近更新</TableHead>
                <TableHead className="font-semibold text-gray-700">停滞</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                    该顾问暂无案例
                  </TableCell>
                </TableRow>
              ) : cases.map(c => {
                const daysSince = Math.floor((now - new Date(c.updated_at).getTime()) / 86400000)
                const isStale = daysSince >= 7 && c.status !== 'completed'
                const cfg = statusConfig[c.status] || statusConfig.draft
                return (
                  <TableRow key={c.id} className={`border-b border-gray-100 ${isStale ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <TableCell className="font-medium text-gray-900">{c.student_name}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${cfg.className}`}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{formatDate(c.created_at)}</TableCell>
                    <TableCell className="text-gray-600 text-sm">{formatRelativeTime(c.updated_at)}</TableCell>
                    <TableCell>
                      {isStale
                        ? <span className="text-xs text-red-600 font-medium">⚠ {daysSince}天未更新</span>
                        : <span className="text-xs text-gray-300">—</span>
                      }
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
