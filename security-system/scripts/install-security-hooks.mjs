#!/usr/bin/env node
/**
 * INSTALL SECURITY HOOKS
 * 
 * Sets up git hooks to prevent committing credentials
 * Creates pre-commit and pre-push security checks
 */

import { writeFileSync, chmodSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const HOOKS_DIR = '.git/hooks';

// Pre-commit hook content
const PRE_COMMIT_HOOK = `#!/bin/bash
# Pre-commit security hook
# Automatically prevents commits containing credentials

echo "🔍 Running pre-commit security scan..."

# Run security scanner on staged files only
node scripts/security-scan.mjs --staged --strict

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ COMMIT REJECTED - Security scan failed"
    echo "Fix the security issues above before committing"
    echo ""
    exit 1
fi

echo "✅ Security scan passed - commit allowed"
exit 0
`;

// Pre-push hook content  
const PRE_PUSH_HOOK = `#!/bin/bash
# Pre-push security hook
# Final security check before pushing to remote

echo "🔍 Running pre-push security verification..."

# Run full repository scan
node scripts/security-scan.mjs --strict

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ PUSH REJECTED - Security scan failed"
    echo "Repository contains security issues"
    echo ""
    exit 1
fi

echo "✅ Security verification passed - push allowed"
exit 0
`;

// Commit message hook to enforce security commit format
const COMMIT_MSG_HOOK = `#!/bin/bash
# Commit message hook
# Enforces security-conscious commit messages

commit_msg_file=$1
commit_msg=\$(cat "$commit_msg_file")

# Check for security-related commits
if echo "$commit_msg" | grep -qi -E "(password|secret|key|credential|token)"; then
    if ! echo "$commit_msg" | grep -qi -E "(fix|remove|clean|redact|security)"; then
        echo ""
        echo "⚠️  WARNING: Commit message mentions credentials"
        echo "If you're fixing a security issue, please clarify with:"
        echo "  - 'SECURITY FIX:' prefix"
        echo "  - 'Remove exposed credentials'"
        echo "  - 'Clean sensitive data'"
        echo ""
        echo "Current message: $commit_msg"
        echo ""
        read -p "Continue anyway? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            echo "Commit aborted"
            exit 1
        fi
    fi
fi

exit 0
`;

class SecurityHooksInstaller {
    constructor() {
        this.hooksDir = HOOKS_DIR;
    }

    /**
     * Ensure hooks directory exists
     */
    ensureHooksDirectory() {
        if (!existsSync(this.hooksDir)) {
            mkdirSync(this.hooksDir, { recursive: true });
            console.log(`✅ Created hooks directory: ${this.hooksDir}`);
        }
    }

    /**
     * Install a git hook
     */
    installHook(hookName, content) {
        const hookPath = join(this.hooksDir, hookName);
        
        // Backup existing hook if it exists
        if (existsSync(hookPath)) {
            const backupPath = `${hookPath}.backup-${Date.now()}`;
            writeFileSync(backupPath, readFileSync(hookPath));
            console.log(`📦 Backed up existing ${hookName} to ${backupPath}`);
        }

        // Write new hook
        writeFileSync(hookPath, content);
        chmodSync(hookPath, 0o755); // Make executable
        console.log(`✅ Installed ${hookName} hook`);
    }

    /**
     * Install all security hooks
     */
    install() {
        console.log('🔧 Installing git security hooks...\n');

        this.ensureHooksDirectory();

        this.installHook('pre-commit', PRE_COMMIT_HOOK);
        this.installHook('pre-push', PRE_PUSH_HOOK);
        this.installHook('commit-msg', COMMIT_MSG_HOOK);

        console.log('');
        console.log('🛡️  Security hooks installed successfully!');
        console.log('');
        console.log('What this provides:');
        console.log('  • Pre-commit: Scans staged files for credentials');
        console.log('  • Pre-push: Full repository security verification');
        console.log('  • Commit-msg: Warns about security-related commits');
        console.log('');
        console.log('All commits will now be automatically scanned for:');
        console.log('  • API keys (OpenAI, GitHub, Browser-Use, etc.)');
        console.log('  • Hardcoded passwords and secrets');
        console.log('  • Database connection strings');
        console.log('  • Email addresses in code');
        console.log('');
        console.log('To test: try committing a file with a fake API key');
        console.log('To bypass (emergency): git commit --no-verify');
    }

    /**
     * Uninstall security hooks
     */
    uninstall() {
        const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
        
        console.log('🗑️  Uninstalling security hooks...\n');
        
        for (const hookName of hooks) {
            const hookPath = join(this.hooksDir, hookName);
            if (existsSync(hookPath)) {
                try {
                    unlinkSync(hookPath);
                    console.log(`✅ Removed ${hookName} hook`);
                } catch (error) {
                    console.log(`❌ Failed to remove ${hookName}: ${error.message}`);
                }
            }
        }
        
        console.log('\n🛡️  Security hooks uninstalled');
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const installer = new SecurityHooksInstaller();

    if (args.includes('--uninstall')) {
        installer.uninstall();
    } else {
        installer.install();
    }
}

export { SecurityHooksInstaller };