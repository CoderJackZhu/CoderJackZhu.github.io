---
title: SkillEvolver 复盘：自进化没有成功，但评测框架留下来了
date: 2026-06-20
section: 技术与工程
tags:
  - Agent
  - SkillEvolver
  - 自进化
  - Agent评测
  - Prompt工程
  - 负结果
  - 工程实践
description: 复盘我做 SkillEvolver 自进化项目的全过程：从“让 Prompt Skill 自动变强”的期待，到发现正结果被消融收窄、跨模型迁移为零，最后把项目重新定位为 Agent / Prompt Skill 回归评测框架。
legacyPath: /2026/06/20/SkillEvolver自进化实验复盘/
cover: https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/skillevolver-eval-cover.svg
---

前段时间我做了一个和“自进化”相关的项目，叫 **SkillEvolver**。

项目最开始的想法很诱人：既然现在很多 Agent 都依赖 prompt、skill、system rule、工具使用规范，那么能不能让这些 skill 像代码一样被评测、被修改、被筛选，最终形成一个“越用越强”的闭环？

更具体一点，我想验证的是：

> 当一个 LLM Agent 在修 bug 时，如果 baseline 已经失败，能不能只在这个失败条件下激活一个 debugging skill；然后再通过 mutation + selection，让这个 skill 一代代进化，变得更能 rescue failure，同时不伤害原本能做对的任务？

这个方向看起来很贴近 Agent 产品里的“自进化”叙事：不是训练模型权重，而是在真实任务、失败案例、反馈和评测中不断改进外部 skill。

但做完一轮之后，我的感受很复杂：**项目确实做出了东西，实验也跑通了，文档、报告、测试、论文草稿都齐了；但它没有达到我最初期待的那种“有用”。**

最后我重新检查了整个 repo，结论是：

> **SkillEvolver 不适合继续作为“自动进化出可迁移 Prompt Skill”的项目推进；但它很适合作为一个 Agent / Prompt Skill 评测框架、负迁移诊断工具、负结果研究 artifact 留下来。**

换句话说：

> **自进化没有成功，但评测框架留下来了。**

![SkillEvolver 复盘：从自进化叙事转向 Agent EvalOps](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/skillevolver-eval-cover.svg)

---

## 一、我最开始想做什么

SkillEvolver 的原始目标不是做一个新的 Agent 框架，也不是训练模型权重，而是回答一个非常具体的问题：

> 外部 prompt skill 到底应该怎么用？它是应该 always-on 注入到每次调用里，还是应该只在模型失败时作为干预项出现？

很多 Agent 系统会有类似这样的“技能”：

- 写代码前先读测试；
- 修 bug 时不要大范围重构；
- 遇到边界条件时先检查空输入；
- 如果 visible tests 过了，也要考虑 hidden tests；
- 工具调用失败时先重试，再换策略。

这些东西在 Claude Code、Codex、Hermes skills、AGENTS.md、system prompt 里都很常见。

直觉上，它们是有用的。但问题是：

> 一个 skill 对某类任务有用，不代表它对所有任务都应该 always-on。

比如一个专门处理 `missing_logic` 的 debugging skill，如果默认注入到所有 bug-fixing 任务里，可能会让模型在本来不该补逻辑的地方过度补逻辑，反而把原来能做对的任务改坏。

所以 SkillEvolver 的第一层设计是 **failure-conditioned activation**：

```text
先跑 no-skill baseline
    ↓
如果 visible tests 已经通过：skill 不介入，直接 abstain
    ↓
如果 visible tests 失败：再激活 skill，观察它是否 rescue
```

这样，skill 不再是一个 always-on 的背景噪音，而是一个有明确触发条件的干预项。

---

## 二、为什么选择 Python bug fixing

我一开始没有选择开放式 Agent 任务，而是选择 Python bug fixing，有几个原因。

第一，bug fixing 有自动验证器。每个任务都有 buggy function、visible tests 和 hidden tests，可以用 `pytest` / EvalPlus 来判断结果，不需要 LLM judge，也不需要人工打分。

第二，bug fixing 很适合看 paired outcome flip。对于同一个任务，我们可以比较：

```text
no skill 是否通过？
parent skill 是否通过？
child skill 是否通过？
```

这样就能知道一个 skill 变体具体造成了什么变化：

- baseline fail → skill pass：rescue；
- parent pass → child fail：harm；
- parent fail → child fail：no-op；
- parent pass → child pass：maintain。

