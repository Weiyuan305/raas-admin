import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { count, error } = await supabaseAdmin
    .from('raas_admins')
    .select('id', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, project: 'raas-admin', error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    project: 'raas-admin',
    table: 'raas_admins',
    count,
    checkedAt: new Date().toISOString(),
  })
}
