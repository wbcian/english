# The Devil Wears Prada Lesson Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual dialogue lesson from the supplied RealLife screenshots and add all 11 reviewed expressions to Cian's vocabulary memory.

**Architecture:** Add one Markdown lesson following `lessons/_conventions.md`, one focused Markdown record per vocabulary item, then synchronize the vocabulary index, activity timeline, and BRAIN snapshot. Keep source wording limited to the text visible in the user-provided screenshots and provide original Traditional Chinese translations and drills.

**Tech Stack:** Markdown, YAML frontmatter, repository lint/build scripts, Git

---

### Task 1: Create the dialogue lesson

**Files:**
- Create: `lessons/2026-06-23-the-devil-wears-prada-first-day.md`

- [x] Write a `track: dialogue`, `audio: true`, `level: B2` lesson with Topic & Summary, bilingual screenshot transcript, Key Vocabulary, Useful Phrases, Sentence Anatomy, register notes, and Takeaways.
- [x] Preserve speakable structure: English and Chinese in separate blockquotes, speaker labels at the start of English blockquotes, and lowercase `word` table heading.
- [x] Include all 11 reviewed expressions: `skimmed milk`, `drip coffee`, `run errands`, `deal with it`, `fling`, `foam`, `man`, `searing`, `chained to`, `on the line`, and `on the chopping block`.

### Task 2: Create vocabulary records

**Files:**
- Create: `vocab/skimmed-milk.md`
- Create: `vocab/drip-coffee.md`
- Create: `vocab/run-errands.md`
- Create: `vocab/deal-with-it.md`
- Create: `vocab/fling.md`
- Create: `vocab/foam.md`
- Create: `vocab/man.md`
- Create: `vocab/searing.md`
- Create: `vocab/chained-to.md`
- Create: `vocab/on-the-line.md`
- Create: `vocab/on-the-chopping-block.md`
- Modify: `vocab/_index.md`

- [x] Give each record complete frontmatter, bilingual examples, a practical usage note, and an encounter dated `2026-06-23`.
- [x] Explain `skim milk` as the more common American form, `man` as a verb, and `on the line` versus `on the chopping block`.
- [x] Add all 11 records to the top of the ★1 section in `vocab/_index.md`.

### Task 3: Synchronize learning memory

**Files:**
- Modify: `ACTIVITY.md`
- Modify: `BRAIN.md`

- [x] Add one lesson entry and one vocabulary entry under `2026-06-23`.
- [x] Update the BRAIN snapshot from 141 to 152 vocabulary records and describe the new lesson.

### Task 4: Verify and publish

**Files:**
- Verify all files above.

- [x] Run repository content checks and confirm the 11 lesson expressions each have a vocabulary record and index row.
- [x] Run the app's non-networked content/build verification using the bundled workspace runtime.
- [x] Review `git diff --check`, the staged diff, and repository status.
- [ ] Commit vocabulary files with `vocab: add Devil Wears Prada expressions`.
- [ ] Commit the lesson with `lesson: The Devil Wears Prada first day`.
- [ ] Commit memory synchronization with `brain: sync Devil Wears Prada lesson`.
- [ ] Commit this plan separately as documentation if it remains in the final diff.
- [ ] Push the commits to the configured remote.