第三，这个场景足够贴近 Agent 算法工程师能力：不是简单写 prompt，而是要设计评测协议、控制变量、处理随机性、做消融和跨模型验证。

项目最终使用的是一个 EvalPlusFix / HumanEvalFix 派生的 bug-fixing 设置，校准后得到：

```text
A = 115  baseline visible pass + hidden pass
B = 10   visible pass + hidden fail
C = 1    visible fail + hidden pass
D = 38   visible fail + hidden fail
```

主战场是 D-set：baseline visible 和 hidden 都失败的 38 个任务。因为只有这些任务里，failure-conditioned skill 才真正有机会介入。

---

## 三、项目真正实现了什么

最后 repo 里不只是一个脚本，而是一个比较完整的研究工程 artifact。

核心代码包括：

```text
skillevolver/
├── phase2b_runner.py      # 4-attempt failure-conditioned pipeline
├── mutation.py            # skill mutation operators
├── skill.py               # SkillGenome + YAML I/O
├── seed_avg.py            # k-seed continuous labels + bootstrap CI
├── harm_filter.py         # pre-evaluation harm probe
├── held_aside_select.py   # held-aside selection protocol
└── stage1_cache.py        # baseline cache
```

还有：

```text
scripts/pipeline/          # 实验执行脚本
scripts/analysis/          # 诊断和分析脚本
docs/                      # 设计、架构、进度、spec drift
pilot/reports/             # Phase 2B / 3 / 4 实验报告
pilot/skill_lineage/       # 每轮进化出的 skill YAML
paper/                     # 论文草稿和 evidence map
tests/                     # 无 API 回归测试
```

我也重新跑了测试：

```text
uv run pytest tests/
46 passed in 18.90s
```

所以从工程角度看，它不是完全失败的探索。它有代码、有测试、有实验记录、有论文草稿、有证据地图，甚至 README 里已经把 claim boundary 写得很清楚。

真正的问题不是“做没做出来”，而是：**做出来的东西和最初想证明的东西不是同一个。**

---

## 四、核心设计：不要只看 pass rate，要看 paired flip

SkillEvolver 里我觉得最有价值的一点，是把 prompt / skill 改动从“看 aggregate pass rate”变成了“看 paired flip”。

普通做法可能是：

```text
old prompt pass rate = 40%
new prompt pass rate = 45%
所以 new prompt 更好
```

但这其实很危险。因为 +5% 的背后可能有很多种情况：

```text
救了 5 个任务，没伤任何任务       → 真变好
救了 20 个任务，伤了 15 个任务    → 风险很大
救了 1 个任务，统计噪声造成 +5%   → 不稳
只对一个模型有效，换模型就没了    → 不可迁移
```

所以 SkillEvolver 关心的是更细的归因：

```text
这个 child skill 相比 parent：
- rescue 了哪些任务？
- harm 了哪些任务？
- 哪些任务只是 tie？
- 这些 flip 是否跨 seed 稳定？
- 是否跨 held-out fold 稳定？
- 是否跨模型迁移？
```

配图里的流程就是整个项目的核心。

![Failure-conditioned Skill Evaluation Harness](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/skillevolver-routing-harness.svg)

这个框架后来加了几个关键修正。

### 1. k-seed averaging

LLM 即使 temperature=0，也可能因为服务端、采样、执行环境等原因出现不完全稳定的结果。一个 task 在 3 个 seed 中可能是：

```text
pass, fail, fail
```

如果只用单次结果，就很容易把一次随机 flip 当成方法有效。

所以项目把 per-task label 从二值结果变成了 pass rate：

```text
pass_rate = passed_seeds / total_seeds
```

再用 paired delta 来判断 child 相比 parent 的变化。

### 2. held-aside selection

最初 train-side selection 在小样本下很容易退化成 tie-break。也就是说，几个 child 在 train fold 上看起来差不多，选择规则其实只是在随机挑一个。

后来改成：

```text
train fold 只做 eligibility filter：net Δ >= 0 才能进入候选
held-aside fold 才做 ranking：用未参与过滤的 fold 选 winner
```

这避免了把 train fold 的偶然性当成真正进步。

### 3. harm filter

如果一个 child skill 会伤害 parent 已经能维护住的任务，那么即使它救了一些任务，也要谨慎。

