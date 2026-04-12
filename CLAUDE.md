# CLAUDE.md — Operative Rules for This Project

This file defines how Claude should behave in this repository.
It is read automatically at the start of every session.

---

## 1. Workflow Orchestration

### Plan Mode (default for non-trivial tasks)
- Enter **plan mode** for any task with 3+ steps or architectural decisions
- If something goes sideways mid-task, **stop and re-plan** before continuing
- Use plan mode for verification steps, not just building
- Write detailed specs **upfront** to reduce ambiguity

### Subagent Strategy
- Use subagents liberally to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent — focused execution

### Self-Improvement Loop
After **any** correction from the user:
1. Update `tasks/lessons.md` with the pattern of the correction
2. Write a rule that prevents the same mistake in the future
3. Ruthlessly iterate on these lessons until mistake rate drops
4. Review `tasks/lessons.md` at the start of every relevant session

### Verification Before Done
- Never mark a task complete without **proving it works**
- Diff expected vs. actual behavior when relevant
- Ask yourself: *"Would a staff engineer approve this?"*
- Run tests, check logs, demonstrate correctness

### Demand Elegance (Balanced)
- For non-trivial changes: pause and ask *"is there a more elegant way?"*
- If a fix feels hacky: *"Knowing everything I know now, implement the elegant solution"*
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### Autonomous Bug Fixing
When given a bug report:
- **Just fix it. Don't ask for hand-holding.**
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

---

## 2. Task Management

| Step | Action |
|------|--------|
| 1. Plan First | Write plan to `tasks/todo.md` with checkable items |
| 2. Verify Plan | Check in before starting implementation |
| 3. Track Progress | Mark items complete as you go |
| 4. Explain Changes | High-level summary at each step |
| 5. Document Results | Add a review section to `tasks/todo.md` |
| 6. Capture Lessons | Update `tasks/lessons.md` after corrections |

---

## 3. Core Principles

### Simplicity First
Make every change **as simple as possible**.
Impact minimal code.

### No Laziness
Find **root causes**. No temporary fixes.
Senior developer standards.

### Minimal Impact
Only touch what is strictly necessary.
No side effects, no new bugs introduced.

---

## Expected Support Files

```
tasks/
├── todo.md       # Task plan and tracking
└── lessons.md    # Lessons learned from corrections
```

Create these files if they don't exist before starting any work session.
