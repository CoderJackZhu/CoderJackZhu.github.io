---
title: "Thingary · 物谱"
description: "每月盘一次家底，看清资产变化，也看看离自己的生活目标还有多远。一个本地使用的桌面应用。"
kind: "桌面软件"
year: "2026"
status: "公开测试中"
cover: "/works/thingary-overview.jpg"
coverAlt: "物谱总览：账户净资产、变化趋势和目标，画面为虚构样例资料"
coverWidth: 1440
coverHeight: 968
caption: "物谱的总览界面。截图来自独立样例身份，所有资料均为虚构。"
order: 1
featured: true
tags: ["本地使用", "macOS / Windows", "开源"]
links:
  - label: "访问产品网站"
    href: "https://thingary.jackzhu.top/"
  - label: "查看源码"
    href: "https://github.com/CoderJackZhu/Thingary"
  - label: "观看介绍视频"
    href: "https://thingary.jackzhu.top/#film"
relatedPosts:
  - "/2026/10/21/building-thingary/"
  - "/2026/09/04/几个小时迁移一个六年博客之后我怎样理解AI Coding/"
---

## 从一个具体问题开始

钱分散在银行卡、基金、券商和房贷里，买过的物品又散落在订单与照片中。单看某一个账户，很难回答「现在一共有多少」「这段时间有什么变化」，更难把这些事实与接下来的生活计划联系起来。

物谱把账户盘点、物品档案和目标规划放在一起。每个月或每个季度花一点时间更新资料，再回来看看变化，逐步建立一份能够接着用的个人记录。

## 把范围收在能持续使用的地方

- **低频盘点。** 记录余额和欠款，观察净资产变化，不要求每天记下一笔笔流水。
- **资料留在本机。** 无需注册账号，日常使用可以离线；检查更新由用户控制。
- **记录连接到计划。** 用已有资料思考每月要存多少、何时能不依靠工资，或暂时休息能撑多久。
- **物品按需记录。** 保存价格、照片、维修与保障信息，辅助理解持有成本。

这些选择也确定了边界：物谱不提供行情交易、自动付款或日常流水记账。规划结果依赖输入与假设，需要随着实际情况更新。

## 从界面到可核对的结果

这个项目让我把产品范围、交互流程、数据语义、实现和验证放在同一个问题里考虑。一个界面能算出数字还不够，还需要让人知道数字从哪里来、什么尚未填写，以及修改之后会影响哪里。

例如，未知金额不能被静默当成零；资料缺少时，结果需要说明限制。普通表单取消后不留草稿，而已经提交、结果却暂时无法确认的操作，需要保留回执供后续核对。

![物谱目标页：输入条件与计算结果并排展示，资料为虚构样例](/works/thingary-planning.jpg)

目标页把条件与结果并排呈现，方便对照、修改与复核。这里的图片用于说明产品交互，不代表所有系统与使用情形都已完成验证。

## 工程与验证

应用使用 Tauri、React、TypeScript 与 Rust。资料存储、备份恢复、计算核心和桌面交互各有自己的验证要求；浏览器中的展示通过，也不能替代原生应用的操作验收。

项目公开记录了自动检查、独立样例身份下的验收，以及尚未验证的范围。相比罗列测试数量，更重要的是在数据升级、恢复、未知值和提交失败这些地方，能够说明预期行为并复核结果。

- [架构与模块职责](https://github.com/CoderJackZhu/Thingary/blob/main/docs/ARCHITECTURE.md)
- [开发、测试与验收记录](https://github.com/CoderJackZhu/Thingary/blob/main/docs/DEVELOPMENT.md)
- [来源与许可说明](https://github.com/CoderJackZhu/Thingary/blob/main/SOURCE_NOTICES.md)

## 当前状态

物谱处于公开测试阶段，提供 macOS 与 Windows 安装包。具体版本、支持范围与已知限制以[产品网站](https://thingary.jackzhu.top/)和[发布记录](https://github.com/CoderJackZhu/Thingary/releases)为准。

项目持续围绕真实使用中的记录、核对和规划流程迭代。主资料库本身未加密，备份可选择加密；相关边界在[隐私与资料安全说明](https://thingary.jackzhu.top/guide/#privacy)中公开列出。
