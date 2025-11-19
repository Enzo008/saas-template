---
trigger: manual
---

# GitHub Best Practices & Team Workflow

## Quick Start Workflow

1. **Pull latest from main**: `git pull origin main`
2. **Create feature branch**: `git checkout -b feat/s0-p1-task-name`
3. **Make changes and commit regularly** (small, logical commits)
4. **Push branch**: `git push origin feat/s0-p1-task-name`
5. **Create Pull Request on GitHub**
6. **Request review from teammate** (if team exists)
7. **Address feedback if needed**
8. **Squash and merge when approved**

## Sprint-Based Workflow for Balance

We follow the Sprint structure defined in `sistema-contable.txt`:

### Branch Naming Convention

Format: `<type>/s<sprint>-p<priority>-<short-description>`

**Examples:**
```bash
feat/s0-p1-database-schema
feat/s1-p1-accounting-firm-crud
feat/s2-p1-column-mapping-engine
fix/s1-p1-multitenancy-validation
refactor/s3-p1-bulk-upload-service
```

### One Branch Per Task

- Each task from the Sprint planner gets its own branch
- Multiple logical commits within the branch
- Squash and merge creates one clean commit in main
- Main branch history = one commit per completed task

## Branch Strategy

We use **GitHub Flow** adapted for Sprint development:

- **main branch** = always deployable, production-ready
- **All work happens in feature branches** (one per Sprint task)
- **Squash and merge** keeps main history clean

## Pull Request Rules

### PR Title Format

Use the task title from `sistema-contable.txt`:

```
[S<sprint>][P<priority>] Task description
```

**Examples:**
```
[S0][P1] Database schema with granular permissions
[S1][P1] CRUD endpoints for accounting firms
[S2][P1] Dynamic column mapping engine
```

### PR Guidelines

1. **One PR per Sprint task** - matches planner structure
2. **Review required before merge** (when team exists)
3. **Keep PRs focused** - one task, multiple logical commits
4. **Link to Sprint task** - reference task number in description
5. **Use draft PRs** for early feedback on work-in-progress
6. **Squash and merge** - creates clean history in main

### PR Description Template

```markdown
## Task
[S0][P1] Database schema with granular permissions

## Changes
- Added base catalog tables (TB_ROLE, TB_PERMISSION, etc.)
- Implemented master tables with multi-tenancy support
- Created relationship tables for granular permissions
- Added seed data for initial setup

## Checklist
- [x] Tables created with proper constraints
- [x] Foreign keys configured
- [x] Seed data added
- [x] Documentation updated

## Testing
- Verified table creation in SQL Server
- Tested seed data insertion
- Validated foreign key relationships
```

## Code Review Guidelines

**When reviewing:**
- Check logic and potential bugs
- Ensure code follows our conventions
- Verify tests are included (if applicable)
- Use GitHub's suggestion feature for quick fixes
- Be helpful, not harsh - we're all learning

**Review response time:** Within 24 hours on weekdays

## Commit Messages

### Format (Professional, No Emojis)

```
<type>: <clear description in lowercase>

[optional body explaining WHY, not WHAT]
```

### Types for Balance Project

- `feat`: New feature (tables, endpoints, UI components)
- `fix`: Bug fix
- `refactor`: Code restructuring without changing functionality
- `chore`: Maintenance tasks (seed data, configs, dependencies)
- `docs`: Documentation updates
- `test`: Test additions or modifications

### Real Examples from Balance Sprints

**Sprint 0 - Database Setup:**
```bash
feat: add database schema for user management and permissions
feat: implement multi-tenant architecture with accounting firms
feat: add client company table with dual branding support
chore: add seed data for roles and base catalogs
docs: document granular permission system
```

**Sprint 1 - Accounting Firms & Companies:**
```bash
feat: implement CRUD endpoints for accounting firms
feat: add branding configuration for client companies
feat: create user assignment interface for internal accountants
refactor: extract multi-tenancy validation to middleware
fix: resolve foreign key constraint in user company assignment
```

**Sprint 2 - Column Mapping:**
```bash
feat: implement dynamic column mapping for document types
feat: add Excel column detection and mapping interface
feat: create column mapping engine with validation
test: add integration tests for column mapping engine
docs: document column mapping workflow
```

### Rules for Professional Commits

✅ **DO:**
- Use clear, descriptive language
- Start with lowercase after type
- Be specific about what changed
- Keep it concise (under 72 characters for title)
- Use imperative mood ("add" not "added")

❌ **DON'T:**
- Use emojis (🚀 ✨ 🐛)
- Use vague descriptions ("fix stuff", "update code")
- Use AI-sounding language ("amazing", "awesome", "oops")
- Include exclamation marks or casual language
- Write overly technical jargon

## Repository Protection

These are already configured:
- Branch protection on main
- Required reviews before merge
- Squash and merge enabled
- Direct commits to main blocked

## Organization Tips

- **Issues**: Create an issue before starting major work
- **Labels**: Use labels to categorize (bug, feature, enhancement)
- **Projects**: Track sprint progress in GitHub Projects
- **Documentation**: Keep README current

## Workflow Example: Complete Task Flow

### Starting a New Sprint Task

```bash
# 1. Sync with main
git checkout main
git pull origin main

# 2. Create feature branch for Sprint task
git checkout -b feat/s1-p1-accounting-firm-crud

# 3. Work and commit incrementally
git add 02.SourceCode/02-Backend/Models/AccountingFirm.cs
git commit -m "feat: add accounting firm model with branding fields"

git add 02.SourceCode/02-Backend/DataAccessObject/Database/AccountingFirmDAO.cs
git commit -m "feat: implement accounting firm DAO with CRUD operations"

git add 02.SourceCode/02-Backend/Controllers/AccountingFirmController.cs
git commit -m "feat: add accounting firm controller with REST endpoints"

git add 01.DataBase/StoredProcedures/SP_CREATE_ACCOUNTING_FIRM.sql
git commit -m "feat: add stored procedure for creating accounting firms"

# 4. Push branch
git push origin feat/s1-p1-accounting-firm-crud

# 5. Create PR on GitHub with title: [S1][P1] CRUD endpoints for accounting firms

# 6. After approval, squash and merge
# Result: One clean commit in main with all changes
```

### Working Solo vs Team

**Solo Development (Current):**
- Create branch per task
- Commit incrementally as you work
- Push to remote for backup
- Merge directly or create PR for documentation
- Squash and merge to keep history clean

**Team Development (Future):**
- Same branch strategy
- PR required for all changes
- At least 1 review before merge
- Discussion in PR comments
- Squash and merge after approval

## Pro Tips

1. **Sync regularly** - Pull from main before starting each task
2. **Commit often** - Small, logical commits within your branch
3. **Descriptive commits** - Future you will thank present you
4. **Test before pushing** - Verify compilation and basic functionality
5. **Clean up** - Delete merged branches to keep repo tidy
6. **Reference tasks** - Mention Sprint task in commits and PRs

## Important Reminders

### ❌ NEVER

- Force push to main
- Commit secrets, API keys, or connection strings
- Use emojis or casual language in commits
- Commit large binary files
- Leave commented-out code without explanation

### ✅ ALWAYS

- Test locally before creating PR
- Update documentation with code changes
- Use professional, clear commit messages
- Keep commits focused and atomic
- Reference Sprint task numbers in PRs