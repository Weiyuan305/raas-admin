'use client'

import { useEffect, useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import CreateCompanyModal from './CreateCompanyModal'

const planLabels: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise'
}

interface Company {
  id: string
  name: string
  plan_type: string
  status: string
  max_consultants: number
  monthly_ai_quota: number
  created_at: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/companies')
      const json = await res.json()
      setCompanies(json.data || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCompanies() }, [fetchCompanies])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">公司管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {companies.length} 家公司接入平台</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + 新建公司
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="font-semibold text-gray-700">公司名称</TableHead>
              <TableHead className="font-semibold text-gray-700">套餐</TableHead>
              <TableHead className="font-semibold text-gray-700">状态</TableHead>
              <TableHead className="font-semibold text-gray-700">顾问上限</TableHead>
              <TableHead className="font-semibold text-gray-700">月 AI 配额</TableHead>
              <TableHead className="font-semibold text-gray-700">创建时间</TableHead>
              <TableHead className="font-semibold text-gray-700">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    加载中...
                  </div>
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                  暂无公司数据，点击「+ 新建公司」开始
                </TableCell>
              </TableRow>
            ) : companies.map((company) => (
              <TableRow key={company.id} className="hover:bg-gray-50 border-b border-gray-100">
                <TableCell className="font-medium text-gray-900">{company.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs text-gray-700 border-gray-300">
                    {planLabels[company.plan_type] || company.plan_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`text-xs border ${company.status === 'active' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {company.status === 'active' ? '正常' : '已停用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-700">{company.max_consultants}</TableCell>
                <TableCell className="text-gray-700">{company.monthly_ai_quota?.toLocaleString()}</TableCell>
                <TableCell className="text-gray-600 text-sm">{formatDate(company.created_at)}</TableCell>
                <TableCell>
                  <button className="text-xs text-gray-600 hover:text-black font-medium transition-colors">编辑</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showModal && (
        <CreateCompanyModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            fetchCompanies()   // 创建成功后重新拉取列表
          }}
        />
      )}
    </div>
  )
}
