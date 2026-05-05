'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  status: 'active' | 'suspended'
  name: string
}

export default function ConsultantActions({ id, status, name }: Props) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [loading, setLoading] = useState(false)

  async function toggleStatus() {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const action = newStatus === 'suspended' ? '停用' : '启用'
    if (!confirm(`确认要${action}顾问「${name}」吗？`)) return

    setLoading(true)
    try {
      const res = await fetch(`/api/consultants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        setCurrentStatus(newStatus)
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || '操作失败')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3 items-center">
      <Link
        href={`/dashboard/consultants/${id}`}
        className="text-xs text-gray-600 hover:text-black font-medium transition-colors"
      >
        查看案例
      </Link>
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={`text-xs font-medium transition-colors disabled:opacity-50 ${
          currentStatus === 'active'
            ? 'text-gray-500 hover:text-red-600'
            : 'text-gray-500 hover:text-green-600'
        }`}
      >
        {loading ? '处理中...' : currentStatus === 'active' ? '停用' : '启用'}
      </button>
    </div>
  )
}
