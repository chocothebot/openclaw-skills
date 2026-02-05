# 1Password Integration Setup Guide

## 🎯 **Goal**
Replace `.secrets/` directory with secure 1Password integration for all credentials.

## 🔧 **Setup Steps**

### **1. Create 1Password Service Account**
1. Go to https://start.1password.com/developer-tools/infrastructure-secrets/serviceaccount/
2. **Create service account** with name: `Choco-Agent-Automation`
3. **Grant access** to vault containing bot credentials
4. **Set permissions:** Read Items, Create Items
5. **Save the token** (one-time display!) 

### **2. Install 1Password CLI**
```bash
# Install on the OpenClaw system
curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main" | sudo tee /etc/apt/sources.list.d/1password.list
sudo apt update && sudo apt install 1password-cli
```

### **3. Migrate Credentials to 1Password**

Create these items in your 1Password vault:

#### **Agentmail Credentials**
- **Title:** `Choco-Agentmail`
- **API Key:** [rotated value]
- **From Email:** choco@agentmail.to

#### **Browser-Use Credentials** 
- **Title:** `Choco-BrowserUse`
- **API Key:** [rotated value]

#### **GitHub Credentials**
- **Title:** `Choco-GitHub`
- **Personal Access Token:** [rotated value]
- **Username:** chocothebot

#### **Gmail Credentials**
- **Title:** `Choco-Gmail`
- **Email:** chocothebot@gmail.com
- **App Password:** [rotated value]

#### **CJ Affiliate Credentials**
- **Title:** `Choco-CJAffiliate`
- **Email:** chocothebot@gmail.com
- **Password:** [rotated value]

#### **Strackr Credentials**
- **Title:** `Choco-Strackr`
- **Email:** chocothebot@gmail.com
- **Password:** [rotated value]

### **4. Configure Environment**

#### **Set Service Account Token**
```bash
# Store 1Password service account token
echo "OP_SERVICE_ACCOUNT_TOKEN=your_service_account_token_here" > .secrets/1password.env

# Or export directly:
export OP_SERVICE_ACCOUNT_TOKEN="your_service_account_token"
```

### **5. Update Scripts to Use Secret References**

#### **Example: Agentmail Integration**
```javascript
// OLD: Direct file reading
const apiKey = readFileSync('.secrets/agentmail.env', 'utf8')...

// NEW: 1Password secret reference
import { exec } from 'child_process';

function getSecretFromOP(reference) {
    return new Promise((resolve, reject) => {
        exec(`op read "${reference}"`, (error, stdout) => {
            if (error) reject(error);
            else resolve(stdout.trim());
        });
    });
}

// Usage:
const apiKey = await getSecretFromOP("op://Private/Choco-Agentmail/credential");
const fromEmail = await getSecretFromOP("op://Private/Choco-Agentmail/username");
```

#### **Secret Reference Format**
```
op://VaultName/ItemName/FieldName

Examples:
op://Private/Choco-Agentmail/credential
op://Private/Choco-GitHub/credential
op://Private/Choco-BrowserUse/credential
```

### **6. Environment File with Secret References**

#### **.env.1password** (replaces .secrets/ directory)
```bash
# Agentmail
AGENTMAIL_API_KEY="op://Private/Choco-Agentmail/credential"
AGENTMAIL_FROM_EMAIL="op://Private/Choco-Agentmail/username"

# Browser-Use
BROWSER_USE_API_KEY="op://Private/Choco-BrowserUse/credential"

# GitHub
GITHUB_PAT="op://Private/Choco-GitHub/credential"

# Gmail
GMAIL_EMAIL="op://Private/Choco-Gmail/username"
GMAIL_APP_PASSWORD="op://Private/Choco-Gmail/credential"

# CJ Affiliate
CJ_EMAIL="op://Private/Choco-CJAffiliate/username"
CJ_PASSWORD="op://Private/Choco-CJAffiliate/password"

# Strackr
STRACKR_EMAIL="op://Private/Choco-Strackr/username"
STRACKR_PASSWORD="op://Private/Choco-Strackr/password"
```

### **7. Update Scripts to Use `op run`**

#### **Secure Script Execution**
```bash
# Instead of: node send-email.mjs
# Use: op run --env-file=.env.1password -- node send-email.mjs

# This resolves all secret references and passes them as environment variables
```

### **8. Update Security Scanner**

Add 1Password detection to prevent accidental token exposure:
```javascript
// Add to security-scan.mjs
{ pattern: /ops_[a-zA-Z0-9_]{26}/, name: '1Password Service Account Token' },
```

## 🛡️ **Security Benefits**

### **Enhanced Security**
- ✅ **No secrets in files** - all credentials in 1Password vault
- ✅ **Centralized management** - rotate credentials in one place
- ✅ **Access logging** - 1Password logs all secret access
- ✅ **Principle of least privilege** - service account only accesses needed vaults
- ✅ **Revocation** - instantly disable service account if compromised

### **Operational Benefits**
- ✅ **No more .secrets/ directory** - cleaner repository
- ✅ **Shared access** - you can manage credentials easily
- ✅ **Backup** - credentials safely stored in 1Password
- ✅ **MFA protection** - your 1Password account protects everything

## 🔄 **Migration Script**

```bash
#!/bin/bash
# migrate-to-1password.sh

echo "🔄 Migrating to 1Password..."

# Backup existing secrets
cp -r .secrets/ .secrets.backup/

# Remove old secret files (after confirming 1Password setup works)
# rm -rf .secrets/

# Test 1Password CLI authentication
op account get

# Test secret retrieval
op read "op://Private/Choco-Agentmail/credential"

echo "✅ Migration complete!"
```

## 🧪 **Testing**

```bash
# Test 1Password CLI access
op signin
op vault list
op item list

# Test secret references
op read "op://Private/Choco-Agentmail/credential"

# Test environment file
op run --env-file=.env.1password -- env | grep -E "(AGENTMAIL|GITHUB)"

# Test application
op run --env-file=.env.1password -- node send-email.mjs
```

## 🚨 **Emergency Recovery**

If 1Password integration fails:
```bash
# Restore from backup
cp -r .secrets.backup/ .secrets/

# Use original environment loading
# Scripts fall back to .secrets/ files
```

---

**Ready to proceed?** Let me know when you've created the service account and I'll help configure the integration! 🔐