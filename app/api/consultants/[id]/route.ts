import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/consultants/[id] — 顾问详情
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('consultants')
    .select(`
      id, email, display_name, status, company_id, created_at,
      company:companies(name, plan_type)
    `)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: '顾问不存在' }, { status: 404 })

  return NextResponse.json(data)
}

// PATCH /api/consultants/[id] — 停用 / 启用顾问
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await req.json()

  if (!['active', 'suspended'].includes(status)) {
    return NextResponse.json({ error: '无效状态' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('consultants')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
