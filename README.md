# RootFlow v0.4 更新说明

## 🎉 新功能

### 1. 完整词库支持
- ✅ 已将全部 **46,840** 个单词导入数据库
- ✅ 修复了之前只导入"有词根单词"导致 `import` 等常见词缺失的问题
- ✅ 现在搜索任何单词都能找到结果

### 2. 分页功能
- ✅ 搜索结果页面新增分页控制
- ✅ 显示总结果数和当前页码（例如：Showing 1-50 of 234 results）
- ✅ 每页显示 50 个结果，支持前后翻页

### 3. LanGeek API 集成 ⭐
- ✅ 使用 LanGeek 官方 API 自动获取单词数据
- ✅ **一键自动查询**，无需手动复制粘贴
- ✅ 通过服务端 API 路由解决 CORS 跨域问题
- ✅ 显示内容包括：
  - 单词定义
  - 发音
  - **大图展示**（48x48 -> 192x192）
  - 中文翻译（如有）
  - 例句（显示前 2 条）
  - 词汇分类和等级标签
- ✅ 优雅的加载动画和错误处理
- ✅ 每个结果都有直接跳转到 LanGeek 详情页的按钮

### 4. 词汇等级筛选 🎯
- ✅ 支持按考试类型筛选单词：
  - **IELTS** (雅思)
  - **SAT** (美国大学入学考试)
  - **GRE** (研究生入学考试)
  - **TOEFL** (托福)
- ✅ 搜索页面顶部显示筛选按钮
- ✅ 提供批量导入脚本标记高频词汇
- ✅ 包含 IELTS/SAT/GRE 常见词汇示例数据

### 5. 控制台错误修复
- ✅ 修复了首页 `bigint` 序列化导致的控制台报错
- ✅ 所有 TypeScript 类型错误已修复
- ✅ 修复了 CORS 跨域问题

## 📦 Docker 部署

项目已包含完整的 Docker 支持：

### 构建镜像
\`\`\`bash
docker build -t rootflow .
\`\`\`

### 运行容器
\`\`\`bash
docker run -p 3000:3000 -v $(pwd)/prisma/dev.db:/app/prisma/dev.db rootflow
\`\`\`

**注意**：首次运行需要先在本地执行数据库迁移和种子：
\`\`\`bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
\`\`\`

## 🚀 本地开发

### 安装依赖
\`\`\`bash
npm install
\`\`\`

### 数据库设置
\`\`\`bash
# 生成 Prisma Client
npx prisma generate

# 运行迁移
npx prisma migrate dev

# 导入数据（需要约 10-15 分钟）
npx tsx prisma/seed.ts
\`\`\`

### 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000)

## 🎨 技术栈

- **前端**: Next.js 16 (App Router) + TailwindCSS
- **数据库**: SQLite + Prisma ORM
- **外部 API**: LanGeek Dictionary API
- **部署**: Docker + Node.js 20

## 📊 数据统计

- **总单词数**: 46,840
- **PIE 词根数**: 635
- **词根-单词关联**: 12,397

## 🔧 API 端点

### LanGeek API
\`\`\`
GET https://api.langeek.co/v1/cs/en/word/?term={word}&filter=,inCategory,photo,withExamples
\`\`\`

## 📝 待办事项

- [ ] 添加用户认证系统
- [ ] 实现笔记功能（Markdown 编辑器）
- [ ] 添加词根熟悉度追踪
- [ ] 集成更多词典 API（如 Oxford, Cambridge）
- [ ] 导出学习进度功能
- [ ] 添加单词测验功能

## 🐛 已知问题

- LanGeek API 可能对某些生僻词返回空数据
- 分页在词根搜索结果中暂未实现（仅单词列表有分页）

## 📄 许可证

MIT License