所以项目加入了 harm-aware pre-filter：先在 parent maintained-pass 的 probe set 上看 child 是否引入 regression，超过预算就拒绝。

这个机制的实际节省不大，因为当前 benchmark 太小，probe set 经常也很小；但思路是对的。

---

## 五、看起来最好的正结果

项目中最强的正结果来自 `excess_logic` family。

最后形成的 lineage 是：

```text
excess_logic_debug_v2
  → r0_rephrase_4
    → r1_swap_3
      → r3_rephrase_0
```

在 `deepseek-v3` 上，held-out pass rate 从：

```text
seed v2:        33.3%
r3_rephrase_0:  55.6%
```

best single-round test net Δ 是：

```text
+0.222
```

并且 measured harm 是 0。

如果只看到这里，这篇文章可能就会写成：

> SkillEvolver 成功让 debugging skill 进化，在 held-out 上提升了 22.2 个百分点。

但真正的实验不应该停在这里。

因为这个正结果有几个明显风险：

1. held-out fold 很小，n_test ≤ 3；
2. bootstrap CI95 下界仍然是 0；
3. 只在一个 family 上稳定；
4. 只在一个 source model 上观察到；
5. mutation operator 是否真的有因果贡献还不清楚。

所以后面我继续做了消融、swap robustness、cross-model transfer、method repair。

也正是这些后续实验，把这个项目从“看起来成功”改写成了“有价值但必须收窄”。

---

## 六、Claim Narrowing：正结果是怎么被收窄的

最关键的复盘是：SkillEvolver 的正结果不是被一句话推翻的，而是被一层层收窄的。

![SkillEvolver Claim Narrowing Funnel](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/skillevolver-claim-funnel.svg)

### 第一层：round 0 不稳健

P0 operator ablation 发现，round 0 的增益并不稳健。

在 leave-one-operator-out 的情况下，round 0 的 test net Δ 都 collapse 到 0。

这意味着：

> canonical lineage 里的 `r0_rephrase_4` 不能被解释成一个稳定的 operator-level effect。

它更像是某次小样本、具体上下文里的偶然正向。

### 第二层：swap_example 也不是 operator-class effect

round 1 里最重要的 step 是 `r1_swap_3`。一开始看起来像是 `swap_example` 这个 operator 带来了提升。

但 P0b swap robustness audit 进一步发现：

- 一共审计了 20 次 swap-vs-parent paired evaluations；
- 其中 17 次是 zero；
- 只有 3 次 non-zero；
- non-zero 都来自同一个具体 anti-pattern variant；
- 另一个 variant 在多个 parent 上全是 zero。

所以更准确的说法不是：

> swap_example 这个 operator 有用。

而是：

> 某个具体 anti-pattern 内容，在某个具体 parent 上，产生了一次 paired-flip rescue。

这就把 claim 从“算法发现了有效 operator”收窄成了“评测框架捕捉到一个内容特异的正向事件”。

### 第三层：跨模型迁移为 0

如果一个 skill 真的是通用 debugging strategy，它至少应该在另一个模型上有一些 transfer。

但 cross-model probe 到 `qwen-max` 后，结果是：

```text
r3_rephrase_0 on qwen-max:
Δ = +0.0%
rescues = 0
breaks = 0
transfer_ratio = 0.00
```

后来又补测了 load-bearing step `r1_swap_3`，结果也一样：

```text
qwen-max FC pass rate = 4/16 = 25.0%
和 r3_rephrase_0 一样
没有真实 FC-side gain
```

这说明这个 skill 即使在 `deepseek-v3` 上触发了一次有效 flip，也不是可迁移策略。

### 第四层：failure-derived method repair 也没有带来重复效果

我还尝试修方法：不再只用静态 constraint bank，而是从失败样本里派生新的 add_constraint candidates。

结果是：

```text
held-out test netΔ = 0.000
```

这说明当前 lightweight heuristic candidate generator 还不足以把这个 lineage 变成可重复的 evolution effect。

---

## 七、所以这个项目失败了吗？

这取决于怎么定义成功。

如果成功定义为：

> 做出一个能可靠进化 prompt skill、并且跨模型迁移的系统。

那答案是：**失败了。**

因为当前证据不支持：

- reliable skill evolution；
- portable prompt skills；
- operator-class effect；
- cross-family generalization；
- statistically significant improvement；
- production use。

但如果成功定义为：

