import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const status = searchParams.get('status')
  const company_id = searchParams.get('company_id')
  const consultant_id = searchParams.get('consultant_id')
  const offset = (page - 1) * limit

  let query = supabaseAdmin
    .from('cases')
    .select(`
      id, student_name, status, created_at, updated_at, consultant_id,
      consultant:consultants(
        email, display_name,
        company:companies(name)
      ),
      university_matches(count),
      documents(count)
    `, { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('updated_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (consultant_id) query = query.eq('consultant_id', consultant_id)
  if (company_id) {
    query = query.eq('consultants.company_id', company_id)
  }

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}
