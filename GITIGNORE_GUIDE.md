# .gitignore Guide for PERN Stack Applications

## 🎯 **Purpose of .gitignore**
The `.gitignore` file tells Git which files and directories to ignore when committing code. This prevents sensitive data, build artifacts, and unnecessary files from being tracked in version control.

## 📋 **Essential Categories for PERN Stack**

### 🔒 **Security & Environment (CRITICAL)**
```gitignore
# Environment variables - NEVER commit these!
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Security files
*.pem
*.key
*.crt
*.p12
*.pfx
```
**Why**: Contains database passwords, API keys, JWT secrets, and other sensitive data.

### 📦 **Dependencies**
```gitignore
# Node.js dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Package manager files
.yarn-integrity
```
**Why**: Dependencies are large, change frequently, and can be reinstalled from package.json.

### 🏗️ **Build Artifacts**
```gitignore
# Build outputs
build/
dist/
dist-ssr/
out/
.next/
.nuxt/

# TypeScript build info
*.tsbuildinfo

# Compiled files
build/Release
```
**Why**: Generated files that can be recreated from source code.

### 🗄️ **Database & Prisma**
```gitignore
# Database files
*.sqlite
*.sqlite3
*.db

# Prisma generated files
/backend/src/generated/prisma
prisma/migrations/**/migration.sql
```
**Why**: Generated Prisma client and local database files shouldn't be committed.

### 🧪 **Testing & Coverage**
```gitignore
# Test coverage
coverage/
.nyc_output/
*.lcov
junit.xml
```
**Why**: Test reports are generated and don't need to be tracked.

### 💻 **IDE & Editor Files**
```gitignore
# VS Code
.vscode/

# IntelliJ/WebStorm
.idea/

# Vim
*.swp
*.swo
*~
```
**Why**: Personal editor settings shouldn't affect other developers.

### 🖥️ **Operating System Files**
```gitignore
# macOS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes

# Windows
ehthumbs.db
Thumbs.db
```
**Why**: OS-generated files are irrelevant to the project.

### 🚀 **Development Tools**
```gitignore
# Cache directories
.cache/
.parcel-cache/
.rpt2_cache/
.eslintcache
.stylelintcache

# Temporary files
tmp/
temp/
*.tmp
*.backup
*.bak
```
**Why**: Tool-generated cache and temporary files.

## ⚠️ **What You Should NEVER Ignore**

### ✅ **Always Commit These:**
- `package.json` and `package-lock.json` (dependency definitions)
- `prisma/schema.prisma` (database schema)
- `prisma/migrations/` directory (but not individual migration.sql files)
- Source code files (`.ts`, `.tsx`, `.js`, `.jsx`)
- Configuration files (`tsconfig.json`, `eslint.config.js`)
- Documentation (`README.md`, `*.md`)
- Public assets (`public/` directory contents)

### ❌ **Never Commit These:**
- `node_modules/` (dependencies)
- `.env` files (secrets)
- Build outputs (`dist/`, `build/`)
- Generated Prisma client
- IDE settings (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Log files (`*.log`)
- Database files (`*.sqlite`, `*.db`)

## 🔍 **PERN-Specific Considerations**

### **PostgreSQL**
```gitignore
# Don't ignore schema and migrations
!prisma/schema.prisma
!prisma/migrations/

# But ignore generated client
/backend/src/generated/prisma
```

### **Express.js Backend**
```gitignore
# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock
```

### **React Frontend**
```gitignore
# Build output
build/
dist/

# Vite specific
dist-ssr/
.vite/

# React specific
.eslintcache
```

### **Node.js Common**
```gitignore
# npm
npm-debug.log*
.npm/

# Yarn
yarn-debug.log*
yarn-error.log*
.yarn-integrity

# pnpm
pnpm-debug.log*
```

## 🛠️ **Best Practices**

### 1. **Start Early**
Set up `.gitignore` before your first commit to avoid accidentally committing sensitive files.

### 2. **Use Comments**
```gitignore
# Environment variables - contains sensitive data
.env

# Dependencies - can be reinstalled
node_modules/
```

### 3. **Be Specific**
```gitignore
# Good - specific
/backend/dist/
/frontend/build/

# Avoid - too broad
dist/
build/
```

### 4. **Test Your .gitignore**
```bash
# Check what files Git is tracking
git ls-files

# Check what files would be ignored
git status --ignored
```

### 5. **Global .gitignore**
Set up a global `.gitignore` for OS and editor files:
```bash
git config --global core.excludesfile ~/.gitignore_global
```

## 🚨 **Emergency: Already Committed Sensitive Files?**

If you accidentally committed sensitive files:

```bash
# Remove from Git but keep locally
git rm --cached .env

# Remove from Git and delete locally
git rm .env

# Remove from history (DANGEROUS - rewrites history)
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all
```

## ✅ **Verification Checklist**

- [ ] `.env` files are ignored
- [ ] `node_modules/` is ignored
- [ ] Build outputs are ignored
- [ ] Generated Prisma client is ignored
- [ ] IDE files are ignored
- [ ] OS files are ignored
- [ ] Log files are ignored
- [ ] Database files are ignored
- [ ] Source code is NOT ignored
- [ ] Configuration files are NOT ignored
- [ ] Package files are NOT ignored
- [ ] Prisma schema is NOT ignored

## 📚 **Resources**

- [gitignore.io](https://gitignore.io) - Generate .gitignore files
- [GitHub's gitignore templates](https://github.com/github/gitignore)
- [Git documentation](https://git-scm.com/docs/gitignore)

Remember: **When in doubt, don't commit it!** It's easier to add files later than to remove sensitive data from Git history.
