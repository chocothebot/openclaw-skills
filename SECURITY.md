# 🛡️ SECURITY DOCUMENTATION

**Last Updated:** 2026-02-05  
**Security Incident Response:** [See MEMORY.md - 2026-02-05 Security Incident](#security-incident)

## 🚨 Security Rules - ABSOLUTE

### 1. NEVER COMMIT CREDENTIALS
- **NEVER** hardcode passwords, API keys, tokens, or secrets
- **NEVER** commit files containing sensitive data
- **ALWAYS** use environment variables or `.secrets/` files
- **ASSUME** every repository will become public

### 2. Use .secrets/ Directory
```bash
# Store credentials securely (gitignored)
.secrets/
├── agentmail.env      # Email API credentials
├── browser-use.env    # Browser automation API
├── github.env         # GitHub personal access token
├── gmail.env          # Gmail app password
├── cj-affiliate.env   # CJ Affiliate credentials
└── strackr.env        # Strackr automation credentials
```

### 3. Environment Variable Pattern
```javascript
// ✅ CORRECT - Environment variables
const apiKey = process.env.BROWSER_USE_API_KEY;
const password = process.env.STRACKR_PASSWORD;

// ✅ CORRECT - Secure file loading
const creds = loadCredentials('.secrets/service.env');

// ❌ NEVER - Hardcoded values
const apiKey = "bu_actual_key_here";
const password = "my_real_password";
```

---

## 🔧 Security Tools & Scripts

### Quick Commands
```bash
# Full security check
npm run security:full-check

# Scan for exposed credentials
npm run security:scan

# Validate environment setup
npm run security:validate

# Comprehensive audit
npm run security:audit

# Install git security hooks
npm run security:install-hooks
```

### Scripts Overview

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `security-scan.mjs` | Find exposed credentials | Before every commit |
| `validate-environment.mjs` | Check .secrets/ setup | On new environment |
| `security-audit.mjs` | Comprehensive review | Weekly/monthly |
| `install-security-hooks.mjs` | Git hook protection | One-time setup |

---

## 🔐 Credential Management

### Required Credentials
```bash
# .secrets/agentmail.env
AGENTMAIL_API_KEY=ak_your_key_here
AGENTMAIL_FROM_EMAIL=your_email@agentmail.to

# .secrets/browser-use.env
BROWSER_USE_API_KEY=bu_your_key_here

# .secrets/gmail.env
GMAIL_EMAIL=youremail@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# .secrets/github.env
GITHUB_PAT=ghp_your_personal_access_token
```

### Optional Credentials
```bash
# .secrets/cj-affiliate.env (for affiliate automation)
CJ_EMAIL=youremail@domain.com
CJ_PASSWORD=your_password

# .secrets/strackr.env (for analytics automation)
STRACKR_EMAIL=youremail@domain.com
STRACKR_PASSWORD=your_password
```

---

## 🔍 Git Security Hooks

### Pre-Commit Hook
Automatically scans staged files for:
- API keys (OpenAI, GitHub, Browser-Use, etc.)
- Hardcoded passwords and secrets
- Database connection strings
- Email addresses in code

### Pre-Push Hook
Full repository scan before pushing to remote.

### Bypass (Emergency Only)
```bash
# Skip hooks in emergency (use carefully!)
git commit --no-verify
git push --no-verify
```

---

## 📊 Security Audit Scoring

| Grade | Score | Status |
|-------|-------|--------|
| A+ | 95-100 | Excellent security |
| A | 90-94 | Good security |
| B | 80-89 | Acceptable security |
| C | 70-79 | Needs improvement |
| D | 60-69 | Poor security |
| F | <60 | Critical issues |

**Pass Threshold:** 80/100

---

## 🚨 Security Incident Response

### If Credentials Are Exposed

**IMMEDIATE (0-5 minutes):**
1. 🚨 **STOP** - Don't make more commits
2. 🚨 **REMOVE** - `git rm` files with credentials
3. 🚨 **COMMIT** - Remove files immediately
4. 🚨 **PUSH** - Remove from current version

**URGENT (5-30 minutes):**
5. 🚨 **ROTATE** - Change ALL exposed credentials
6. 🚨 **VERIFY** - Test services still work
7. 🚨 **NOTIFY** - Alert team/users if needed

**FOLLOW-UP (30+ minutes):**
8. 🔧 **CLEAN** - Remove from git history
9. 🔧 **AUDIT** - Run full security scan
10. 📝 **DOCUMENT** - Record incident and lessons

### Emergency Contacts
- **Repository Owner:** [Your contact info]
- **Security Team:** [If applicable]
- **Service Providers:** API key regeneration

---

## 📚 Best Practices

### Development
- ✅ Run `npm run security:scan` before every commit
- ✅ Use `.env.example` files for documentation
- ✅ Never share `.secrets/` files directly
- ✅ Use secure random password generators

### Code Review
- ✅ Check for hardcoded values
- ✅ Verify .gitignore effectiveness
- ✅ Look for suspicious file additions
- ✅ Test environment variable loading

### Production
- ✅ Use proper secret management (AWS Secrets, etc.)
- ✅ Rotate credentials regularly
- ✅ Monitor for exposed credentials in logs
- ✅ Implement least-privilege access

---

## 🔄 Regular Maintenance

### Weekly
- [ ] Run full security audit: `npm run security:audit`
- [ ] Review recent commits for security issues
- [ ] Check for new credential requirements

### Monthly
- [ ] Rotate high-privilege credentials
- [ ] Update security documentation
- [ ] Review and update .gitignore
- [ ] Test incident response procedures

### Quarterly
- [ ] Full credential strength audit
- [ ] Security tool updates
- [ ] Team security training
- [ ] Penetration testing (if applicable)

---

## 📖 References

- [Git Secrets Prevention](https://git-secret.io/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [API Key Security](https://cwe.mitre.org/data/definitions/798.html)

---

## 🚨 Security Incident - 2026-02-05

**CRITICAL LESSON:** Never include real credentials in documentation, even as examples of what went wrong. Always use fake placeholder values.

**What Happened:** Committed actual passwords, API keys, and email accounts to public GitHub repository for 30+ minutes.

**Prevention:** This entire security system was built in response to that incident. It must never happen again.

---

*Remember: A few minutes of security checking prevents hours of incident response.*