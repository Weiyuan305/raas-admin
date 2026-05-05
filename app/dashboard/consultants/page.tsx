import { supabaseAdmin } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatRelativeTime } from '@/lib/utils'
import Link from 'next/link'
import ConsultantActions from './ConsultantActions'

async function getConsultants() {
  const { data } = await supabaseAdmin
    .from('consultants')
    .select(`
      id, email, display_name, status, company_id, created_at,
      company:companies(name)
    `)
    .order('created_at', { ascending: false })
  return data || []
}

export default async function ConsultantsPage() {
  const consultants = await getConsultants()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顾问管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {consultants.length} 位顾问</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700">顾问</TableHead>
              <TableHead className="font-semibold text-gray-700">所属公司</TableHead>
              <TableHead className="font-semibold text-gray-700">状态</TableHead>
              <TableHead className="font-semibold text-gray-700">注册时间</TableHead>
              <TableHead className="font-semibold text-gray-700">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                  暂无顾问数据
                </TableCell>
              </TableRow>
            ) : consultants.map((c) => (
              <TableRow key={c.id} className="hover:bg-gray-50 border-b border-gray-100">
                <TableCell>
                  <Link href={`/dashboard/consultants/${c.id}`} className="block group">
                    <div className="font-medium text-gray-900 group-hover:text-black group-hover:underline">
                      {c.display_name || '未设置姓名'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{c.email}</div>
                  </Link>
                </TableCell>
                <TableCell className="text-gray-700">
                  {/* @ts-ignore */}
                  {c.company?.name || <span className="text-gray-400">未分配</span>}
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs border ${
                    // @ts-ignore
                    c.status === 'active'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {/* @ts-ignore */}
                    {c.status === 'active' ? '正常' : '已停用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">{formatRelativeTime(c.created_at)}</TableCell>
                <TableCell>
                  {/* @ts-ignore */}
                  <ConsultantActions id={c.id} status={c.status || 'active'} name={c.display_name || c.email} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
