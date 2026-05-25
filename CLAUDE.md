# CLAUDE.md — Project Instructions for Claude Code

> Loaded automatically at the start of every session.
> For full project context (architecture, APIs, schema), see PROJECT_CONTEXT.xml.

---

## Commit Message Standard

Use **Conventional Commits** format. Every commit follows this structure:

```
type(scope): short description — ≤72 chars

- What changed, and why (not just what the code says)
- One bullet per logical change
- Doc updates are bundled here, not in a separate commit

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behaviour |
| `fix` | Bug fix |
| `refactor` | Code restructure with no behaviour change |
| `style` | UI/visual changes only (no logic change) |
| `docs` | Documentation-only commit (no code touched) |
| `chore` | Maintenance — deps, configs, scripts |

### Scopes (optional, use when helpful)

`gallery` · `admin` · `portfolio` · `api` · `jobtracker` · `auth` · `theme` · `db`

### Examples

```
feat(gallery): add caption and year per image, group by year on profile

- api.py: PUT /api/admin/gallery uses request.json() to bypass Pydantic
- AdminApp.jsx: year dropdown, caption input, drag-and-drop reorder
- App.jsx: computeGallery groups by year desc, lightbox uses sorted order
- Updated PROJECT_CONTEXT.xml and README.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

```
fix(admin): show readable error when gallery save fails

- Error detail from FastAPI can be an array (422 format) — stringify properly

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

---

## Documentation Update Rule

**After every code change — whether committing or not — automatically check all 4 files below and apply any needed updates in the same commit. Never skip this step, never ask first, never make a separate `docs:` commit for it.**

| File | Update when… |
|------|-------------|
| `PROJECT_CONTEXT.xml` | API endpoints, DB schema, file descriptions, or known issues change |
| `README.md` | User-visible features, admin tabs, or tech stack change |
| `SETUP.md` | Infrastructure, deployment steps, or env variables change |
| `CLAUDE.md` | A workflow rule, code convention, or project constraint changes |

Only use `type: docs` when the commit touches documentation files **exclusively**.

---

## Workflow Conventions

- **Git**: commit only — never push. Pushing is the developer's responsibility.
- **Remotes**: 2 remotes — `origin` (GitLab) and `github` (GitHub). Developer pushes to both after each session.
- **Rollback**: `git revert` or `git checkout <hash> -- file1 file2` → new commit. No force-push.
- **Branch**: `main` is the only branch. Protected on GitLab — no force-push allowed.

## Code Conventions

- **Comments**: English only.
- **Frontend styling**: 100% inline styles — no CSS classes, no Tailwind, no CSS modules.
- **UI language**: Portfolio + Admin = English · Job Tracker = Tiếng Việt.
- **Pydantic v2**: Use `request: Request` + `await request.json()` for endpoints that accept `List[Any]` or mixed-type arrays — Pydantic v2 coerces aggressively.

## After Deploy

Always verify the service restarted successfully:
```bash
journalctl -u tienmai-api -n 30
```
Look for `Application startup complete.` — if missing, the old process is still running.
