# 自定义域名 + SEO 配置指南

## 1. 购买域名

推荐域名: `skillmarket.dev` 或 `skillmarket.ai`

推荐注册商:
- **Cloudflare Registrar** — 成本价，无加价
- **Namecheap** — 便宜，UI 友好
- **Google Domains** (已迁移到 Squarespace)

## 2. Vercel 配置自定义域名

### Step 1: 添加域名到 Vercel 项目
1. 打开 [Vercel Dashboard](https://vercel.com) → 选择 `skill-market-web` 项目
2. Settings → Domains → 输入你的域名（如 `skillmarket.dev`）
3. 点击 "Add"

### Step 2: DNS 配置
Vercel 会显示需要添加的 DNS 记录。通常是:

**方案 A: 使用 Vercel DNS (推荐)**
将域名的 nameservers 改为 Vercel 提供的 NS 记录。

**方案 B: 保留原 DNS，添加记录**
| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

### Step 3: 等待 DNS 生效
- 通常 5-30 分钟
- 可用 `dig skillmarket.dev` 检查

### Step 4: SSL 证书
Vercel 自动配置 Let's Encrypt SSL，无需操作。

## 3. 环境变量更新

域名生效后，更新 Vercel 环境变量:

```bash
# Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_SITE_URL=https://skillmarket.dev
NEXTAUTH_URL=https://skillmarket.dev
```

## 4. 提交 Sitemap 到 Google Search Console

### Step 1: 验证网站所有权
1. 打开 [Google Search Console](https://search.google.com/search-console)
2. 点击 "Add Property"
3. 选择 "URL prefix" → 输入 `https://skillmarket.dev`
4. 验证方式选 "DNS record":
   - 添加 Google 提供的 TXT 记录到 DNS
   - 或选择 "HTML tag" 验证（已在 layout 支持 `<meta name="google-site-verification">`)

### Step 2: 提交 Sitemap
1. 验证通过后，左侧菜单 → Sitemaps
2. 输入: `https://skillmarket.dev/sitemap.xml`
3. 点击 "Submit"

### Step 3: 请求索引
- URL Inspection → 输入首页 URL → Request Indexing
- 对重要的 skill 页面也做同样操作

## 5. 已实现的 SEO 功能

| 功能 | 状态 | 说明 |
|------|------|------|
| sitemap.xml | ✅ | 动态生成，包含所有 approved skills |
| robots.txt | ✅ | 允许爬取公开页面，禁止 /api/、/admin/、/profile/ |
| Meta title/description | ✅ | 每个页面独立设置，skill 页面动态生成 |
| Open Graph tags | ✅ | 所有页面，支持社交分享预览 |
| Twitter Cards | ✅ | summary_large_image |
| Canonical URLs | ✅ | 每个页面设置 canonical，避免重复内容 |
| JSON-LD | ✅ | Skill 详情页 SoftwareApplication schema |
| Keywords | ✅ | 全局 + 页面级关键词 |

## 6. 后续优化建议

- [ ] 添加 Google Analytics 4 (GA4) 跟踪代码
- [ ] 配置 `google-site-verification` meta tag（在 layout.tsx metadata 中添加 `verification` 字段）
- [ ] 添加 OG Image（可用 Vercel OG 动态生成）
- [ ] 监控 Search Console 的 Coverage 报告，修复爬取错误
