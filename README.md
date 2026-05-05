# RAAS Admin — 多产品 SaaS 管理后台

面向运营团队的统一管控平台，管理旗下所有 SaaS 产品线（EduApply 留学申请、英语教学等）的公司、顾问、学生数据和 AI 用量。

## 功能模块

| 模块 | 说明 |
|---|---|
| **总览 Dashboard** | 公司/顾问/案例/Token 四维指标 + Step 漏斗转化图 |
| **公司管理** | 多租户公司列表，套餐配置，启用/停用 |
| **顾问管理** | 跨公司顾问账号，归属公司，状态管理 |
| **案例管理** | 全平台案例列表，7天未更新自动高亮预警 |
| **AI 用量监控** | 今日/本月 Token 消耗，按功能分布，14天趋势柱图 |

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router, Server Components) |
| 数据库 | Supabase（与 EduApply 共用同一实例） |
| 权限 | `service_role` 越权查询（绕过 RLS），独立 JWT session |
| UI | shadcn/ui + Tailwind CSS v4（强制亮色模式） |
| 部署 | Vercel |

## 架构说明

```
GitHub
├── eduapply/        → Vercel 项目 A（顾问端产品）
└── raas-admin/      → Vercel 项目 B（运营管理后台）← 本仓库

共同指向同一个 Supabase 实例：
  eduapply   使用 anon_key  + RLS（顾问只看自己的数据）
  raas-admin 使用 service_role_key（后台可查所有数据）
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`（与 EduApply 共用同一个 Supabase 项目）：

```env
# Supabase（与 EduApply 同一项目）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# RAAS 管理员 JWT 密钥（独立于 Supabase Auth）
RAAS_JWT_SECRET=your_jwt_secret_min_32_chars

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 3. 初始化数据库（在 EduApply 的 Supabase SQL Editor 执行）

本项目依赖 EduApply 的数据库。先确保 EduApply 的 `001_init.sql` 已执行，再执行：

```
eduapply/supabase/migrations/002_raas.sql
```

新增表：`companies`、`raas_admins`、`api_usage`、`audit_logs`、`system_configs`

### 4. 创建第一个超管账号

在 Supabase SQL Editor 执行：

```sql
INSERT INTO raas_admins (email, password_hash, role, display_name)
VALUES (
  'your@email.com',
  encode(digest('your-password', 'sha256'), 'hex'),
  'super_admin',
  '超级管理员'
);
```

### 5. 启动开发服务器

```bash
npm run dev
# → http://localhost:3001
```

## 项目结构

```
raas-admin/
├── app/
│   ├── login/                    # 登录页
│   ├── dashboard/
│   │   ├── layout.tsx            # 侧边栏布局
│   │   ├── page.tsx              # 总览 Dashboard
│   │   ├── companies/            # 公司管理
│   │   ├── consultants/          # 顾问管理
│   │   ├── cases/                # 案例管理
│   │   └── usage/                # AI 用量监控
│   └── api/
│       ├── auth/login、logout    # JWT 认证
│       ├── dashboard/            # 统计汇总
│       ├── companies/            # 公司 CRUD
│       ├── consultants/          # 顾问列表
│       └── cases/                # 案例列表
├── components/
│   ├── layout/Sidebar.tsx        # 侧边栏导航
│   └── ui/                       # shadcn/ui 组件
├── lib/
│   ├── supabase.ts               # service_role 客户端
│   └── utils.ts                  # 工具函数
├── types/index.ts                # 全局 TS 类型
└── middleware.ts                 # 路由保护（未登录跳转 /login）
```

## 部署（Vercel）

在 Vercel 控制台配置以下环境变量后直接推送：

| 变量名 | 说明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key（保密）|
| `RAAS_JWT_SECRET` | 自定义 JWT 密钥（32位以上随机字符串）|

```bash
git push origin main
# Vercel 自动触发部署
```

## 安全说明

- `SUPABASE_SERVICE_ROLE_KEY` 仅在 Server Component 和 API Route 中使用，**严禁出现在客户端代码**
- `raas_admins` 表通过 RLS `USING (false)` 禁止所有公开访问，只能通过 `service_role` 操作
- 管理员 session 使用独立 JWT，与顾问端 Supabase Auth 完全隔离

## 后续路线图

- [ ] 公司创建/编辑 Modal
- [ ] 顾问停用/启用操作
- [ ] AI 用量按公司/顾问下钻
- [ ] 系统配置（模型切换、配额告警）
- [ ] 英语教学平台模块接入
- [ ] 审计日志查看页
