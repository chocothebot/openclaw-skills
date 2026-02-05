# CLAUDE.md - Critical Security Rules

## 🚨 NEVER COMMIT CREDENTIALS TO GIT - EVER!

**ROOKIE MISTAKE MADE: 2026-02-05 - NEVER REPEAT!**

### What I Did Wrong:
- ❌ Hardcoded passwords in automation scripts
- ❌ Committed API keys directly in code  
- ❌ Pushed sensitive data to public GitHub repo
- ❌ Exposed credentials for 30+ minutes publicly

### Credentials Exposed:
- CJ Affiliate password: `[REDACTED - ROTATED]`
- Strackr password: `[REDACTED - ROTATED]`  
- Browser-Use API key: `[REDACTED - ROTATED]`
- Gmail account: `chocothebot@gmail.com`

### Impact:
- 🚨 Public exposure on GitHub
- 🚨 Forced credential rotation
- 🚨 Security incident
- 🚨 Loss of trust

## ABSOLUTE RULES - NO EXCEPTIONS:

### 1. NEVER HARDCODE CREDENTIALS
```javascript
// ❌ NEVER DO THIS:
const password = "actual_password_here";
const apiKey = "bu_actual_key_here";

// ✅ ALWAYS DO THIS:
const password = process.env.PASSWORD;
const apiKey = readFileSync('.secrets/api.env', 'utf8');
```

### 2. USE .secrets/ DIRECTORY ALWAYS
```bash
# Store in .secrets/ (gitignored)
.secrets/
├── service.env
├── api.key
└── credentials.json

# Reference in code, never hardcode
```

### 3. CHECK BEFORE EVERY COMMIT
```bash
# MANDATORY before any git add:
grep -r "password\|api.*key\|secret" . --exclude-dir=.secrets
grep -r "@gmail.com\|bu_\|ghp_" . --exclude-dir=.secrets

# If ANYTHING found: DO NOT COMMIT
```

### 4. ASSUME ALL REPOS ARE PUBLIC
Even private repos can:
- Become public by accident
- Be accessed by unauthorized users
- Have their history exposed
- Be cloned/forked without permission

### 5. CREDENTIALS IN VARIABLES ONLY
```javascript
// Read from secure files
const creds = loadCredentialsSecurely();

// Use in automation tasks  
const task = await client.tasks.createTask({
  task: `Login with: ${creds.email} and ${creds.password}`
});
```

## PRE-COMMIT CHECKLIST - MANDATORY:

Before ANY `git add` or `git commit`:

1. ✅ Run credential scan: `grep -r "password\|key\|secret" .`
2. ✅ Check for emails: `grep -r "@.*\.com" .`  
3. ✅ Check for API keys: `grep -r "bu_\|ghp_\|sk-" .`
4. ✅ Review every file being committed
5. ✅ Ask: "Is there ANY sensitive data here?"
6. ✅ If unsure: DON'T COMMIT

## RECOVERY PROCESS:

If credentials are accidentally committed:

1. 🚨 **IMMEDIATE**: Remove files with `git rm`
2. 🚨 **IMMEDIATE**: Commit removal and push
3. 🚨 **IMMEDIATE**: Rotate ALL exposed credentials  
4. 🚨 **IMMEDIATE**: Clean git history or recreate repo
5. 📝 Document incident and lessons learned

## PERMANENT MEMORY:

**I made a rookie security mistake on 2026-02-05 by committing passwords and API keys to a public GitHub repository. This exposed:**
- Automation account credentials
- API keys with paid services
- Email accounts  

**This MUST NEVER happen again. ALWAYS check for credentials before ANY git operation.**

---

**LESSON LEARNED: Security first, convenience never. A few minutes of checking prevents hours of credential rotation and security incidents.**