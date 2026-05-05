'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  onClose: () => void
}

export default function CreateCompanyModal({ onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    plan_type: 'starter',
    max_consultants: 10,
    monthly_ai_quota: 100000,
  })

  function set(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('公司名称不能为空'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || '创建失败'); return }
      router.refresh()
      onClose()
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* 遮罩 */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        {/* 关闭 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-5">新建公司</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 公司名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司名称 *</label>
            <Input
              placeholder="例：北京留学咨询有限公司"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="text-gray-900 bg-white border-gray-300"
              autoFocus
            />
          </div>

          {/* 套餐 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">套餐类型</label>
            <div className="flex gap-2">
              {[
                { value: 'starter', label: 'Starter' },
                { value: 'pro', label: 'Pro' },
                { value: 'enterprise', label: 'Enterprise' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('plan_type', opt.value)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    form.plan_type === opt.value
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 顾问上限 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">顾问账号上限</label>
            <Input
              type="number"
              min={1}
              max={500}
              value={form.max_consultants}
              onChange={e => set('max_consultants', parseInt(e.target.value) || 1)}
              className="text-gray-900 bg-white border-gray-300"
            />
          </div>

          {/* AI 配额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">月 AI Token 配额</label>
            <Input
              type="number"
              min={10000}
              step={10000}
              value={form.monthly_ai_quota}
              onChange={e => set('monthly_ai_quota', parseInt(e.target.value) || 100000)}
              className="text-gray-900 bg-white border-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">{form.monthly_ai_quota.toLocaleString()} tokens / 月</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-gray-700 border-gray-300"
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? '创建中...' : '创建公司'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
