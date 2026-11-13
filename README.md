# 小记 MiniBlog

一个纯前端的短消息记录应用。**v2.0.0 起改为 Node.js 工程化实现：Vite + Vue 3 + TypeScript + Pinia**，数据依旧只保存在浏览器本地存储中，不上传、不联网、不需要注册。

> 写下此刻，留在本地。

## 特性

- 发布纯文本动态（上限 280 字），实时字数统计与超限拦截
- 时间倒序信息流，相对时间显示（刚刚 / x 分钟前 / x 小时前 / x 天前），每分钟自动刷新
- 数据写入 `localStorage`，刷新或重开浏览器后依然存在；旧版数据可直接读取
- 单条删除，带二次确认
- 空状态引导、安全转义（正文一律按纯文本渲染）、响应式布局
- 胶片老照片怀旧背景：本地素材 + 做旧滤镜 + 颗粒 / 暗角 / 漏光多层合成
- 支持 `Ctrl/Cmd + Enter` 快捷发布
- 75 个单元与组件测试覆盖纯函数、存储层、状态管理与组件交互

## 技术栈

| 层 | 选型 |
| --- | --- |
| 构建 | Vite 8 |
| 框架 | Vue 3.5（Composition API + `<script setup>`） |
| 语言 | TypeScript 6（`strict`，`vue-tsc` 类型检查） |
| 状态 | Pinia 4（setup store） |
| 测试 | Vitest 5 + Vue Test Utils + jsdom |
| 存储 | `window.localStorage`（键：`miniblog.posts.v1`） |
| 样式 | 原生 CSS（设计令牌 + 组件类，无 UI 框架） |

## 快速开始

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（默认 http://localhost:5173）
```

其他脚本：

| 命令 | 说明 |
| --- | --- |
| `npm run test` | 监听模式运行测试 |
| `npm run test:run` | 单次运行全部测试 |
| `npm run test:coverage` | 生成覆盖率报告（`coverage/`） |
| `npm run typecheck` | `vue-tsc --noEmit` 类型检查 |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 预览构建产物 |

构建产物为纯静态文件，可直接部署到任意静态托管（GitHub Pages / Netlify / Nginx）。

## 目录结构

```
.
├── index.html                  # Vite 入口
├── src/
│   ├── main.ts                 # 应用挂载（Pinia + 全局样式）
│   ├── App.vue                 # 页面装配：背景 + 顶栏 + 发布器 + 信息流 + 页脚
│   ├── styles/main.css         # 全局样式（设计令牌、胶片背景栈、响应式）
│   ├── types/post.ts           # Post / StorageLike / ValidationResult 类型
│   ├── lib/
│   │   ├── text.ts             # 码点计数、内容校验、计数文案
│   │   ├── time.ts             # 相对时间与绝对时间格式化
│   │   ├── post.ts             # 数据整理、排序、id 生成、构造动态
│   │   └── storage.ts          # localStorage 读写与降级（可注入 Storage）
│   ├── stores/posts.ts         # Pinia store：唯一数据源与全部副作用
│   ├── composables/            # 相对时间刷新、文本域自适应、顶栏滚动
│   └── components/             # BackgroundLayers / AppTopbar / ComposerBox / PostList / PostCard / EmptyState
├── tests/
│   ├── unit/                   # 纯函数与存储层
│   ├── stores/                 # Pinia store
│   └── components/             # 组件交互
├── legacy/                     # v1.0.0 纯静态版本（归档，可直接双击运行）
├── assets/legacy-film.jpg      # 胶片背景素材（两版共用）
├── docs/REQUIREMENTS.md        # 需求规格说明书（含测试策略与验收记录）
└── vite.config.ts / tsconfig.json / vitest.setup.ts
```

## 测试与验收

```bash
npm run test:run    # 8 个测试文件 / 75 个用例
npm run typecheck   # 0 error
npm run build       # 构建成功，dist 内含 hashed 资源
```

覆盖范围：

| 测试文件 | 关注点 |
| --- | --- |
| `tests/unit/text.spec.ts` | 码点计数、空白校验、280/281 边界、计数文案 |
| `tests/unit/time.spec.ts` | 相对时间全边界、未来时间、绝对时间格式 |
| `tests/unit/post.spec.ts` | 非法数据过滤、默认作者、倒序、id 唯一、渲染上限 |
| `tests/unit/storage.spec.ts` | 空存储、读写回环、损坏 JSON 不覆盖、写入异常、存储不可用 |
| `tests/stores/posts.spec.ts` | 加载排序、发布置顶、校验拦截、删除、写入失败提示 |
| `tests/components/*.spec.ts` | 计数联动、快捷发布、纯文本渲染、删除确认两条路径、空状态切换 |

浏览器端验收（v2.0.0）：空状态 → 发布两条 → 置顶与计数一致 → 刷新仍在 → 删除（取消 / 确认）→ 回到空状态 → 375px 单列无横向滚动 → 旧版 `legacy/index.html` 仍可发布。

## 数据存储

- 存储键：`miniblog.posts.v1`（与 v1 完全一致，旧数据可直接读取）
- 数据格式：`Post[]` 的 JSON 字符串，按 `createdAt` 降序
- 字段：`id`、`content`、`createdAt`、`author`
- 清空数据：

```js
localStorage.removeItem('miniblog.posts.v1');
```

存储损坏、格式非法或不可用时，应用会自动降级为空列表并保持可用，不会白屏。

## 旧版归档

`legacy/` 保留了 v1.0.0 的纯静态实现（`index.html` + `styles.css` + `app.js`），双击 `legacy/index.html` 即可运行，用于对照与回退。两版共用 `assets/legacy-film.jpg`。

## 更换背景图

1. 准备一张横版复古照片，重命名为 `legacy-film.jpg`，覆盖 `assets/` 下的同名文件（建议长边 1024–1920px，体积 < 300KB）。
2. 若主体位置偏移，调整 `src/styles/main.css`（旧版为 `legacy/styles.css`）中 `.mb-backdrop__photo` 的 `background-position`，以及 `@media (max-width: 640px)` 内的同名属性。
3. 若新图偏冷或偏亮，微调 `.mb-backdrop__photo` 的 `filter`（`sepia` / `saturate` / `contrast` / `brightness`）即可保持统一做旧风格。

背景由 5 层合成：照片 → 暖色遮罩与暗角 → 胶片颗粒（内联 SVG）→ 暖色漏光 → 淡紫光斑与细网格。全部图层 `pointer-events: none`，不影响交互与键盘焦点顺序。

## 版本管理

提交信息遵循 Conventional Commits（`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`）；`main` 为可运行主干，推送前需保证 `test:run`、`typecheck`、`build` 全部通过。

## 声明

本项目为独立设计与实现的通用短消息记录示例，不包含任何第三方社交平台的名称、商标、图标、配色或页面结构。

背景素材 `assets/legacy-film.jpg` 由 AI 生成并裁切压缩，画面为泛化的旧墙、木窗与石墙，不含任何文字、招牌、Logo、可识别人物面部或车辆品牌，可随仓库一同分发。详见 `docs/REQUIREMENTS.md` 第 2 章与 9.4 节。
