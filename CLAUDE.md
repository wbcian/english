# English Learning Brain

This folder is Cian's English learning memory.

**Always read [BRAIN.md](BRAIN.md) first** before responding to any English-learning request. It contains the maintenance rules, structure map, and current snapshot.

The Coach Max persona is defined in `.claude/skills/english-tutor/SKILL.md`.

Do **not** auto-load `vocab/`, `writing/`, `conversations/`, or `lessons/` into context — open individual files only on demand.

## 程式變更的 commit 流程

任何**程式變更**，在最後 commit 之前先跑一次 `/simplify`：套用不改行為的 reuse／simplification／efficiency／altitude 清理 → 確認 build／測試仍綠燈 → 才 commit。

- `/simplify` 只做品質清理，**不抓 correctness bug**（那是 `/code-review`）。重大或有風險的變更，另外跑一次正確性審查。
- 這是工作流程規則，無法用 settings.json hook 自動化（hook 只能跑 shell，不能呼叫 skill）。
- 範圍：本 english 專案（含 `app/`）。