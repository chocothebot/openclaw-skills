#!/usr/bin/env node
/**
 * ENVIRONMENT VALIDATION
 * 
 * Validates that all required credentials are properly configured
 * Ensures .secrets/ files exist and contain required keys
 * Fails fast if environment is not secure
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const SECRETS_DIR = '.secrets';

// Required credential files and their expected variables
const REQUIRED_CREDENTIALS = {
    'agentmail.env': ['AGENTMAIL_API_KEY', 'AGENTMAIL_FROM_EMAIL'],
    'browser-use.env': ['BROWSER_USE_API_KEY'],
    'gmail.env': ['GMAIL_EMAIL', 'GMAIL_APP_PASSWORD'],
    'github.env': ['GITHUB_PAT'],
};

// Optional credential files (warn if missing but don't fail)
const OPTIONAL_CREDENTIALS = {
    'cj-affiliate.env': ['CJ_EMAIL', 'CJ_PASSWORD'],
    'strackr.env': ['STRACKR_EMAIL', 'STRACKR_PASSWORD'],
    'openai.env': ['OPENAI_API_KEY'],
    'anthropic.env': ['ANTHROPIC_API_KEY'],
};

class EnvironmentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validated = [];
    }

    /**
     * Check if secrets directory exists
     */
    checkSecretsDirectory() {
        if (!existsSync(SECRETS_DIR)) {
            this.errors.push(`Missing .secrets/ directory - create it to store credentials safely`);
            return false;
        }

        const secretFiles = readdirSync(SECRETS_DIR);
        if (secretFiles.length === 0) {
            this.errors.push(`.secrets/ directory is empty - no credential files found`);
            return false;
        }

        console.log(`✅ Found .secrets/ directory with ${secretFiles.length} files`);
        return true;
    }

    /**
     * Parse environment file and extract variables
     */
    parseEnvFile(filePath) {
        try {
            const content = readFileSync(filePath, 'utf8');
            const variables = {};
            
            content.split('\n').forEach(line => {
                line = line.trim();
                if (line && !line.startsWith('#') && line.includes('=')) {
                    const [key, ...valueParts] = line.split('=');
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    if (key && value) {
                        variables[key] = value;
                    }
                }
            });

            return variables;
        } catch (error) {
            this.errors.push(`Failed to read ${filePath}: ${error.message}`);
            return null;
        }
    }

    /**
     * Validate a credential file
     */
    validateCredentialFile(fileName, requiredVars, optional = false) {
        const filePath = join(SECRETS_DIR, fileName);
        
        if (!existsSync(filePath)) {
            const message = `Missing credential file: ${fileName}`;
            if (optional) {
                this.warnings.push(message);
            } else {
                this.errors.push(message);
            }
            return false;
        }

        const variables = this.parseEnvFile(filePath);
        if (!variables) {
            return false;
        }

        const missing = [];
        const present = [];

        for (const varName of requiredVars) {
            if (!variables[varName] || variables[varName].length < 3) {
                missing.push(varName);
            } else {
                present.push(varName);
            }
        }

        if (missing.length > 0) {
            const message = `${fileName} missing variables: ${missing.join(', ')}`;
            if (optional) {
                this.warnings.push(message);
            } else {
                this.errors.push(message);
            }
        }

        if (present.length > 0) {
            this.validated.push(`${fileName}: ${present.join(', ')}`);
        }

        return missing.length === 0;
    }

    /**
     * Check for common credential security issues
     */
    validateCredentialSecurity() {
        const secretFiles = existsSync(SECRETS_DIR) ? readdirSync(SECRETS_DIR) : [];
        
        for (const fileName of secretFiles) {
            if (!fileName.endsWith('.env')) {
                this.warnings.push(`Non-.env file in .secrets/: ${fileName} (should be *.env)`);
                continue;
            }

            const filePath = join(SECRETS_DIR, fileName);
            const variables = this.parseEnvFile(filePath);
            
            if (!variables) continue;

            // Check for weak or placeholder values
            for (const [key, value] of Object.entries(variables)) {
                if (value.includes('your_') || value.includes('placeholder') || value.includes('xxxx')) {
                    this.warnings.push(`${fileName}: ${key} appears to contain placeholder value`);
                }
                
                if (value.length < 8 && key.toLowerCase().includes('password')) {
                    this.warnings.push(`${fileName}: ${key} is suspiciously short for a password`);
                }

                if (key.toLowerCase().includes('key') && value.length < 20) {
                    this.warnings.push(`${fileName}: ${key} is suspiciously short for an API key`);
                }
            }
        }
    }

    /**
     * Validate git security setup
     */
    validateGitSecurity() {
        // Check if .secrets/ is gitignored
        let gitignoreContents = '';
        if (existsSync('.gitignore')) {
            gitignoreContents = readFileSync('.gitignore', 'utf8');
        }

        if (!gitignoreContents.includes('.secrets/')) {
            this.errors.push('.secrets/ directory is not in .gitignore - credentials could be exposed!');
        } else {
            console.log('✅ .secrets/ is properly gitignored');
        }

        // Check if security hooks are installed
        const preCommitHook = '.git/hooks/pre-commit';
        if (!existsSync(preCommitHook)) {
            this.warnings.push('No pre-commit security hook installed - run: node scripts/install-security-hooks.mjs');
        } else {
            const hookContent = readFileSync(preCommitHook, 'utf8');
            if (hookContent.includes('security-scan.mjs')) {
                console.log('✅ Security hooks are installed');
            } else {
                this.warnings.push('Pre-commit hook exists but not security-enabled');
            }
        }
    }

    /**
     * Run comprehensive environment validation
     */
    async validate() {
        console.log('🔍 VALIDATING ENVIRONMENT SECURITY...\n');

        // 1. Check secrets directory
        if (!this.checkSecretsDirectory()) {
            return this.reportResults();
        }

        // 2. Validate required credentials
        console.log('Checking required credentials...');
        for (const [fileName, vars] of Object.entries(REQUIRED_CREDENTIALS)) {
            this.validateCredentialFile(fileName, vars, false);
        }

        // 3. Validate optional credentials
        console.log('Checking optional credentials...');
        for (const [fileName, vars] of Object.entries(OPTIONAL_CREDENTIALS)) {
            this.validateCredentialFile(fileName, vars, true);
        }

        // 4. Check credential security
        this.validateCredentialSecurity();

        // 5. Check git security setup
        this.validateGitSecurity();

        return this.reportResults();
    }

    /**
     * Report validation results
     */
    reportResults() {
        console.log('\n📊 VALIDATION RESULTS:\n');

        if (this.validated.length > 0) {
            console.log('✅ VALIDATED CREDENTIALS:');
            this.validated.forEach(item => console.log(`  ${item}`));
            console.log('');
        }

        if (this.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  ${warning}`));
            console.log('');
        }

        if (this.errors.length > 0) {
            console.log('❌ ERRORS:');
            this.errors.forEach(error => console.log(`  ${error}`));
            console.log('');
            console.log('🚨 ENVIRONMENT VALIDATION FAILED');
            console.log('Fix the errors above before running automation scripts');
            return false;
        }

        console.log('✅ ENVIRONMENT VALIDATION PASSED');
        console.log('All required credentials are properly configured');
        
        if (this.warnings.length === 0) {
            console.log('No security warnings found');
        }

        return true;
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new EnvironmentValidator();
    const success = await validator.validate();
    
    if (!success) {
        process.exit(1);
    }
}

export { EnvironmentValidator };