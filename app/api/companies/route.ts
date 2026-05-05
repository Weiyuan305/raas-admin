import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('companies')
    .select(`
      *,
      consultants!inner(count)
    `, { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, plan_type, max_consultants, monthly_ai_quota } = body

  if (!name) return NextResponse.json({ error: '公司名不能为空' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('companies')
    .insert({ name, plan_type, max_consultants, monthly_ai_quota })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
