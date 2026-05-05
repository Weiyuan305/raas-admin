import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/consultants/[id]/cases — 该顾问名下所有案例
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('cases')
    .select(`
      id, student_name, status, created_at, updated_at,
      university_matches(count),
      documents(count)
    `)
    .eq('consultant_id', id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data || [])
}
