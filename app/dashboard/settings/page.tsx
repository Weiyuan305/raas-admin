import { supabaseAdmin } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Cpu, ShieldAlert, Bell } from 'lucide-react'

async function getSystemConfigs() {
  const { data } = await supabaseAdmin
    .from('system_configs')
    .select('key, value, description, updated_at')
    .order('key')
  return data || []
}

const configLabels: Record<string, { label: string; desc: string }> = {
  ai_model:                         { label: 'AI 模型', desc: '全局调用的 AI 模型名称' },
  daily_token_limit_per_consultant:  { label: '顾问每日 Token 上限', desc: '单个顾问每日最多消耗的 Token 数' },
  global_daily_token_limit:         { label: '全平台每日 Token 上限', desc: '所有顾问合计每日上限' },
  maintenance_mode:                 { label: '维护模式', desc: '开启后 EduApply 顾问端将显示维护提示' },
}

export default async function SettingsPage() {
  const configs = await getSystemConfigs()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-sm text-gray-500 mt-1">全局配置项，修改后立即对所有产品生效</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl">

        {/* AI 配置 */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-gray-500" />
              <CardTitle className="text-base font-semibold text-gray-900">AI 配置</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4 divide-y divide-gray-100">
            {['ai_model', 'daily_token_limit_per_consultant', 'global_daily_token_limit'].map(key => {
              const config = configs.find(c => c.key === key)
              const meta = configLabels[key]
              const rawValue = config?.value
              const displayValue = typeof rawValue === 'string'
                ? rawValue.replace(/^"|"$/g, '')
                : JSON.stringify(rawValue ?? '—')
              return (
                <div key={key} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{meta?.label || key}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{meta?.desc}</div>
                  </div>
                  <div className="ml-4 font-mono text-sm text-gray-900 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
                    {displayValue}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 访问控制 */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-gray-500" />
              <CardTitle className="text-base font-semibold text-gray-900">访问控制</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            {(() => {
              const config = configs.find(c => c.key === 'maintenance_mode')
              const isOn = config?.value === true || config?.value === 'true'
              return (
                <div className="flex items-center justify-between py-1">
                  <div>
                    <div className="text-sm font-medium text-gray-800">维护模式</div>
                    <div className="text-xs text-gray-500 mt-0.5">开启后 EduApply 顾问端将显示维护提示</div>
                  </div>
                  <Badge className={`text-xs border ${isOn
                    ? 'bg-red-50 text-red-800 border-red-200'
                    : 'bg-green-50 text-green-800 border-green-200'
                  }`}>
                    {isOn ? '维护中' : '正常运行'}
                  </Badge>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* 说明 */}
        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gray-500" />
              <CardTitle className="text-base font-semibold text-gray-900">修改配置</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <p className="text-sm text-gray-600">如需修改配置项，请在 Supabase SQL Editor 中执行：</p>
            <pre className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 overflow-x-auto">
{`UPDATE system_configs
SET value = '"gemini-2.0-flash"'
WHERE key = 'ai_model';`}
            </pre>
            <p className="text-xs text-gray-400 mt-2">修改后立即生效，无需重启服务</p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
