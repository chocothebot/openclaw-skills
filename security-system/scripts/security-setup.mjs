#!/usr/bin/env node
/**
 * SECURITY SETUP WIZARD
 * 
 * One-command setup for complete security protection:
 * - Installs git hooks
 * - Validates environment
 * - Runs initial audit
 * - Provides next steps
 */

import { SecurityHooksInstaller } from './install-security-hooks.mjs';
import { EnvironmentValidator } from './validate-environment.mjs';
import { SecurityAuditor } from './security-audit.mjs';
import { existsSync, writeFileSync, mkdirSync } from 'fs';

class SecuritySetupWizard {
    constructor() {
        this.steps = [];
        this.warnings = [];
        this.nextSteps = [];
    }

    /**
     * Welcome message
     */
    showWelcome() {
        console.log('🛡️  OPENCLAW SECURITY SETUP WIZARD');
        console.log('===================================\n');
        console.log('This wizard will set up comprehensive security protection for your repository.\n');
        console.log('What it does:');
        console.log('  ✅ Install git hooks to prevent credential commits');
        console.log('  ✅ Validate your environment setup');
        console.log('  ✅ Create .secrets/ directory if missing');
        console.log('  ✅ Run security audit');
        console.log('  ✅ Provide personalized next steps\n');
    }

    /**
     * Step 1: Create .secrets/ directory
     */
    setupSecretsDirectory() {
        console.log('1️⃣ Setting up .secrets/ directory...');
        
        if (!existsSync('.secrets')) {
            mkdirSync('.secrets');
            console.log('✅ Created .secrets/ directory');
            
            // Create template files
            const templates = {
                'agentmail.env': '# Agentmail API credentials\nAGENTMAIL_API_KEY=your_api_key_here\nAGENTMAIL_FROM_EMAIL=your_email@agentmail.to\n',
                'browser-use.env': '# Browser-Use API credentials\nBROWSER_USE_API_KEY=bu_your_api_key_here\n',
                'gmail.env': '# Gmail app password\nGMAIL_EMAIL=your_email@gmail.com\nGMAIL_APP_PASSWORD=your_app_password_here\n',
                'github.env': '# GitHub personal access token\nGITHUB_PAT=ghp_your_token_here\n'
            };

            for (const [filename, content] of Object.entries(templates)) {
                const filepath = `.secrets/${filename}`;
                writeFileSync(filepath, content);
                console.log(`✅ Created template: ${filepath}`);
            }

            this.steps.push('Created .secrets/ directory with templates');
            this.nextSteps.push('Fill in your actual credentials in .secrets/*.env files');
        } else {
            console.log('✅ .secrets/ directory already exists');
        }

        console.log('');
    }

    /**
     * Step 2: Install git hooks
     */
    async installGitHooks() {
        console.log('2️⃣ Installing git security hooks...');
        
        const installer = new SecurityHooksInstaller();
        installer.install();
        
        this.steps.push('Installed git security hooks (pre-commit, pre-push, commit-msg)');
        console.log('');
    }

    /**
     * Step 3: Validate environment
     */
    async validateEnvironment() {
        console.log('3️⃣ Validating environment...');
        
        const validator = new EnvironmentValidator();
        const success = await validator.validate();
        
        if (success) {
            this.steps.push('Environment validation passed');
        } else {
            this.warnings.push('Environment validation found issues');
            this.nextSteps.push('Fix environment issues: npm run security:validate');
        }
        
        console.log('');
    }

    /**
     * Step 4: Run security audit
     */
    async runSecurityAudit() {
        console.log('4️⃣ Running security audit...');
        
        const auditor = new SecurityAuditor();
        const success = await auditor.runAudit();
        
        if (success) {
            this.steps.push('Security audit passed');
        } else {
            this.warnings.push('Security audit found issues');
            this.nextSteps.push('Address security issues: npm run security:audit');
        }
        
        console.log('');
    }

    /**
     * Show completion summary
     */
    showSummary() {
        console.log('📋 SETUP COMPLETE');
        console.log('==================\n');

        console.log('✅ COMPLETED STEPS:');
        this.steps.forEach(step => console.log(`  • ${step}`));
        console.log('');

        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  • ${warning}`));
            console.log('');
        }

        if (this.nextSteps.length > 0) {
            console.log('🎯 NEXT STEPS:');
            this.nextSteps.forEach(step => console.log(`  • ${step}`));
            console.log('');
        }

        console.log('🛡️  SECURITY COMMANDS:');
        console.log('  npm run security:scan          # Scan for exposed credentials');
        console.log('  npm run security:validate       # Check environment setup');
        console.log('  npm run security:audit          # Comprehensive security audit');
        console.log('  npm run security:full-check     # Run all security checks');
        console.log('');

        console.log('🔍 REGULAR MAINTENANCE:');
        console.log('  • Weekly: npm run security:audit');
        console.log('  • Before commits: automatic via git hooks');
        console.log('  • Monthly: review and rotate credentials');
        console.log('');

        if (this.warnings.length === 0 && this.nextSteps.length === 0) {
            console.log('🎉 PERFECT! Your repository is now fully secured.');
            console.log('All security measures are in place and working correctly.');
        } else {
            console.log('⚡ ALMOST THERE! Complete the next steps to finish setup.');
        }

        console.log('');
        console.log('📚 For detailed information, see: SECURITY.md');
        console.log('🚨 Remember the 2026-02-05 security incident - never again!');
    }

    /**
     * Run complete setup wizard
     */
    async run() {
        this.showWelcome();

        try {
            this.setupSecretsDirectory();
            await this.installGitHooks();
            await this.validateEnvironment();
            await this.runSecurityAudit();
            this.showSummary();
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            console.log('\nTry running individual commands:');
            console.log('  npm run security:install-hooks');
            console.log('  npm run security:validate');
            console.log('  npm run security:audit');
            process.exit(1);
        }
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const wizard = new SecuritySetupWizard();
    await wizard.run();
}

export { SecuritySetupWizard };