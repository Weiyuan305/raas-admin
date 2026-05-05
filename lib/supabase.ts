import { createClient } from '@supabase/supabase-js'

// 后台专用：使用 service_role，绕过 RLS，可读所有数据
// 严禁在前端代码中引用此客户端
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