> 设计并实现一套能严谨评估 prompt / skill 变体 rescue、harm、no-op、transfer 的实验框架，并用它揭示自进化叙事中的过度宣称风险。

那它是有价值的。

它至少证明了几件事。

### 1. Always-on skill 确实可能伤害已解任务

Phase 2B 里有 A-set always-on harm 的结果。某些 skill 默认注入时，会让模型在本来能做对的任务上变差。

这支持 failure-conditioned routing 的动机。

### 2. Failure-conditioned routing 是一个更安全的 skill 使用方式

如果 baseline 已经 visible pass，skill 不介入，就能结构性避免很多 always-on harm。

这不是模型学会了智能 abstain，而是评测协议和路由机制保证了 abstain。

### 3. Paired flip 比 aggregate pass rate 更诚实

一个 +3%、+5%、+10% 的 pass rate 提升，如果不看背后的 task-level flip，很容易误判。

SkillEvolver 的价值是让这些问题暴露出来：

```text
这个提升到底是救了很多任务？
还是救了一个任务但伤了另一个？
是不是只有一个 seed flip？
是不是换模型就没了？
是不是只有某个具体 prompt 文本有效？
```

### 4. 负结果本身是产出

很多 prompt optimization 项目会停在最好看的数字上。但 SkillEvolver 后续做了消融、跨模型、method repair，最后主动降低 claim。

这件事对我个人其实更有价值：它提醒我，Agent “自进化”这类方向很容易被叙事带着走，真正难的是建立可证伪的评测闭环。

---

## 八、为什么我会觉得它“没用”

因为我最开始潜意识里期待的是一个产品：

> 它能让我的 Agent skill 越来越强，能开源给别人用，能作为一个自进化系统展示。

但最终得到的是一个研究 artifact：

> 它告诉我这个方向在当前设置下站不住，并留下了一套评测协议。

产品和研究 artifact 的体感完全不同。

产品要解决用户问题：

```text
我装上它，我的 Agent 真的变强了。
```

但 SkillEvolver 现在更像是一个诊断仪：

```text
你以为 Agent 变强了？我帮你看看它到底救了谁、伤了谁、换模型还灵不灵。
```

后者不那么令人兴奋，但更真实，也更有长期价值。

---

## 九、从产品角度看：原方向应该停

如果继续把 SkillEvolver 当成“自进化 Skill 产品”，ROI 很低。

原因很直接。

### 1. 用户价值不稳定

当前只在一个 model、一个 family、一个小任务集上有窄域正信号。真实用户不会接受：

> 这个 skill 在 deepseek-v3 的某几个 HumanEvalFix excess_logic 任务上可能有用。

### 2. 泛化失败是硬伤

跨模型到 `qwen-max` 后真实增益为 0。对于产品化来说，这意味着它不是一个通用策略，而更像某个模型上的局部 prompt hack。

### 3. 成本结构不好

要继续证明它有效，需要：

- 更大 benchmark；
- 更多 family；
- 更多模型；
- 更多 seeds；
- 更强 mutation proposal；
- 更严格 held-out。

这些都会持续消耗 API 和工程时间，但当前边际信号已经很弱。

### 4. 竞争叙事不强

Prompt optimization 领域已经有 APE、OPRO、PromptBreeder、TextGrad、DSPy 等方向。SkillEvolver 目前没有证明自己的 search / evolution 方法比这些更强。

所以原方向不值得继续大投入。

---

## 十、真正值得转向的方向：Agent EvalOps

我现在更认可的定位是：

> **Agent / Prompt Skill Regression Testing**

或者叫：

> **Agent EvalOps for Prompt / Skill / Tool Policy Changes**

新的核心问题不是：

> 我能不能自动进化 skill？

而是：

> 我改了一个 prompt、skill、memory rule、tool policy，它到底有没有把 Agent 改好？有没有救一些 case，同时伤另一些 case？是否跨 seed、跨模型、跨任务稳定？

这个问题更真实。

因为任何 Agent 团队都会遇到类似场景：

- 修改 system prompt；
- 新增一条 tool-use policy；
- 调整 memory 写入规则；
- 加一个 coding skill；
- 改一个安全约束；
- 换模型 provider；
- 更新一个 router。

每次改动后，如果只看几个 demo，很容易误判。真正需要的是：

```text
baseline agent vs candidate agent
同一批 tasks
同一批 seeds
同一批 models
输出 paired flip report
```

