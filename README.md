# 小记 MiniBlog

一个纯 HTML + CSS + JavaScript 实现的短消息记录应用，零依赖、零构建、可离线运行。数据保存在浏览器本地存储中，不上传、不联网、不需要注册。

> 写下此刻，留在本地。

## 特性

- 发布纯文本动态（上限 280 字），实时字数统计与超限拦截
- 时间倒序信息流，相对时间显示（刚刚 / x 分钟前 / x 小时前 / x 天前）
- 数据写入 `localStorage`，刷新或重开浏览器后依然存在
- 单条删除，带二次确认
- 空状态引导、安全转义（不做 HTML 解析）、响应式布局
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
├── styles.css            # 样式（设计令牌、布局、动效、响应式）
├── app.js                # 逻辑（存储层 / 业务层 / 渲染层 / 事件绑定）
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

本项目为独立设计与实现的通用短消息记录示例，不包含任何第三方社交平台的名称、商标、图标、配色或页面结构。详见 `docs/REQUIREMENTS.md` 第 2 章。
