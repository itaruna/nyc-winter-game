# Git Best Practices for This Project

## Pre-Commit Rules

- **ALWAYS run `npm run build` before committing** - Ensure code compiles successfully
- **Review all changes before committing** - Use `git diff` to inspect staged changes
- **Never commit secrets** - No `.env` files, API keys, credentials, or tokens
- **Verify `.gitignore` is set up properly** - Check that sensitive files are excluded

## Commit Message Format

Use **conventional commits** with this structure:

```
<type>: <subject>

[optional body]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc. (no code change)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Build process, dependencies, tooling

### Rules
- Use **imperative mood**: "Add feature" not "Added feature"
- Keep first line **under 50 characters**
- Explain **what and why**, not how
- **One logical change per commit** (atomic commits)

### Examples
```
feat: Add snowfall particle system
fix: Correct skater collision detection
refactor: Extract tree creation into helper function
chore: Update Three.js to v0.160
```

## Workflow

- **Work directly on main branch** (solo development)
- **Claude handles all git operations** - commits, pushes, branch management
- **User should never need to run git commands manually**
- **Always verify build succeeds before committing**

### Before Every Commit
1. Run `npm run build` (or equivalent build command)
2. Run `git status` to see all changes
3. Run `git diff` to review changes
4. Check for accidental secret inclusions
5. Stage and commit with proper message
6. Push to remote

## Security

### Never Commit
- `.env` files
- API keys or tokens
- Passwords or credentials
- Private keys
- Database connection strings
- Any sensitive configuration

### Always Review
- Check `git diff` output for accidental secrets
- Verify no hardcoded credentials in code
- Ensure `.gitignore` covers all sensitive patterns

## .gitignore Essentials

Ensure these patterns are in `.gitignore`:
```
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build output
dist/
build/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Secrets
*.pem
*.key
credentials.json
```

## Claude's Responsibility

As the AI assistant managing this repository:
- I will handle all git commands on your behalf
- I will always run the build before committing
- I will review changes for security issues
- I will write proper conventional commit messages
- I will push changes after successful commits
- You just tell me what changes you want - I handle the rest
