# Security System Skill

**Bulletproof credential protection and security automation for AI agents**

## Overview

Enterprise-grade security system that prevents credential exposure through automated scanning, git hooks, and comprehensive auditing. Built after a real security incident on 2026-02-05 when hardcoded credentials were accidentally committed to a public repository.

## What It Does

- **Prevents credential commits** through automated git hooks
- **Scans for exposed credentials** using 28+ detection patterns
- **Grades security posture** with actionable recommendations
- **Validates environment** setup and configuration
- **Automates security setup** with one-command installation

## Key Features

### 🔍 Advanced Credential Detection
- API keys (OpenAI, GitHub, Browser-Use, AWS, Google, Slack)
- Hardcoded passwords and secrets
- Database connection strings
- Email addresses in code context
- Long suspicious strings

### 🛡️ Git Hook Protection
- **Pre-commit:** Scans staged files for credentials
- **Pre-push:** Full repository security verification
- **Commit-msg:** Security-aware commit messaging
- **Automatic blocking:** Prevents credential commits

### 📊 Security Auditing
- A-F grading system (pass threshold: 80/100)
- Git history analysis for credential mentions
- File permission auditing
- Security documentation verification
- Actionable improvement recommendations

### 🔧 Environment Management
- Secure `.secrets/` directory structure
- Required vs optional credential validation
- Environment variable loading patterns
- Template generation for credential files

## Installation

### Quick Setup (Recommended)
```bash
# Copy security scripts to your project
cp -r security-system/scripts/ your-project/scripts/
cp security-system/package.json your-project/
cp security-system/SECURITY.md your-project/

# Install security system
cd your-project
npm run security:setup
```

### Manual Installation
```bash
# 1. Install security scripts
npm install

# 2. Set up git hooks
npm run security:install-hooks

# 3. Create .secrets/ directory
mkdir .secrets
chmod 700 .secrets

# 4. Run initial audit
npm run security:audit
```

## Usage

### Daily Development
```bash
# Before committing (automatic via git hooks)
npm run security:scan-staged

# Check overall security
npm run security:scan

# Full security review
npm run security:audit
```

### Environment Setup
```bash
# Create credential files in .secrets/
echo "API_KEY=your_key_here" > .secrets/service.env

# Validate environment
npm run security:validate

# Verify everything works
npm run security:full-check
```

### Code Patterns

#### ✅ SECURE - Environment Variables
```javascript
// Load from environment
const apiKey = process.env.BROWSER_USE_API_KEY;
const password = process.env.STRACKR_PASSWORD;

// Secure file loading
function loadCredentials(filename) {
    const content = readFileSync(`.secrets/${filename}`, 'utf8');
    return Object.fromEntries(
        content.split('\n')
            .filter(line => line.includes('='))
            .map(line => line.split('=', 2))
    );
}
```

#### ❌ BLOCKED - Hardcoded Credentials
```javascript
// These patterns are automatically detected and blocked:
const apiKey = "sk-actual_openai_key";           // OpenAI pattern
const token = "ghp_github_token_here";           // GitHub pattern  
const key = "bu_browser_use_key";                // Browser-Use pattern
const password = "hardcoded_password";           // Password pattern
```

## File Structure

### Security Scripts (`scripts/`)
```
scripts/
├── security-scan.mjs          # Advanced credential detection
├── security-audit.mjs         # Comprehensive security scoring
├── validate-environment.mjs   # Environment validation
├── install-security-hooks.mjs # Git hook installation
└── security-setup.mjs         # One-command setup wizard
```

### Credential Storage (`.secrets/`)
```
.secrets/                      # Gitignored directory
├── agentmail.env             # Email API credentials
├── browser-use.env           # Browser automation
├── github.env                # GitHub access tokens
└── service-name.env          # Service-specific credentials
```

### Git Hooks (`.git/hooks/`)
```
.git/hooks/
├── pre-commit                # Scans staged files
├── pre-push                  # Full repository scan
└── commit-msg                # Security commit warnings
```

## Security Patterns

### Credential Detection
The system detects these patterns:

| Type | Pattern | Example |
|------|---------|---------|
| OpenAI | `sk-[a-zA-Z0-9]{48}` | `sk-1234...` |
| GitHub | `ghp_[a-zA-Z0-9]{36}` | `ghp_abcd...` |
| Browser-Use | `bu_[a-zA-Z0-9_]{30,}` | `bu_key123...` |
| AWS | `AKIA[0-9A-Z]{16}` | `AKIA1234...` |
| Passwords | `password.*=.*["'][^"']{8,}` | `password="secret"` |

### Whitelisting Rules
Safe patterns that won't trigger alerts:

