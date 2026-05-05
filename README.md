# RAAS Admin

多产品 SaaS 运营管理后台。统一管理旗下所有产品线（EduApply 留学申请、英语教学等）的公司、顾问、学生数据与 AI 用量。

## 功能模块

| 模块 | 说明 |
|---|---|
| **总览 Dashboard** | 公司 / 顾问 / 案例 / Token 四维指标，Step 漏斗转化图 |
| **公司管理** | 多租户公司列表，套餐配置，启用 / 停用 |
| **顾问管理** | 跨公司顾问账号，归属公司，状态管理 |
| **案例管理** | 全平台案例列表，7 天未更新自动高亮预警 |
| **AI 用量监控** | 今日 / 本月 Token 消耗，按功能分布，14 天趋势 |

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Next.js 16 App Router + TypeScript |
| 数据库 | Supabase（与 EduApply 共用同一实例）|
| 权限 | `service_role` 越权查询，独立 JWT session |
| UI | shadcn/ui + Tailwind CSS v4 |

## 架构

本项目与 EduApply 共用同一个 Supabase 数据库，通过不同的 key 实现权限隔离：

- **EduApply**（顾问端）使用 `anon_key` + RLS，顾问只能看到自己的数据
- **RAAS Admin**（本项目）使用 `service_role_key`，可查所有公司所有顾问的数据