报告应该回答：

- aggregate score 变了吗？
- rescue cases 是哪些？
- harm cases 是哪些？
- net gain 是否来自少数任务？
- 有没有 high-noise cases？
- 是否跨模型稳定？
- 是否应该 merge / rollback / human review？

这就是 SkillEvolver 真正能长出来的方向。

![SkillEvolver 后续路线：Kill · Keep · Pivot](https://gcore.jsdelivr.net/gh/CoderJackZhu/bloggallery/img/skillevolver-pivot-roadmap.svg)

---

## 十一、如果重做，我会怎么设计下一版

我不会再从“evolution loop”开始，而会从“evaluation harness”开始。

一个更实用的 CLI 可能长这样：

```bash
skilleval eval \
  --baseline prompts/base.md \
  --candidate prompts/new_skill.md \
  --tasks tasks.jsonl \
  --models deepseek-v3,qwen-max \
  --seeds 3 \
  --report report.md
```

输出不是“进化出了什么”，而是：

```text
Aggregate Δ: +3.2%
Rescued cases: 8
Broken cases: 5
Net paired flip: +3
High-noise cases: 12
Cross-model transfer: weak
Recommendation: require human review
```

更进一步，可以把它做成 CI 工具：

```text
如果 pass rate 小幅上涨但 harm cases 增加：阻止合并
如果只在一个模型有效：要求人工 review
如果 rescue/break cancellation 明显：要求拆分 prompt 改动
如果 high-noise cases 太多：增加 seeds 或扩大 eval set
```

这个方向比“自动进化”更贴近真实工程。

---

## 十二、它对我个人有什么价值

虽然它没有完成最初目标，但这个项目对我个人仍然有价值。

它让我实际走了一遍 Agent eval 的完整链路：

- 如何定义 intervention；
- 如何设计 no-skill / parent / child 对照；
- 如何避免 always-on prompt 带来的负迁移；
- 如何用 hidden tests 避免 visible-test overfitting；
- 如何处理 seed noise；
- 如何做 held-out selection；
- 如何做 operator ablation；
- 如何做 cross-model transfer；
- 如何写 claim boundary；
- 如何接受负结果。

这比做一个“看起来会自进化”的 demo 更有用。

因为 Agent 算法工程师真正需要的能力，不只是会把 LLM 串起来，而是能回答：

> 这个 Agent 行为改动到底有没有可靠提升？证据是什么？边界在哪里？上线后会不会伤害原有能力？

SkillEvolver 最后没有证明自进化成功，但它强化了我对这个问题的理解。

---

## 十三、最终结论

我会把这个项目分成三层处理。

| 层级 | 决策 | 原因 |
|---|---|---|
| 原始 self-evolution 方向 | Kill | 证据不支持可靠、可迁移 skill evolution |
| 当前 repo / paper / artifact | Keep | 有完整实验、文档、测试和负结果价值 |
| 后续技术方向 | Pivot | 转向 Agent / Prompt Skill 回归评测与负迁移诊断 |

一句话总结：

> **Kill evolution dream. Keep evaluation harness. Pivot to Agent EvalOps.**

如果未来继续做，我不会再问“能不能让 skill 自动变强”，而会问：

> **当我修改 Agent 的 prompt、skill、memory、tool policy 时，如何证明这个改动真的让它更可靠，而不是只在几个 demo 上看起来更好？**

这才是我认为更有实际意义的方向。

---

## 附：当前项目最诚实的定位

如果要给 SkillEvolver 一个最终定位，我会这样写：

> SkillEvolver is a failure-conditioned paired evaluation harness for prompt-skill mutations. It measures which tasks a skill variant rescues, harms, or leaves unchanged, and uses seed averaging, held-aside selection, harm filtering, and cross-model probes to prevent overclaiming. On EvalPlusFix, it finds one narrow within-model positive event, but ablations and transfer tests show the current mutation loop does not reliably evolve portable prompt skills.

中文就是：

> SkillEvolver 不是一个成功的通用 Skill 自进化系统，而是一套用于评估 Prompt Skill 改动的干预实验框架。它能告诉我们一个 skill 到底救了哪些任务、伤了哪些任务、在哪些模型上不再有效，并用负结果提醒我们不要把小样本正数包装成 Agent 自进化。

这不是我最开始想写出的结论，但它可能比最开始那个结论更可靠。
