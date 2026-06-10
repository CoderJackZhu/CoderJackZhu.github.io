---
title: Codex 造零件，Hermes 养系统：我用 Hermes 实践 PassiveAgent 的过程
date: 2026-06-10 15:11:04
tags: Agent, Hermes, PassiveAgent, AI工具, 工程实践
categories: Agent实践
keywords: Hermes Agent, PassiveAgent, Codex, Claude Code, 自进化, Agent工程, 个人知识管理
description: 以 PassiveAgent 为案例，记录我如何用 Hermes 作为长期项目工作台，配合 Codex/Claude Code 开发一个个人注意力调度系统，以及对 Agent 自进化和工程化实践的思考。
top_img: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/passiveagent-hermes-cover.svg
comments: true
cover: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/passiveagent-hermes-cover.svg
toc: true
toc_number: true
copyright: true
copyright_author: Jack Zhu
copyright_author_href: https://jackzhu.top
copyright_url: http://jackzhu.top/
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
---

最开始做 PassiveAgent 的时候，我其实一直有一个疑问：如果只是写代码，用 Codex 和 Claude Code 不就够了吗？为什么还要把 Hermes 放进这个开发过程里？

这个问题很真实。因为在今天，写一个 Python CLI、补几个模块、改几个 bug、加一些测试，Codex / Claude Code 确实已经非常强了。甚至可以说，如果目标只是“把代码写出来”，Hermes 并不是最核心的工具。

但 PassiveAgent 做到初具规模之后，我对这个问题的答案逐渐清晰了：

> Codex / Claude Code 更像施工队，负责把一个个功能实现出来；Hermes 更像这个项目的长期操作系统，负责记住项目、编排工具、沉淀经验，并让这个系统在真实环境里长期活下去。

这篇文章想分享的，不只是 PassiveAgent 这个项目本身，也包括我在用 Hermes 开发它的过程中，对 Agent 工具分工、自进化、长期个人系统的一些体会。

![Codex 造零件，Hermes 养系统](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/passiveagent-hermes-cover.svg)

---

这篇文章可以按两条线看：一条线是 PassiveAgent 作为个人注意力调度系统的项目介绍；另一条线是 Hermes 在这个项目中扮演的角色——它不是替代 Codex/Claude Code，而是把一次性 coding 能力放进长期可记忆、可验证、可演化的工程闭环里。

---

## PassiveAgent 是什么

PassiveAgent 是我给自己做的一个“个人注意力调度系统”。

现在资料太多了：Zotero 里有论文，Obsidian 里有摘录和临时链接，GitHub Stars 里有项目，HuggingFace Daily Papers 每天也有新论文。真正的问题不是“没有资料”，而是每天不知道应该先看哪几个。

PassiveAgent 要解决的问题就是：

> 每天从多个信息池里挑出少量真正值得看的内容，摘要、打分、排序，然后推送给我。

它的基础流程大概是：

```text
Zotero / Obsidian / HuggingFace Daily / GitHub Stars
        ↓
采集与标准化
        ↓
去重
        ↓
LLM 摘要与多维度打分
        ↓
Rank Top N
        ↓
飞书推送 / CLI 查看
        ↓
看、忽略、加入周末、生成面试卡或技术笔记
        ↓
反馈影响后续推荐
```

它适合的场景很明确：不是替我刷信息流，而是替我减少信息流；不是每天推一堆“可能有用”的东西，而是只推少量和当前目标高度相关的内容。

当前我的主要目标是 Agent / LLM / 算法工程方向的学习和面试准备，所以 PassiveAgent 的打分逻辑会围绕这些主题进行。

---

![PassiveAgent 架构：从资料池到注意力调度](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/passiveagent-hermes-architecture.svg)

## 项目结构：一个小型但完整的 Agent 应用

PassiveAgent 不是一个单文件脚本，而是一个完整的小型 Agent 应用。当前项目结构大致是：

```text
PassiveAgent/
├── config.yaml.example      # 配置模板
├── .env.example             # 环境变量模板，不提交真实密钥
├── prompts/                 # LLM prompt 模板
├── docs/                    # 配置、飞书、定时任务、排障文档
├── scripts/                 # launchd 安装脚本和 plist 模板
├── src/passive_agent/
│   ├── main.py              # CLI 入口
│   ├── pipeline.py          # 每日处理流水线
│   ├── collectors/          # 数据采集器
│   ├── processors/          # 去重、摘要、打分、排序
│   ├── actions/             # 用户操作处理
│   ├── feishu/              # 飞书 Bot、卡片、回调、命令
│   ├── integrations/        # LLM、Obsidian、Zotero 等外部集成
│   └── storage/             # SQLite 数据库和模型
└── tests/
```

