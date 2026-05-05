'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', label: '总览', icon: LayoutDashboard },
  { href: '/dashboard/companies', label: '公司管理', icon: Building2 },
  { href: '/dashboard/consultants', label: '顾问管理', icon: Users },
  { href: '/dashboard/cases', label: '案例管理', icon: FileText },
  { href: '/dashboard/usage', label: 'AI 用量', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-60 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-200">
        <div className="w-7 h-7 bg-black rounded flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">R</span>
        </div>
        <div>
          <div className="font-semibold text-sm leading-tight text-gray-900">RAAS Admin</div>
          <div className="text-xs text-gray-500 leading-tight">管理后台</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4">
        <Separator className="mb-3 bg-gray-200" />
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Settings size={16} />
          系统设置
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-gray-700 hover:text-red-600 hover:bg-red-50 mt-0.5"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          退出登录
        </Button>
      </div>
    </aside>
  )
}
