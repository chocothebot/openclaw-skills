# SECURITY CHECKLIST - MANDATORY BEFORE ANY COMMIT

**🚨 LEARNED FROM MAJOR SECURITY INCIDENT ON 2026-02-05**

## PRE-COMMIT SECURITY SCAN - MANDATORY

Before EVERY `git add` or `git commit` command, run these checks:

### 1. Credential Scan
```bash
# Check for common credential patterns
grep -r "password\|api.*key\|secret\|token" . --exclude-dir=.secrets --exclude-dir=.git

# Check for specific patterns  
grep -r "bu_\|ghp_\|sk-\|pk_" . --exclude-dir=.secrets --exclude-dir=.git

# Check for email addresses
grep -r "@.*\.com" . --exclude-dir=.secrets --exclude-dir=.git
```

### 2. Manual File Review
- ✅ Open every file being committed
- ✅ Scan for ANY sensitive information
- ✅ Look for hardcoded values that should be variables
- ✅ Check comments for accidentally pasted credentials

### 3. Zero-Tolerance Rule
**If ANYTHING looks remotely sensitive:**
- ❌ DO NOT COMMIT
- 🔧 Move to `.secrets/` directory
- 🔧 Use environment variables or secure file reading
- 🔧 Test that it still works
- ✅ THEN commit

## APPROVED PATTERNS:

### ✅ SECURE - Environment Variables
```javascript
const apiKey = process.env.BROWSER_USE_API_KEY;
const password = process.env.STRACKR_PASSWORD;
```

### ✅ SECURE - File Reading
```javascript
const apiKey = readFileSync('.secrets/browser-use.env', 'utf8')
  .split('=')[1];
```

### ✅ SECURE - Credential Templates
```javascript
// Template showing structure, not actual credentials
const task = await client.tasks.createTask({
  task: `Login with: ${credentials.email} and ${credentials.password}`
});
```

## NEVER COMMIT PATTERNS:

### ❌ NEVER - Hardcoded Credentials
```javascript
const apiKey = "sk_live_xxxxxxxxxxxxxxxxxxxx"; // FAKE EXAMPLE
const password = "actual_password_here";
```

### ❌ NEVER - Direct Values in Strings
```javascript
const task = await client.tasks.createTask({
  task: `Login with: user@example.com and hardcoded_password`
});
```

### ❌ NEVER - Comments with Real Data
```javascript
// Using API key: sk_live_xxxxxxxxxxxxxxxxxxxx  // FAKE EXAMPLE
// Password is: my_actual_password123
```

## EMERGENCY PROTOCOL:

If credentials are accidentally committed:

1. 🚨 **STOP** - Don't make more commits
2. 🚨 **REMOVE** - `git rm` all files with credentials
3. 🚨 **COMMIT** removal immediately  
4. 🚨 **PUSH** to remove from current version
5. 🚨 **ROTATE** ALL exposed credentials immediately
6. 🔧 **CLEAN** git history or recreate repository
7. 📝 **DOCUMENT** incident and lessons learned

## PREVENTION IS EVERYTHING:

- 🎯 **5 seconds of checking prevents hours of credential rotation**
- 🎯 **Assume every repository will become public**
- 🎯 **When in doubt, don't commit**
- 🎯 **Security first, convenience never**

---

**REMEMBER THE 2026-02-05 INCIDENT: A rookie mistake that exposed all automation credentials publicly for 30+ minutes. NEVER AGAIN.**