技术栈比较朴素：Python 3.11+、SQLite、Click、Jinja2、OpenAI-compatible LLM API、飞书开放平台。它没有复杂的 Web 前端，也没有刻意追求“平台化”，核心目标就是每天稳定地帮我筛选内容。

配置集中在 `config.yaml`，大致分成 8 类：

```yaml
runtime:          # 数据库、报告、prompt 路径
llm:              # LLM provider、model、base_url、并发、重试
goals:            # 当前目标、优先级主题、低优先级主题
sources:          # Zotero / Obsidian / GitHub Stars / HF Daily
display:          # dashboard、推送、报告展示数量
recommendations:  # 推荐生命周期与关联条目数量
feishu:           # 飞书异步超时等
scoring:          # 打分权重、daily_limit、负反馈降权
```

这样做的好处是：这个项目不是“我自己电脑上碰巧能跑的脚本”，而是一个可以解释、可以迁移、可以排障的系统。

---

## 怎么使用

最短路径其实很简单：

```bash
git clone https://github.com/CoderJackZhu/PassiveAgent.git
cd PassiveAgent
uv sync
cp config.yaml.example config.yaml
cp .env.example .env
uv run passive-agent init-db
uv run passive-agent daily
```

然后可以用这些命令查看结果：

```bash
uv run passive-agent status
uv run passive-agent dashboard
uv run passive-agent list --stage recommended
```

如果接入飞书，则可以主动推送：

```bash
uv run passive-agent feishu-push --stage recommended --limit 5
```

日常使用时，我更希望它不是一个“需要我主动打开的工具”，而是一个低打扰的系统：每天晚上定时跑一次，挑出 3 条左右值得看的内容推给我；周末再推一个适合深读的队列。

在飞书卡片里，我可以对每条内容做操作：

- 展开详情；
- 加入周末阅读；
- 忽略并记录负反馈；
- 在展开后生成面试卡；
- 生成技术笔记；
- 标记已读。

其中“面试卡”和“技术笔记”不是只在飞书里展示一下，而是会写入本地 Obsidian vault。例如：

```text
01-Interview/{topic}/{title}.md
03-Tech-Notes/{topic}/{title}.md
```

这点对我很重要。因为 PassiveAgent 不应该只是一个推荐器，它还应该把有价值的信息沉淀到我的知识系统里。

---

## 一个推荐样例

一个典型的推送条目会包含这些信息：

```text
标题：某篇关于 Agent 记忆机制 / Tool Use / RAG 评测的论文或文章
来源：Zotero / HuggingFace Daily / Obsidian / GitHub Stars
摘要：用几句话解释它解决的问题、核心方法和可能价值
评分：目标相关性、新颖性、可操作性、难度匹配、来源质量、时效性
推荐理由：为什么今天值得看
可执行动作：展开 / 周末 / 忽略 / 生成面试卡 / 技术笔记
```

例如，如果它发现一篇和 Agent memory 相关的论文，它不会只是告诉我“这篇论文很新”，而是会尝试回答：

- 它和我当前准备 Agent 算法岗面试有什么关系？
- 它适合今天快速浏览，还是适合周末深读？
- 它能不能转成一道面试题？
- 它能不能沉淀成一张技术笔记？

这也是我做 PassiveAgent 的初衷：不是追热点，而是让信息进入“学习—理解—沉淀”的链路。

---

## 那为什么不用 Codex / Claude Code 就行？

回到开头的问题。

如果只是写 PassiveAgent 的某个模块，比如实现一个 HuggingFace Daily collector、写一个 Feishu card、修一个 SQLite 迁移 bug，Codex 和 Claude Code 完全够用，而且非常适合。

所以我并不认为 Hermes 的价值是“比 Codex 更会写代码”。这不是它的核心定位。

我现在更愿意这样理解它们的分工：

| 角色 | 更擅长什么 |
|---|---|
| Codex / Claude Code | 写代码、改 bug、重构、补测试 |
| Hermes | 长期上下文、工具编排、跨会话记忆、运行环境排障、经验沉淀 |

Codex / Claude Code 像施工队。你告诉它：“把这里修一下”“加一个功能”“重构一下这个模块”，它可以快速完成。

Hermes 更像项目的长期工作台。它知道：

- PassiveAgent repo 在哪里；
- 怎么跑测试；
- 怎么跑 daily pipeline；
- 飞书推送需要哪些权限；
- launchd 有哪些坑；
- `.env` 和继承环境变量可能冲突；
- Zotero 分类应该用 collection，而不是靠 tag 乱贴；
- 之前为什么没有推送；
- 之前哪些 bug 已经修过；
- 这些经验下次应该怎么复用。

如果每次都从零开始，Codex/CC 当然也能做。但一旦项目进入长期维护状态，“从零开始”本身就是成本。

Hermes 在这里提供的不是一次性智能，而是连续性。

---