| Context | Allowed | Example |
|---------|---------|---------|
| Documentation | Fake examples | `sk-your_key_here` |
| Tests | Mock credentials | `test_password_123` |
| Package.json | Author emails | `user@example.com` |
| Git URLs | SSH format | `git@github.com` |

## NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "security:setup": "node scripts/security-setup.mjs",
    "security:scan": "node scripts/security-scan.mjs",
    "security:scan-staged": "node scripts/security-scan.mjs --staged",
    "security:validate": "node scripts/validate-environment.mjs",
    "security:audit": "node scripts/security-audit.mjs",
    "security:install-hooks": "node scripts/install-security-hooks.mjs",
    "security:full-check": "npm run security:validate && npm run security:scan && npm run security:audit"
  }
}
```

## Configuration

### Required Credentials
Configure these files in `.secrets/`:

```bash
# .secrets/agentmail.env
AGENTMAIL_API_KEY=your_api_key
AGENTMAIL_FROM_EMAIL=your_email@agentmail.to

# .secrets/browser-use.env  
BROWSER_USE_API_KEY=bu_your_key_here

# .secrets/github.env
GITHUB_PAT=ghp_your_token_here
```

### Git Ignore Setup
Ensure your `.gitignore` includes:
```
# Secrets and credentials
.secrets/
*.key
*.env
```

## Troubleshooting

### Common Issues

**Git hooks not working:**
```bash
# Reinstall hooks
npm run security:install-hooks

# Check hook permissions
chmod +x .git/hooks/*
```

**False positives in scans:**
```bash
# Add whitelist entry to scripts/security-scan.mjs
const WHITELISTED_FILES = {
    'your-file.js': ['Hardcoded Password'],
    // ...
};
```

**Environment validation failing:**
```bash
# Check .secrets/ directory
ls -la .secrets/

# Validate specific credential file
cat .secrets/service.env
```

### Emergency Bypass
```bash
# Skip security hooks in emergency
git commit --no-verify
git push --no-verify

# Re-enable after fixing issues
npm run security:audit
```

## Best Practices

### Development Workflow
1. **Setup once:** Run `npm run security:setup` on new projects
2. **Code securely:** Use environment variables for all credentials  
3. **Commit safely:** Git hooks automatically check for credentials
4. **Audit regularly:** Run weekly security audits

### Credential Management
1. **Store in .secrets/:** Never commit credentials to git
2. **Use templates:** Create `.env.example` for documentation
3. **Rotate regularly:** Change credentials quarterly
4. **Document access:** Track who has which credentials

### Team Adoption
1. **Share this skill:** Copy to all team repositories
2. **Train developers:** Show secure coding patterns
3. **Monitor compliance:** Regular security audits
4. **Learn from incidents:** Document and prevent repeats

## Real-World Example

This skill was built after a real security incident on 2026-02-05:

**What happened:** Hardcoded passwords and API keys were committed to a public GitHub repository and exposed for 30+ minutes.

**Response:** Built this comprehensive security system to ensure it never happens again.

**Result:** Zero credential exposures since implementation.

## Integration Examples

### With OpenClaw
```javascript
// In your OpenClaw automation
import { SecurityScanner } from './scripts/security-scan.mjs';

// Before any git operations
const scanner = new SecurityScanner();
const safe = await scanner.scan();
if (!safe) {
    throw new Error('Security scan failed - credentials detected');
}
```

### With CI/CD
```yaml
# GitHub Actions
- name: Security Scan
  run: npm run security:full-check
```

### With Development Tools
```javascript
// VS Code settings.json
{
  "git.preCommitHook": "npm run security:scan-staged"
}
```

## Security Incident Response

If credentials are exposed:

1. **IMMEDIATE (0-5 min):**
   - Stop making commits
   - Remove files: `git rm <files>`
   - Commit removal: `git commit -m "Remove credentials"`
   - Push immediately: `git push`

2. **URGENT (5-30 min):**
   - Rotate ALL exposed credentials
   - Test services still work
   - Notify team if needed

3. **FOLLOW-UP (30+ min):**
   - Clean git history
   - Run full security audit
   - Document incident and lessons

## Contributing

### Improving Detection
Add new credential patterns to `scripts/security-scan.mjs`:

```javascript
const CREDENTIAL_PATTERNS = [
    { pattern: /new_service_[a-zA-Z0-9]{20}/, name: 'New Service API Key' },
    // ...
];
```

### Adding Whitelists
Update whitelisting rules for legitimate use cases:

```javascript
const WHITELISTED_FILES = {
    'docs/': ['Email Address'],
    'tests/': ['Hardcoded Password'],
    // ...
};
```

### Reporting Issues
- **Security vulnerabilities:** Private message
- **Feature requests:** GitHub issues
- **Bug reports:** Include `npm run security:audit` output

---

**Remember the 2026-02-05 incident. Protect your credentials. Share this knowledge.**