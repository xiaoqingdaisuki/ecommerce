# ecommerce

## 技术栈

- **运行时**：Node.js 24+
- **包管理**：pnpm 12.18.0
- **开发语言**：TypeScript 6.0.3
- **应用框架**：Next.js 16.4.6（App Router / SSR / Turbopack）
- **界面框架**：React 19.3.1
- **样式**：Tailwind CSS 4.3.5
- **基础组件**：Base UI 1.9.0
- **轮播**：Swiper 14.4.0
- **电商集成**：Shopify Hydrogen 2026.10.3 / Storefront API 2026-10
- **GraphQL 类型校验**：gql.tada 1.9.2
- **数据校验**：Zod 4.6.7
- **性能指标**：web-vitals 6.2.3
- **代码格式化**：Prettier 3.10.1

## 项目目录

```text
.
├── app/                                  # 页面路由与接口
│   ├── (store)/                          # 商店页面路由组
│   │   ├── page.tsx                      # 首页
│   │   ├── layout.tsx                    # 页面流式渲染边界
│   │   ├── loading.tsx                   # 页面加载占位
│   │   ├── error.tsx                     # 页面错误回退
│   │   ├── account/page.tsx              # 账户入口
│   │   ├── cart/page.tsx                 # 购物车页面
│   │   ├── collections/
│   │   │   ├── page.tsx                  # 分类目录
│   │   │   └── [handle]/
│   │   │       ├── page.tsx              # 分类商品列表
│   │   │       └── products/[productHandle]/page.tsx # 分类下的商品详情入口
│   │   ├── products/[handle]/page.tsx     # 商品详情
│   │   ├── search/page.tsx               # 搜索结果
│   │   ├── support/page.tsx              # 帮助与常见问题
│   │   ├── pages/[handle]/page.tsx        # CMS 页面与联系页
│   │   ├── policies/[handle]/page.tsx     # 商店政策
│   │   └── blogs/[blogHandle]/
│   │       ├── page.tsx                  # 博客文章列表
│   │       └── [articleHandle]/page.tsx  # 博客文章详情
│   ├── api/
│   │   ├── products/[handle]/route.ts     # 商品详情读取接口
│   │   ├── vitals/route.ts               # 性能指标接收接口
│   │   └── webhooks/shopify/route.ts      # Shopify Webhook 与缓存失效
│   ├── layout.tsx                        # 根布局与元信息
│   ├── app-shell.tsx                     # 页面外壳与公共数据
│   ├── providers.tsx                     # 全局上下文
│   ├── globals.css                       # 全局样式与组件样式
│   ├── global-error.tsx                  # 根级错误回退
│   ├── not-found.tsx                     # 404 页面
│   ├── robots.ts                         # 搜索引擎抓取规则
│   └── sitemap.ts                        # 站点地图
├── components/                           # 公共组件
│   ├── cart/
│   │   ├── cart-content.tsx              # 商品行、优惠码与订单汇总
│   │   └── cart-drawer.tsx               # 侧边购物车
│   ├── checkout/checkout-button.tsx      # 结账按钮
│   ├── collection/
│   │   ├── catalog-controls.tsx          # 筛选、排序与目录搜索
│   │   ├── pagination.tsx                # 分页导航
│   │   └── product-grid.tsx              # 商品网格
│   ├── home/hero.tsx                     # 首页主视觉轮播
│   ├── layout/
│   │   ├── header.tsx                    # 顶部导航
│   │   ├── footer.tsx                    # 页脚
│   │   ├── mobile-menu.tsx               # 移动端导航
│   │   ├── cms-content.tsx               # HTML 清理与内容渲染
│   │   ├── service-strip.tsx             # 服务信息栏
│   │   └── shopify-runtime.tsx           # Shopify 隐私与客服脚本
│   ├── performance/web-vitals.tsx        # 浏览器性能指标采集
│   ├── product/
│   │   ├── price.tsx                     # 售价与划线价
│   │   ├── product-badges.tsx            # 折扣与售罄标签
│   │   ├── product-card.tsx              # 商品卡片
│   │   ├── product-carousel.tsx          # 推荐商品轮播
│   │   ├── product-experience.tsx        # 详情页图片与规格状态联动
│   │   ├── product-gallery.tsx           # 商品图库与缩放
│   │   ├── product-purchase.tsx          # 规格、数量与购买操作
│   │   ├── quick-buy-button.tsx          # QUICK SHOP 入口
│   │   └── quick-buy.tsx                 # QUICK SHOP 弹窗
│   ├── search/search-dialog.tsx          # 预测搜索弹窗
│   └── ui/
│       ├── commerce-provider.tsx         # 购物车与快速购买状态
│       ├── icons.tsx                     # 内联 SVG 图标
│       ├── progressive-swiper.tsx        # 延迟增强的 Swiper 容器
│       └── skeletons.tsx                 # 骨架屏
├── lib/                                  # 数据访问与工具
│   ├── cache/tags.ts                     # 缓存标签
│   ├── seo/json-ld.ts                    # 结构化数据安全序列化
│   ├── shopify/
│   │   ├── client.ts                     # Storefront 客户端
│   │   ├── env.ts                        # 环境变量校验
│   │   ├── i18n.ts                       # 国家与语言配置
│   │   ├── cart.client.ts                # 购物车客户端 Hooks
│   │   ├── cart.server.ts                # 购物车服务端处理
│   │   ├── search.server.ts              # 预测搜索服务端处理
│   │   ├── webhook.ts                    # Webhook 验签与请求体校验
│   │   ├── fragments/product.ts          # 商品 GraphQL 公共片段
│   │   ├── mutations/checkout.ts          # 立即购买与结账操作
│   │   └── queries/
│   │       ├── catalog.ts                # 商品与分类查询定义
│   │       ├── catalog.server.ts         # 商品、分类与推荐数据访问
│   │       ├── content.server.ts         # 商店、菜单与 CMS 数据访问
│   │       ├── blog.server.ts            # 博客数据访问
│   │       ├── pages.ts                  # 站点地图查询定义
│   │       ├── search.ts                 # 搜索查询定义
│   │       └── search.server.ts          # 搜索结果数据访问
│   └── utils/
│       ├── cart-savings.ts               # 优惠金额计算
│       ├── catalog-fetch.ts              # 公共数据请求重试
│       ├── catalog-filters.ts            # 筛选参数校验与转换
│       ├── collection-presets.ts         # 内置分类配置
│       ├── gallery-engine.ts             # 图库 Swiper 初始化
│       ├── idle.ts                       # 空闲任务调度
│       ├── money.ts                      # 金额格式化
│       ├── navigation.ts                 # 共享导航配置
│       ├── product-variant.ts            # 默认商品规格解析
│       ├── shopify-routes.ts             # 分页、排序与规格 URL 工具
│       ├── storefront-url.ts             # Shopify 链接转换
│       ├── swiper-engine.ts              # 通用 Swiper 初始化
│       └── vitals.ts                     # 性能指标与路由校验
├── tests/                                # 自动化测试
│   ├── cart-savings.test.ts              # 优惠计算与临时购物车状态
│   ├── catalog-filters.test.ts           # 筛选参数与查询转换
│   ├── performance.test.ts               # 指标校验与请求重试
│   ├── product-card.test.ts              # 卡片价格与折扣一致性
│   ├── product-variant.test.ts            # 默认规格与规格回退
│   ├── shopify-routes.test.ts             # URL、分页与规格参数
│   └── webhook.test.ts                   # 验签、请求大小与缓存标签
├── .env.example                          # 环境变量示例
├── .env.local                            # 本地环境变量（不提交）
├── .gitignore                            # Git 忽略规则
├── .prettierignore                       # 格式化忽略规则
├── .prettierrc.json                       # Prettier 配置
├── next-env.d.ts                         # Next.js 自动生成类型入口
├── next.config.ts                        # Next.js、缓存与图片配置
├── package.json                          # 依赖与命令
├── pnpm-lock.yaml                        # 依赖版本锁定
├── pnpm-workspace.yaml                   # pnpm 构建依赖许可
├── postcss.config.mjs                    # PostCSS 配置
├── proxy.ts                              # Shopify 路由代理
├── tsconfig.json                         # TypeScript 配置
├── tsconfig.graphql.json                 # GraphQL 类型校验配置
├── vercel.json                           # Vercel 构建与响应头配置
├── LICENSE                               # 开源许可
└── README.md                             # 技术栈与目录说明
```