## Hermes 在开发过程里具体做了什么

### 1. 项目记忆：从“一个 repo”变成“一个长期对象”

在开发 PassiveAgent 的过程中，Hermes 逐渐形成了一个项目级记忆：

- 这个项目叫 PassiveAgent；
- 它是个人注意力调度系统；
- 核心输入源是 Zotero、Obsidian、HF Daily、GitHub Stars；
- 核心输出是飞书卡片和 Obsidian 笔记；
- 当前目标是 Agent / LLM / 面试准备；
- 运行方式是 CLI + macOS launchd + Feishu long connection；
- 配置和密钥不能混在一起；
- 文档要面向新用户，而不是只堆配置项。

这些内容后来被沉淀到了专门的 `passive-agent-development` skill 里。于是之后我再问 PassiveAgent 相关问题时，Hermes 不需要重新探索一遍项目，它可以直接带着项目上下文开始工作。

这和普通聊天最大的区别是：项目不再是一段临时上下文，而是一个长期对象。

### 2. 工程排障：处理真实环境里的非代码问题

PassiveAgent 真正麻烦的地方，很多都不是代码本身。

比如飞书：

- 主动发消息需要 `im:message:send_as_bot` 或 `im:message`；
- 接收消息需要订阅 `im.message.receive_v1`；
- 卡片按钮需要 `card.action.trigger`；
- 权限或事件改完以后还要发布新版本，并在租户侧升级；
- `FEISHU_CHAT_ID` 必须来自机器人所在的真实目标聊天。

这些不是“写一个函数”能解决的，它们是系统集成问题。

再比如 launchd：

- macOS 的 `~/Documents`、Desktop、Downloads 会受 TCC 保护；
- user LaunchAgent 错过定时点后不会像 systemd `Persistent=true` 那样自动补跑；
- 环境变量来自 launchctl / plist / `.env`，不同执行路径可能不一致；
- 代理环境变量可能影响飞书长连接。

这些问题如果只交给 coding agent，很容易变成“改了代码但实际没跑通”。Hermes 的优势是它能在一个会话里查日志、读配置、跑命令、结合历史经验，然后给出可验证的判断。

比如有一次 6.3 没有正常推送，最后定位不是 Feishu 失败，也不是 pipeline 报错，而是 Mac 在 21:00 定时点时用户 LaunchAgent 不在可执行状态，后来开机/登录后 launchd 没有补跑错过的任务。

这个结论只有把日志、数据库记录、报告文件、launchd 状态和系统启动时间放在一起看，才比较可靠。

### 3. 工作流沉淀：从“改一下”到 audit → fix → verify → commit

开发过程中逐渐形成了一个固定流程：

```text
audit → fix → verify → commit
```

先审查真实代码和日志，再定位根因；做最小修改；跑测试或真实命令验证；确认后提交。这个流程后来也成为我用 Hermes 处理 PassiveAgent 问题的默认方式。

这件事看起来普通，但很重要。

因为 Agent 工具最容易出问题的地方不是“不会写代码”，而是“太快给出看似合理的改动，但没有验证”。Hermes 在我的使用里承担了一个“完成前验证”的角色：不只是改完，还要确认它真的跑过。

### 4. 技能进化：把踩坑写回系统

PassiveAgent 过程中踩过的坑，后来都被写进了 skill 或文档：

- LLM provider 从 DeepSeek 切到 OpenAI-compatible / MiMo 时，不是只改 YAML，还要确认 LLM factory 是否支持；
- WebUI 能用某个 provider，不代表 launchd daily job 也能用同一套环境；
- `python-dotenv` 默认不覆盖已经存在的环境变量，所以从 Hermes/WebUI 里手动跑 PassiveAgent 时，可能继承到 Hermes 自己的飞书环境变量；
- 所有新采集内容都被去重后，也不能直接结束 pipeline，而应该从 existing recommendations 里继续推送；
- Feishu 卡片上“面试卡”按钮和展开后的“生成面试卡”重复，会造成交互困惑，应该把生成动作放到详情页之后。

这些经验如果只停留在一次对话里，很快就会消失。Hermes 的意义是把它们变成下一次可加载的 procedure memory。

---

![Hermes 自进化闭环](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/passiveagent-hermes-evolution-loop.svg)

## 我理解的“自进化”

这里的自进化不是说模型权重变强了，也不是说 Agent 突然能自己完成一切。

在 PassiveAgent 这个案例里，自进化更像是：

> 每一次真实开发和排障之后，系统都会把经验写回自己的工作流。下一次面对类似问题时，它不再从零开始，而是带着上一次的经验继续工作。

我觉得可以分成四层。

### 第一层：记忆进化

一开始 Hermes 只知道“有个 PassiveAgent 项目”。后来它知道项目路径、运行方式、常见命令、部署方式、数据源、飞书交互、Zotero 分类习惯、用户目标和偏好。

