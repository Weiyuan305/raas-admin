import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { SignJWT } from 'jose'
import * as crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    // 查询管理员账号
    const { data: admin, error } = await supabaseAdmin
      .from('raas_admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 验证密码（bcrypt 风格的 SHA256 对比，实际生产用 bcrypt）
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    if (admin.password_hash !== passwordHash) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    // 更新最后登录时间
    await supabaseAdmin
      .from('raas_admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id)

    // 生成 JWT
    const secret = new TextEncoder().encode(process.env.RAAS_JWT_SECRET || 'raas-secret-key-32-chars-minimum')
    const token = await new SignJWT({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
      companyId: admin.company_id
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(secret)

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        display_name: admin.display_name,
        company_id: admin.company_id
      }
    })

    response.cookies.set('raas-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 // 8小时
    })

    return response
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
