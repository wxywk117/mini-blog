---
name: track-codebuddy-in-git
overview: 把工作区中被忽略的 `.codebuddy/` 目录（`skills/` 技能目录与 `plans/` 计划文件）纳入 Git 版本管理并推送到 GitHub 公开仓库 mini-blog。
todos:
  - id: add-skill-placeholder-and-ignore
    content: 新增 .codebuddy/skills/README.md 并在 .gitignore 添加白名单规则
    status: completed
  - id: commit-codebuddy
    content: 暂存并提交 .codebuddy 技能目录与计划文件
    status: completed
    dependencies:
      - add-skill-placeholder-and-ignore
  - id: push-and-verify
    content: 推送 main 至 origin 并核验远端包含 .codebuddy 文件
    status: completed
    dependencies:
      - commit-codebuddy
---

## 需求概述
将工作区中当前未被 Git 跟踪的 `.codebuddy/` 目录纳入版本管理，并推送到已有的 GitHub 公开仓库 `mini-blog`，使其中的「技能目录」与「计划文件」随代码一起纳入版本历史。

## 核心内容
- **纳入版本管理的内容**：`.codebuddy/skills/`（项目级技能目录）与 `.codebuddy/plans/`（两个已有计划文件 `mini-blog-mvp_58f8d775.md`、`nostalgic-film-background_9cb61dac.md`）。
- **技能目录占位**：`skills/` 当前为空目录，Git 无法跟踪空目录，因此新增一份 `README.md` 作为占位与使用说明（说明该目录用于存放项目级技能、每个技能以子目录 + `SKILL.md` 组织），避免推送后目录在仓库中"消失"。
- **忽略规则白名单化**：在 `.gitignore` 中显式忽略 `.codebuddy/` 下的其它内容（未来可能出现的缓存、会话、临时文件），仅放行 `skills/` 与 `plans/`，防止后续把本地状态误提交到公开仓库。
- **交付结果**：一次 `chore:` 语义化提交 + 推送 `main`，推送后核验远端确实包含这些文件，工作区回到干净状态。

## 约束与边界
- 不修改、不读取 `plans/` 下计划文件的正文内容，仅通过 `git add` 纳入版本管理。
- 不删除 `.codebuddy` 目录，不改动项目业务代码（HTML/CSS/JS 与文档均不变）。
- 不修改全局 Git 配置，提交身份沿用临时参数指定。
- 该仓库为公开仓库，计划文件内容会对外可见（用户已确认接受）。


## 技术栈与工具
- 版本管理：Git（Windows + PowerShell 环境），仓库已存在且 `origin` 指向 `https://github.com/wxywk117/mini-blog`（PUBLIC，默认分支 `main`）。
- 无需任何构建工具或依赖，本任务为纯 Git 操作。

## 实现方案

### 整体策略
采用「白名单式忽略 + 占位文件 + 单次语义化提交」三步完成：先用 `.gitignore` 精确控制 `.codebuddy/` 下哪些内容进入版本库，再补一个 `skills/README.md` 让空目录可被跟踪并具备说明价值，最后一次性提交并推送。

### 关键设计决策

1. **为什么用白名单而非直接 `git add .codebuddy`**
   `.codebuddy/` 属于工具侧目录，未来可能产生缓存、会话记录、日志等文件。若整体纳入，容易把本地状态或大文件误推到公开仓库。采用：
   ```gitignore
   # 协作配置目录：仅跟踪技能与计划，其余本地内容忽略
   .codebuddy/*
   !.codebuddy/skills/
   !.codebuddy/plans/
   ```
   `.codebuddy/*` 只匹配一级子项，因此被放行的 `skills/`、`plans/` 内部文件不受影响；同时新增子目录（如 `.codebuddy/cache/`）会被自动忽略，无需再次维护规则。

2. **为什么 `skills/` 放 README 而不是 `.gitkeep`**
   Git 不跟踪空目录，必须落一个文件。`README.md` 同时承担"占位"和"说明"两件事：解释目录用途、技能的组织结构（`skills/<name>/SKILL.md`），后续新增技能时可直接照此约定扩展，比空的 `.gitkeep` 更有维护价值。

3. **提交粒度**
   单次 `chore:` 提交（`.gitignore` + `skills/README.md` + `plans/*.md`）语义完整、可回滚；不拆成多次，避免产生"忽略规则已加但文件未入库"的中间态。

4. **推送前自检**
   公开仓库不可回撤隐私信息，因此在 `git commit` 后、`push` 前用 `git show --stat --oneline HEAD` 确认本次变更仅含预期文件与体积（计划文件应为 KB 级），异常则 `git reset --soft HEAD~1` 调整后再提交。

### 实现注意事项
- **命令示例（PowerShell）**：
  ```powershell
  cd d:/WXY/weibo
  $gi = @('-c','user.name=wxywk117','-c','user.email=wxywk117@users.noreply.github.com')
  git @gi add .gitignore .codebuddy
  git @gi commit -m "chore: 将 .codebuddy 技能与计划纳入版本管理"
  git push origin main
  ```
- **身份处理**：全局 `user.name` / `user.email` 未配置，必须沿用 `-c` 临时参数，禁止 `git config` 写入。
- **忽略规则顺序**：`.codebuddy` 的规则必须放在 `.gitignore` 末尾的独立小节，且 `!` 放行行紧跟忽略行，保证语义清晰、不被后续规则覆盖。
- **计划文件会被工具重写**：`.codebuddy/plans/*.md` 后续可能因新建计划而变化，届时会表现为"已跟踪文件被修改"，属预期行为，无需特殊处理。
- **不做无关改动**：本次不触碰 `index.html`、`styles.css`、`app.js`、`docs/`、`README.md`，保持变更面最小。
- **可访问性/性能**：纯配置变更，对页面运行与首屏无任何影响。

## 目录结构

```
d:/WXY/weibo/
├── .gitignore                       # [MODIFY] 末尾新增「协作配置目录」小节：忽略 .codebuddy/*，显式放行 .codebuddy/skills/ 与 .codebuddy/plans/；保留既有全部规则不动。
├── .codebuddy/
│   ├── skills/
│   │   └── README.md                # [NEW] 占位与说明文件。说明该目录用于存放项目级技能，约定结构为 skills/<技能名>/SKILL.md（含 name/description 元信息），当前为空占位；同时说明本仓库仅在 Git 中跟踪 skills 与 plans，其余内容由 .gitignore 忽略。
│   └── plans/
│       ├── mini-blog-mvp_58f8d775.md            # [ADD] 已存在文件，仅纳入版本管理，内容不修改。
│       └── nostalgic-film-background_9cb61dac.md # [ADD] 已存在文件，仅纳入版本管理，内容不修改。
└── （其余业务文件与文档均不改动）
```

## 校验方式

| 检查项 | 命令 | 预期 |
| --- | --- | --- |
| 忽略规则生效 | `git status --short` | 仅出现 `.codebuddy/skills/README.md` 与 `.codebuddy/plans/` 相关条目，无其它 `.codebuddy` 内容 |
| 提交内容正确 | `git show --stat --oneline HEAD` | 仅包含 `.gitignore`、`skills/README.md`、两个 plans 文件 |
| 远端已包含 | `git ls-tree -r --name-only origin/main` 过滤 `.codebuddy` | 列出上述 3–4 个路径 |
| 工作区干净 | `git status --short` | 无输出（未被跟踪的本地缓存均被忽略） |