这让后续维护不再是冷启动。

### 第二层：技能进化

项目中反复出现的操作，被沉淀成 skill：

- 如何运行测试；
- 如何手动触发 daily；
- 如何排查飞书；
- 如何检查 launchd；
- 如何做 Zotero taxonomy dry-run；
- 如何迁移 LLM provider；
- 如何写面向用户的 README。

Skill 本质上是 Agent 的操作手册。它不是知识库里的静态资料，而是下一次执行任务时会真的进入上下文的工作规程。

### 第三层：流程进化

从“帮我改一下”，变成“先审查、再修复、再验证、再提交”。

这其实是我对 Agent 工程最深的体会之一：Agent 要可靠，不能只靠更强的模型，还要靠更稳定的流程。

### 第四层：系统进化

PassiveAgent 自己也在这个过程中变得更成熟：

- 配置从硬编码走向显式 YAML；
- LLM 输出增加类型校验和兜底；
- 推荐逻辑支持无新增时从 existing pool 推送；
- 飞书按钮交互变清晰；
- data 目录区分业务报告和运行日志；
- README、配置文档、Feishu 文档、定时任务文档逐渐补齐。

所以自进化不是玄学，而是一个很工程化的闭环：

```text
真实使用 → 暴露问题 → 修复问题 → 验证结果 → 沉淀经验 → 下一次更快更稳
```

---

## 这个过程给我的几个感受

### 1. 不要把 Hermes 当“另一个 Coding Agent”

如果把 Hermes 和 Codex/CC 放在同一个维度比较，它并没有明显优势。

但如果把 Hermes 放在“长期个人 Agent 环境”的维度，它的定位就清楚很多：它不是替代 coding agent，而是承接 coding agent 的产物，并负责长期运行、记忆和演化。

一句话概括：

> Codex 帮我造零件，Hermes 帮我养系统。

### 2. 真正有价值的 Agent 项目，通常不是一次性任务

PassiveAgent 的价值不在于某个单点功能多复杂，而在于它每天进入我的信息流。

这类项目需要长期运行、长期调参、长期排障、长期根据反馈变化。它更像一个个人系统，而不是一个 demo。

Hermes 适合的也正是这种场景：有状态、有历史、有工具、有运行环境、有反馈闭环。

### 3. Agent 的难点经常不在模型，而在边界条件

LLM 摘要和打分只是中间一环。真正花时间的是：

- 数据源质量；
- 去重；
- 评分权重；
- 负反馈；
- 推送节奏；
- 飞书权限；
- launchd 环境；
- 配置与密钥隔离；
- 失败后的可观测性。

这些都是 Agent 应用工程化的一部分。

### 4. 自进化的前提是“把经验写回系统”

如果每次只是让 Agent 改完代码，然后关掉窗口，那么不会有什么自进化。

自进化发生在这些动作里：

- 把踩坑写进 skill；
- 把稳定流程写进文档；
- 把用户偏好写进 memory；
- 把反复出现的问题变成检查项；
- 把一次性排障变成下一次的默认知识。

这也是 Hermes 相比普通一次性问答工具更有意义的地方。

---

## 后续想继续做什么

PassiveAgent 现在只是初具规模，后面还有很多可以继续演进的方向：

1. **补偿机制**：如果 macOS 错过 daily 定时任务，登录后自动检测并补跑。
2. **更细的反馈学习**：不仅记录忽略，还区分“不相关”“太简单”“重复”“暂时不看”。
3. **更强的知识沉淀**：从推荐条目自动生成 Obsidian 结构化笔记，并建立和已有笔记的链接。
4. **面试准备闭环**：把高价值内容进一步转成面试题、回答卡、追问链路。
5. **推荐质量评估**：定期回看过去一周推送，统计真正被阅读、被沉淀、被忽略的比例。

这些方向都不是单纯“再加一个功能”，而是让 PassiveAgent 更像一个能陪我长期学习和筛选信息的个人系统。

---

## 结语

做 PassiveAgent 让我重新理解了 Hermes 的价值。

它不是用来证明“我也有一个 coding agent”。写代码这件事，Codex 和 Claude Code 已经做得很好。Hermes 真正有意思的地方，是它让一个项目拥有长期记忆，让开发过程能沉淀为技能，让排障经验能进入下一次执行，让一个个人 Agent 系统在真实环境里持续演化。

PassiveAgent 管理的是我的信息注意力；Hermes 管理的是这个项目的工程记忆。

前者帮我每天少看一点没那么重要的东西，后者帮我下次少重复一次已经踩过的坑。

这就是我目前理解的 Hermes 实践价值：

> 不是替代 Codex/CC，而是把一次性 coding 能力放进一个长期可记忆、可执行、可调度、可演化的个人工程环境里。
