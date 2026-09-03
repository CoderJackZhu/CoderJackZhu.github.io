# Tasks

## Now

（迁移已上线，无进行中任务）

## Next

- [ ] 稳定期清理（Phase J）—— 验收：对 `migration/*.json`、`scripts/*.mjs` 逐项给出保留或归档结论并落地；剩余 npm audit 5 项给出处置方案
- [ ] 评估 Pages artifact 模式 —— 验收：写清从 `html` 分支发布迁移到官方 Pages artifact 模式的收益/成本与迁移步骤，给出 Go/No-Go

## Later

- [ ] `/photos/` 极简摄影页（范围变更，需单独设计）—— 验收：`npm run build` exit 0、`npm run test:e2e` 全绿、仅放用户自拍照片不放文章插图
- [ ] npm audit 剩余 5 项（1 low / 2 moderate / 2 high）—— 验收：评估 Astro 7 升级（breaking）的必要性并给出结论，不擅自 `--force`

## Backlog

- [ ] Astro 7 升级结论落地（如评估批准）
