#!/usr/bin/env node
/**
 * COMPREHENSIVE SECURITY SCANNER
 * 
 * Scans for credentials, API keys, passwords, and sensitive data
 * before any git operations. Zero-tolerance for credential exposure.
 * 
 * Usage:
 *   node scripts/security-scan.mjs           # Full scan
 *   node scripts/security-scan.mjs --staged  # Only staged files
 *   node scripts/security-scan.mjs --strict  # Exit 1 on any findings
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');

// Credential patterns to detect
const CREDENTIAL_PATTERNS = [
    // API Keys
    { pattern: /sk-[a-zA-Z0-9]{48}/, name: 'OpenAI API Key' },
    { pattern: /bu_[a-zA-Z0-9_]{30,}/, name: 'Browser-Use API Key' },
    { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token' },
    { pattern: /am_[a-fA-F0-9]{64}/, name: 'Agentmail API Key' },
    { pattern: /xoxb-[0-9]{13}-[0-9]{13}-[a-zA-Z0-9]{24}/, name: 'Slack Bot Token' },
    { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
    { pattern: /AIza[0-9A-Za-z\\-_]{35}/, name: 'Google API Key' },
    
    // Passwords & Secrets
    { pattern: /(password|pwd|passwd)["'\s]*[:=]["'\s]*["'][^"']{8,}["']/, name: 'Hardcoded Password' },
    { pattern: /(secret|token)["'\s]*[:=]["'\s]*["'][^"']{10,}["']/, name: 'Hardcoded Secret/Token' },
    { pattern: /["'][a-zA-Z0-9]{32,}["']/, name: 'Long Suspicious String' },
    
    // Email addresses (context-dependent)
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, name: 'Email Address', contextSensitive: true },
    
    // Database connections
    { pattern: /mongodb:\/\/[^"'\s]+/, name: 'MongoDB Connection String' },
    { pattern: /postgres:\/\/[^"'\s]+/, name: 'PostgreSQL Connection String' },
    { pattern: /mysql:\/\/[^"'\s]+/, name: 'MySQL Connection String' },
];

// Files/directories to exclude from scanning
const EXCLUSIONS = [
    'node_modules',
    '.git',
    '.secrets',
    'memory',
    '*.log',
    '*.json',
    '*.lock',
    'package-lock.json',
    'yarn.lock',
    'bun.lockb',
];

// Files that are allowed to contain certain patterns (whitelisted)
const WHITELISTED_FILES = {
    'SECURITY_CHECKLIST.md': ['Email Address', 'Long Suspicious String', 'Hardcoded Password', 'Hardcoded Secret/Token'],
    'SECURITY.md': ['Email Address', 'Long Suspicious String', 'Hardcoded Password', 'Hardcoded Secret/Token'],
    'CLAUDE.md': ['Email Address', 'Hardcoded Password', 'Hardcoded Secret/Token'],
    'TOOLS.md': ['Email Address'],
    'BROWSER_USE_SETUP.md': ['Browser-Use API Key'], // Documentation examples
    'IDENTITY.md': ['Email Address'], // Agent identity
    'send-email.mjs': ['Email Address'], // Agent email address
    'fetch-models.mjs': ['Long Suspicious String'], // Model IDs
    'examples/': ['Email Address'], // Example code
    'projects/botcha/': ['Long Suspicious String', 'Hardcoded Secret/Token', 'Email Address'], // Test data, package info
    '.test.': ['Hardcoded Secret/Token', 'Hardcoded Password'], // Test files
    'test/': ['Hardcoded Secret/Token', 'Hardcoded Password'], // Test directories
    'tests/': ['Hardcoded Secret/Token', 'Hardcoded Password'], // Test directories  
    'package.json': ['Email Address'], // Author email in package.json
    'cj-strackr-sync/': ['Email Address'], // Service documentation
    'SKILL.md': ['Email Address', 'Hardcoded Password', 'Hardcoded Secret/Token'], // Skill documentation examples
};

class SecurityScanner {
    constructor(options = {}) {
        this.staged = options.staged || false;
        this.strict = options.strict || false;
        this.findings = [];
    }

    /**
     * Get list of files to scan
     */
    getFilesToScan() {
        const excludeArgs = EXCLUSIONS.map(ex => `--exclude-dir=${ex}`).join(' ');
        
        if (this.staged) {
            // Only scan staged files
            try {
                const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
                return staged.trim().split('\n').filter(f => f && existsSync(f));
            } catch (error) {
                console.log('No staged files found');
                return [];
            }
        } else {
            // Scan all files (excluding ignored directories)
            try {
                const allFiles = execSync(`find . -type f -name "*.js" -o -name "*.mjs" -o -name "*.ts" -o -name "*.md" -o -name "*.json" -o -name "*.env" | grep -v node_modules | grep -v .git | grep -v .secrets | grep -v memory`, { encoding: 'utf8' });
                return allFiles.trim().split('\n').filter(f => f && existsSync(f));
            } catch (error) {
                return [];
            }
        }
    }

    /**
     * Check if a finding should be whitelisted for this file
     */
    isWhitelisted(filePath, patternName) {
        for (const [whitelistedPath, allowedPatterns] of Object.entries(WHITELISTED_FILES)) {
            if (filePath.includes(whitelistedPath) && allowedPatterns.includes(patternName)) {
                return true;
            }
        }

        // Additional whitelisting logic for specific cases
        if (patternName === 'Hardcoded Password' || patternName === 'Hardcoded Secret/Token') {
            // Allow in documentation files (examples)
            if (filePath.includes('SECURITY') || filePath.includes('README') || 
                filePath.includes('.md') && (filePath.includes('example') || filePath.includes('template'))) {
                return true;
            }
            
            // Allow in test files
            if (filePath.includes('test') || filePath.includes('spec') || filePath.endsWith('.test.js') || 
                filePath.endsWith('.test.ts') || filePath.endsWith('.spec.js') || filePath.endsWith('.spec.ts')) {
                return true;
            }
        }

        if (patternName === 'Email Address') {
            // Allow documented service emails (agent identity, public contact info)
            if (filePath.includes('IDENTITY') || filePath.includes('package.json') || 
                filePath.includes('send-email') || filePath.includes('TOOLS')) {
                return true;
            }
        }

        return false;
    }

    /**
     * Scan a single file for credential patterns
     */
    scanFile(filePath) {
        if (!existsSync(filePath)) return;

        try {
            const content = readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (const { pattern, name, contextSensitive } of CREDENTIAL_PATTERNS) {
                const matches = content.match(new RegExp(pattern, 'g'));
                if (matches) {
                    for (const match of matches) {
                        // Skip if whitelisted
                        if (this.isWhitelisted(filePath, name)) {
                            continue;
                        }

                        // For context-sensitive patterns, apply additional logic
                        if (contextSensitive && name === 'Email Address') {
                            // Allow common example emails
                            if (match.includes('example.com') || match.includes('user@') || match.includes('test@')) {
                                continue;
                            }
                            // Allow git SSH format
                            if (match.includes('git@github.com') || match.includes('git@gitlab.com')) {
                                continue;
                            }
                            // Allow documentation context
                            if (filePath.includes('TOOLS.md') || filePath.includes('setup') || filePath.includes('README')) {
                                continue;
                            }
                        }

                        if (contextSensitive && name === 'Long Suspicious String') {
                            // Skip package hashes, model IDs, etc.
                            if (filePath.includes('package') || filePath.includes('lock') || filePath.includes('.json')) {
                                continue;
                            }
                        }

                        // Find line number
                        let lineNumber = 1;
                        for (let i = 0; i < lines.length; i++) {
                            if (lines[i].includes(match)) {
                                lineNumber = i + 1;
                                break;
                            }
                        }

                        this.findings.push({
                            file: filePath,
                            line: lineNumber,
                            pattern: name,
                            match: match,
                            severity: this.getSeverity(name)
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error scanning ${filePath}: ${error.message}`);
        }
    }

    /**
     * Determine severity level
     */
    getSeverity(patternName) {
        const criticalPatterns = ['OpenAI API Key', 'Browser-Use API Key', 'GitHub Personal Access Token', 'Hardcoded Password'];
        const highPatterns = ['Slack Bot Token', 'AWS Access Key', 'Google API Key', 'Hardcoded Secret/Token'];
        
        if (criticalPatterns.includes(patternName)) return 'CRITICAL';
        if (highPatterns.includes(patternName)) return 'HIGH';
        return 'MEDIUM';
    }

    /**
     * Run comprehensive security scan
     */
    async scan() {
        console.log('🔍 SECURITY SCAN STARTING...');
        console.log(this.staged ? 'Scanning staged files only' : 'Scanning all repository files');
        console.log('');

        const files = this.getFilesToScan();
        if (files.length === 0) {
            console.log('✅ No files to scan');
            return true;
        }

        console.log(`Scanning ${files.length} files...`);
        
        for (const file of files) {
            this.scanFile(file);
        }

        return this.reportResults();
    }

    /**
     * Report scan results
     */
    reportResults() {
        if (this.findings.length === 0) {
            console.log('✅ SECURITY SCAN PASSED');
            console.log('No credentials or sensitive data found');
            return true;
        }

        console.log('🚨 SECURITY SCAN FAILED');
        console.log(`Found ${this.findings.length} potential security issues:\n`);

        // Group by severity
        const critical = this.findings.filter(f => f.severity === 'CRITICAL');
        const high = this.findings.filter(f => f.severity === 'HIGH');
        const medium = this.findings.filter(f => f.severity === 'MEDIUM');

        if (critical.length > 0) {
            console.log('🔴 CRITICAL ISSUES:');
            critical.forEach(f => {
                console.log(`  ${f.file}:${f.line} - ${f.pattern}`);
                console.log(`  └─ "${f.match.substring(0, 50)}..."`);
            });
            console.log('');
        }

        if (high.length > 0) {
            console.log('🟠 HIGH ISSUES:');
            high.forEach(f => {
                console.log(`  ${f.file}:${f.line} - ${f.pattern}`);
                console.log(`  └─ "${f.match.substring(0, 50)}..."`);
            });
            console.log('');
        }

        if (medium.length > 0) {
            console.log('🟡 MEDIUM ISSUES:');
            medium.forEach(f => {
                console.log(`  ${f.file}:${f.line} - ${f.pattern}`);
                console.log(`  └─ "${f.match.substring(0, 30)}..."`);
            });
            console.log('');
        }

        console.log('❌ COMMIT BLOCKED - Fix these issues before committing');
        console.log('');
        console.log('To fix:');
        console.log('1. Move credentials to .secrets/ directory');
        console.log('2. Use environment variables: process.env.VAR_NAME');
        console.log('3. Replace with fake examples in documentation');
        console.log('4. Add to whitelist if legitimately safe');

        return false;
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const args = process.argv.slice(2);
    const options = {
        staged: args.includes('--staged'),
        strict: args.includes('--strict')
    };

    const scanner = new SecurityScanner(options);
    const success = await scanner.scan();

    if (options.strict && !success) {
        process.exit(1);
    }
}

export { SecurityScanner };