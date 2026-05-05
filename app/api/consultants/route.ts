import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const company_id = searchParams.get('company_id')
  const status = searchParams.get('status')
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('consultants')
    .select(`
      id, email, display_name, status, company_id, created_at,
      company:companies(name),
      cases(count)
    `, { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (company_id) query = query.eq('company_id', company_id)
  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}
