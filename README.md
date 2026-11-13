# 小记 MiniBlog

一个纯 HTML + CSS + JavaScript 实现的短消息记录应用，零依赖、零构建、可离线运行。数据保存在浏览器本地存储中，不上传、不联网、不需要注册。

> 写下此刻，留在本地。

## 特性

- 发布纯文本动态（上限 280 字），实时字数统计与超限拦截
- 时间倒序信息流，相对时间显示（刚刚 / x 分钟前 / x 小时前 / x 天前）
- 数据写入 `localStorage`，刷新或重开浏览器后依然存在
- 单条删除，带二次确认
- 空状态引导、安全转义（不做 HTML 解析）、响应式布局
- 胶片老照片怀旧背景：本地素材 + 做旧滤镜 + 颗粒 / 暗角 / 漏光多层合成
- 支持 `Ctrl/Cmd + Enter` 快捷发布

## 快速开始

方式一：直接双击 `index.html`，用浏览器打开即可。

方式二：启动本地静态服务（可选，便于在移动端同局域网访问）：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

无需 `npm install`，无需任何构建步骤。

## 目录结构

```
.
├── index.html            # 页面结构
├── styles.css            # 样式（设计令牌、布局、胶片背景、动效、响应式）
├── app.js                # 逻辑（存储层 / 业务层 / 渲染层 / 事件绑定）
├── assets/
│   └── legacy-film.jpg   # 胶片老照片背景素材（本地，离线可用）
├── docs/
│   └── REQUIREMENTS.md   # 需求规格说明书（功能、数据模型、验收标准）
├── README.md
└── .gitignore
```

## 数据存储

- 存储键：`miniblog.posts.v1`
- 数据格式：`Post[]` 的 JSON 字符串，按 `createdAt` 降序
- 字段：`id`、`content`、`createdAt`、`author`
- 清空数据：浏览器开发者工具 → Application → Local Storage → 删除 `miniblog.posts.v1`，或在控制台执行：

```js
localStorage.removeItem('miniblog.posts.v1');
```

存储损坏或不可用时，页面会自动降级为空列表并保持可用，不会白屏。

## 二次开发

常用参数集中在 `app.js` 顶部：

| 常量 | 含义 | 默认值 |
| --- | --- | --- |
| `STORAGE_KEY` | 本地存储键名 | `miniblog.posts.v1` |
| `MAX_LEN` | 单条内容字数上限 | `280` |
| `MAX_RENDER` | 单次渲染上限 | `200` |

修改数据结构时请同步提升存储键版本号（如 `v2`），避免旧数据解析异常。

## 更换背景图

1. 准备一张横版复古照片，重命名为 `legacy-film.jpg`，覆盖 `assets/` 下的同名文件（建议长边 1024–1920px，体积 < 300KB）。
2. 若主体位置偏移，调整 `styles.css` 中 `.mb-backdrop__photo` 的 `background-position`（桌面）以及 `@media (max-width: 640px)` 内的同名属性（移动端）。
3. 若新图偏冷或偏亮，微调 `.mb-backdrop__photo` 的 `filter`（`sepia` / `saturate` / `contrast` / `brightness`）即可与其他部分保持统一的做旧风格。

背景氛围由 5 层合成：照片 → 暖色遮罩与暗角 → 胶片颗粒（内联 SVG）→ 暖色漏光 → 原有的淡紫光斑与细网格。遮罩透明度集中在 `.mb-backdrop__shade` 中，可按需微调以平衡"氛围"与"可读性"。所有图层均为 `pointer-events: none`，不影响交互与键盘焦点顺序。

## 版本管理

```bash
git init -b main
git add .
git commit -m "chore: 初始化项目结构与忽略规则"
git remote add origin <your-repo-url>
git push -u origin main
```

提交信息遵循 Conventional Commits（`feat` / `fix` / `docs` / `style` / `refactor` / `chore`）。

## 声明

本项目为独立设计与实现的通用短消息记录示例，不包含任何第三方社交平台的名称、商标、图标、配色或页面结构。

背景素材 `assets/legacy-film.jpg` 由 AI 生成并裁切压缩，画面为泛化的旧墙、木窗与石墙，不含任何文字、招牌、Logo、可识别人物面部或车辆品牌，可随仓库一同分发。详见 `docs/REQUIREMENTS.md` 第 2 章与 9.4 节。
