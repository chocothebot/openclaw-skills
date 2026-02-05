#!/usr/bin/env node
/**
 * COMPREHENSIVE SECURITY AUDIT
 * 
 * Runs complete security check including:
 * - Credential scanning
 * - Environment validation
 * - Git security verification
 * - Repository health check
 * 
 * Use for regular security audits and CI/CD pipelines
 */

import { SecurityScanner } from './security-scan.mjs';
import { EnvironmentValidator } from './validate-environment.mjs';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';

class SecurityAuditor {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.fix = options.fix || false;
        this.score = 100; // Start with perfect score
        this.findings = [];
    }

    /**
     * Add finding and reduce security score
     */
    addFinding(category, severity, message, fix = null) {
        const scorePenalty = {
            'CRITICAL': 25,
            'HIGH': 10,
            'MEDIUM': 5,
            'LOW': 2
        };

        this.findings.push({
            category,
            severity,
            message,
            fix
        });

        this.score = Math.max(0, this.score - (scorePenalty[severity] || 2));
    }

    /**
     * Check git repository security
     */
    auditGitSecurity() {
        console.log('🔍 Auditing Git Security...\n');

        // 1. Check .gitignore
        if (!existsSync('.gitignore')) {
            this.addFinding('Git', 'HIGH', 'Missing .gitignore file');
        } else {
            const gitignore = readFileSync('.gitignore', 'utf8');
            
            const criticalIgnores = ['.secrets/', '*.env', '*.key'];
            for (const ignore of criticalIgnores) {
                if (!gitignore.includes(ignore)) {
                    this.addFinding('Git', 'CRITICAL', `Missing ${ignore} in .gitignore`, 
                        `Add "${ignore}" to .gitignore`);
                }
            }

            const recommendedIgnores = ['node_modules/', '*.log', '.DS_Store', '.vscode/'];
            for (const ignore of recommendedIgnores) {
                if (!gitignore.includes(ignore)) {
                    this.addFinding('Git', 'LOW', `Missing ${ignore} in .gitignore`);
                }
            }
        }

        // 2. Check for security hooks
        const hooks = ['pre-commit', 'pre-push'];
        for (const hook of hooks) {
            const hookPath = `.git/hooks/${hook}`;
            if (!existsSync(hookPath)) {
                this.addFinding('Git', 'MEDIUM', `Missing ${hook} security hook`,
                    'Run: node scripts/install-security-hooks.mjs');
            } else {
                const hookContent = readFileSync(hookPath, 'utf8');
                if (!hookContent.includes('security-scan')) {
                    this.addFinding('Git', 'MEDIUM', `${hook} hook not security-enabled`);
                }
            }
        }

        // 3. Check for commits with sensitive data in history
        try {
            const logOutput = execSync('git log --oneline -20', { encoding: 'utf8' });
            const sensitiveCommits = logOutput.split('\n').filter(line => 
                /password|secret|key|credential|token/i.test(line)
            );
            
            if (sensitiveCommits.length > 0) {
                this.addFinding('Git', 'HIGH', 
                    `Found ${sensitiveCommits.length} commits mentioning credentials in history`,
                    'Review commit history for exposed credentials');
            }
        } catch (error) {
            // Git log failed, probably not a git repo
            this.addFinding('Git', 'LOW', 'Unable to check git history');
        }

        // 4. Check remote repositories
        try {
            const remotes = execSync('git remote -v', { encoding: 'utf8' });
            if (remotes.includes('github.com') && remotes.includes('git@github.com')) {
                console.log('✅ Using SSH for GitHub (secure)');
            } else if (remotes.includes('https://github.com')) {
                this.addFinding('Git', 'LOW', 'Using HTTPS for git remote (consider SSH)');
            }
        } catch (error) {
            // No remotes or not a git repo
        }
    }

    /**
     * Check file permissions and system security
     */
    auditFilePermissions() {
        console.log('🔍 Auditing File Permissions...\n');

        if (existsSync('.secrets')) {
            try {
                // Check .secrets directory permissions
                const secrets = execSync('ls -la .secrets/', { encoding: 'utf8' });
                
                // Look for world-readable files
                const lines = secrets.split('\n');
                for (const line of lines) {
                    if (line.includes('.env') && line.match(/r..r..r../)) {
                        this.addFinding('Permissions', 'MEDIUM', 
                            `Credential file is world-readable: ${line}`,
                            'Run: chmod 600 .secrets/*.env');
                    }
                }
            } catch (error) {
                // Non-unix system or permission error
                this.addFinding('Permissions', 'LOW', 'Unable to check file permissions');
            }
        }
    }

    /**
     * Audit credential strength and patterns
     */
    auditCredentialStrength() {
        console.log('🔍 Auditing Credential Strength...\n');

        if (!existsSync('.secrets')) {
            return; // Already caught by environment validator
        }

        try {
            const secretFiles = execSync('ls .secrets/*.env', { encoding: 'utf8', silent: true });
            
            for (const file of secretFiles.split('\n').filter(f => f.trim())) {
                try {
                    const content = readFileSync(file, 'utf8');
                    
                    // Check for weak patterns
                    if (content.includes('password123') || content.includes('admin')) {
                        this.addFinding('Credentials', 'HIGH', 
                            `Weak credential pattern detected in ${file}`);
                    }

                    // Check for placeholder values
                    if (content.includes('your_') || content.includes('replace_me')) {
                        this.addFinding('Credentials', 'MEDIUM', 
                            `Placeholder values found in ${file}`);
                    }

                    // Check for common mistakes
                    if (content.includes(' ') && !content.includes('"')) {
                        this.addFinding('Credentials', 'LOW', 
                            `Unquoted values with spaces in ${file}`);
                    }

                } catch (error) {
                    this.addFinding('Credentials', 'LOW', `Unable to read ${file}: ${error.message}`);
                }
            }
        } catch (error) {
            // No .env files found or ls command failed
        }
    }

    /**
     * Check for security documentation
     */
    auditSecurityDocumentation() {
        console.log('🔍 Auditing Security Documentation...\n');

        const securityDocs = ['SECURITY.md', 'SECURITY_CHECKLIST.md', '.github/SECURITY.md'];
        let hasSecurityDoc = false;

        for (const doc of securityDocs) {
            if (existsSync(doc)) {
                hasSecurityDoc = true;
                console.log(`✅ Found security documentation: ${doc}`);
                break;
            }
        }

        if (!hasSecurityDoc) {
            this.addFinding('Documentation', 'MEDIUM', 
                'No security documentation found',
                'Create SECURITY.md with security policies and procedures');
        }

        // Check for README security section
        if (existsSync('README.md')) {
            const readme = readFileSync('README.md', 'utf8');
            if (!readme.toLowerCase().includes('security')) {
                this.addFinding('Documentation', 'LOW', 
                    'README.md missing security information');
            }
        }
    }

    /**
     * Calculate security score and grade
     */
    getSecurityGrade() {
        if (this.score >= 95) return { grade: 'A+', color: '🟢' };
        if (this.score >= 90) return { grade: 'A', color: '🟢' };
        if (this.score >= 85) return { grade: 'B+', color: '🟡' };
        if (this.score >= 80) return { grade: 'B', color: '🟡' };
        if (this.score >= 70) return { grade: 'C', color: '🟠' };
        if (this.score >= 60) return { grade: 'D', color: '🔴' };
        return { grade: 'F', color: '🔴' };
    }

    /**
     * Run comprehensive security audit
     */
    async runAudit() {
        console.log('🛡️  COMPREHENSIVE SECURITY AUDIT');
        console.log('================================\n');

        // 1. Credential Scanning
        console.log('1️⃣ Scanning for exposed credentials...');
        const scanner = new SecurityScanner();
        const scanPassed = await scanner.scan();
        
        if (!scanPassed) {
            this.addFinding('Credentials', 'CRITICAL', 
                'Exposed credentials found in repository',
                'Run: node scripts/security-scan.mjs for details');
        }

        console.log('');

        // 2. Environment Validation
        console.log('2️⃣ Validating environment configuration...');
        const validator = new EnvironmentValidator();
        const envPassed = await validator.validate();
        
        if (!envPassed) {
            this.addFinding('Environment', 'HIGH', 
                'Environment validation failed',
                'Run: node scripts/validate-environment.mjs for details');
        }

        console.log('');

        // 3. Git Security
        this.auditGitSecurity();

        // 4. File Permissions
        this.auditFilePermissions();

        // 5. Credential Strength
        this.auditCredentialStrength();

        // 6. Security Documentation
        this.auditSecurityDocumentation();

        // 7. Generate Report
        this.generateReport();

        return this.score >= 80; // Pass threshold
    }

    /**
     * Generate comprehensive audit report
     */
    generateReport() {
        console.log('\n📊 SECURITY AUDIT REPORT');
        console.log('=========================\n');

        const { grade, color } = this.getSecurityGrade();
        
        console.log(`${color} SECURITY GRADE: ${grade} (${this.score}/100)`);
        console.log('');

        if (this.findings.length === 0) {
            console.log('🎉 EXCELLENT! No security issues found.');
            console.log('Your repository follows security best practices.');
            return;
        }

        // Group findings by severity
        const critical = this.findings.filter(f => f.severity === 'CRITICAL');
        const high = this.findings.filter(f => f.severity === 'HIGH');
        const medium = this.findings.filter(f => f.severity === 'MEDIUM');
        const low = this.findings.filter(f => f.severity === 'LOW');

        if (critical.length > 0) {
            console.log('🔴 CRITICAL ISSUES:');
            critical.forEach((f, i) => {
                console.log(`${i + 1}. [${f.category}] ${f.message}`);
                if (f.fix) console.log(`   Fix: ${f.fix}`);
            });
            console.log('');
        }

        if (high.length > 0) {
            console.log('🟠 HIGH PRIORITY:');
            high.forEach((f, i) => {
                console.log(`${i + 1}. [${f.category}] ${f.message}`);
                if (f.fix) console.log(`   Fix: ${f.fix}`);
            });
            console.log('');
        }

        if (medium.length > 0) {
            console.log('🟡 MEDIUM PRIORITY:');
            medium.forEach((f, i) => {
                console.log(`${i + 1}. [${f.category}] ${f.message}`);
                if (f.fix) console.log(`   Fix: ${f.fix}`);
            });
            console.log('');
        }

        if (low.length > 0 && this.verbose) {
            console.log('⚪ LOW PRIORITY:');
            low.forEach((f, i) => {
                console.log(`${i + 1}. [${f.category}] ${f.message}`);
                if (f.fix) console.log(`   Fix: ${f.fix}`);
            });
            console.log('');
        }

        // Summary
        console.log('📋 SUMMARY:');
        console.log(`  Critical: ${critical.length}`);
        console.log(`  High: ${high.length}`);
        console.log(`  Medium: ${medium.length}`);
        console.log(`  Low: ${low.length}`);
        console.log('');

        if (this.score < 80) {
            console.log('❌ AUDIT FAILED - Address critical and high priority issues');
        } else {
            console.log('✅ AUDIT PASSED - Good security posture');
        }

        console.log('');
        console.log('💡 RECOMMENDATIONS:');
        console.log('  • Run this audit weekly: node scripts/security-audit.mjs');
        console.log('  • Install security hooks: node scripts/install-security-hooks.mjs');
        console.log('  • Review credential strength quarterly');
        console.log('  • Keep security documentation updated');
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose') || args.includes('-v'),
        fix: args.includes('--fix')
    };

    const auditor = new SecurityAuditor(options);
    const success = await auditor.runAudit();
    
    if (!success) {
        process.exit(1);
    }
}

export { SecurityAuditor };