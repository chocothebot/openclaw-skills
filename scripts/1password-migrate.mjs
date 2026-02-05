#!/usr/bin/env node
/**
 * 1PASSWORD MIGRATION UTILITY
 * 
 * Helps migrate from .secrets/ files to 1Password integration
 * Tests 1Password CLI access and secret retrieval
 */

import { exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

class OnePasswordMigrator {
    constructor() {
        this.serviceAccountToken = process.env.OP_SERVICE_ACCOUNT_TOKEN;
        this.errors = [];
        this.secrets = [];
    }

    /**
     * Check if 1Password CLI is available
     */
    async checkCLI() {
        try {
            console.log('🔍 Checking 1Password CLI availability...');
            const { stdout } = await execAsync('op --version');
            console.log(`✅ 1Password CLI found: ${stdout.trim()}`);
            return true;
        } catch (error) {
            console.error('❌ 1Password CLI not found');
            console.error('Install with: https://developer.1password.com/docs/cli/get-started#step-1-install-1password-cli');
            return false;
        }
    }

    /**
     * Check authentication status
     */
    async checkAuth() {
        try {
            console.log('🔐 Checking 1Password authentication...');
            
            if (this.serviceAccountToken) {
                console.log('✅ Service account token found in environment');
                // Test authentication
                const { stdout } = await execAsync('op account get');
                console.log('✅ Authentication successful');
                return true;
            } else {
                console.error('❌ No service account token found');
                console.error('Set OP_SERVICE_ACCOUNT_TOKEN environment variable');
                return false;
            }
        } catch (error) {
            console.error('❌ Authentication failed:', error.message);
            return false;
        }
    }

    /**
     * Read current secrets from .secrets/ directory
     */
    readCurrentSecrets() {
        console.log('📁 Reading current secrets from .secrets/...');
        
        const secretFiles = [
            'agentmail.env',
            'browser-use.env', 
            'gmail.env',
            'github.env',
            'cj-affiliate.env',
            'strackr.env'
        ];

        for (const file of secretFiles) {
            const filePath = `.secrets/${file}`;
            if (existsSync(filePath)) {
                try {
                    const content = readFileSync(filePath, 'utf8');
                    const secrets = this.parseEnvFile(content);
                    this.secrets.push({ file, secrets });
                    console.log(`✅ Read ${file}: ${Object.keys(secrets).length} secrets`);
                } catch (error) {
                    console.error(`❌ Failed to read ${file}:`, error.message);
                }
            } else {
                console.log(`⚠️  ${file} not found`);
            }
        }
    }

    /**
     * Parse environment file into key-value pairs
     */
    parseEnvFile(content) {
        const secrets = {};
        content.split('\n').forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#') && line.includes('=')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                if (key && value) {
                    secrets[key] = value;
                }
            }
        });
        return secrets;
    }

    /**
     * Test secret retrieval from 1Password
     */
    async testSecretRetrieval(vaultName = 'Private') {
        console.log('🧪 Testing secret retrieval...');

        const testCases = [
            { item: 'Choco-Agentmail', field: 'credential', expected: 'AGENTMAIL_API_KEY' },
            { item: 'Choco-BrowserUse', field: 'credential', expected: 'BROWSER_USE_API_KEY' },
            { item: 'Choco-GitHub', field: 'credential', expected: 'GITHUB_PAT' },
        ];

        for (const test of testCases) {
            try {
                const reference = `op://${vaultName}/${test.item}/${test.field}`;
                const { stdout } = await execAsync(`op read "${reference}"`);
                
                if (stdout.trim()) {
                    console.log(`✅ ${test.expected}: Retrieved successfully`);
                } else {
                    console.error(`❌ ${test.expected}: Empty value`);
                    this.errors.push(`Empty value for ${reference}`);
                }
            } catch (error) {
                console.error(`❌ ${test.expected}: ${error.message}`);
                this.errors.push(`Failed to retrieve ${test.item}/${test.field}`);
            }
        }
    }

    /**
     * Generate 1Password environment file
     */
    generateEnvFile(vaultName = 'Private') {
        console.log('📄 Generating 1Password environment file...');

        const envContent = `# 1Password Secret References
# Use with: op run --env-file=.env.1password -- your-command

# Agentmail
AGENTMAIL_API_KEY="op://${vaultName}/Choco-Agentmail/credential"
AGENTMAIL_FROM_EMAIL="op://${vaultName}/Choco-Agentmail/username"

# Browser-Use
BROWSER_USE_API_KEY="op://${vaultName}/Choco-BrowserUse/credential"

# GitHub
GITHUB_PAT="op://${vaultName}/Choco-GitHub/credential"

# Gmail
GMAIL_EMAIL="op://${vaultName}/Choco-Gmail/username"
GMAIL_APP_PASSWORD="op://${vaultName}/Choco-Gmail/credential"

# CJ Affiliate
CJ_EMAIL="op://${vaultName}/Choco-CJAffiliate/username"
CJ_PASSWORD="op://${vaultName}/Choco-CJAffiliate/password"

# Strackr
STRACKR_EMAIL="op://${vaultName}/Choco-Strackr/username"
STRACKR_PASSWORD="op://${vaultName}/Choco-Strackr/password"
`;

        writeFileSync('.env.1password', envContent);
        console.log('✅ Generated .env.1password');
    }

    /**
     * Test environment file with op run
     */
    async testEnvFile() {
        console.log('🧪 Testing .env.1password file...');

        try {
            const { stdout } = await execAsync('op run --env-file=.env.1password -- env | grep -E "(AGENTMAIL|GITHUB|BROWSER_USE)"');
            
            const envVars = stdout.trim().split('\n').filter(line => line.includes('='));
            console.log(`✅ Environment file working: ${envVars.length} variables resolved`);
            
            envVars.forEach(line => {
                const [key] = line.split('=');
                console.log(`  ✅ ${key}: [RESOLVED]`);
            });
            
        } catch (error) {
            console.error('❌ Environment file test failed:', error.message);
            this.errors.push('Environment file test failed');
        }
    }

    /**
     * Create 1Password credential loading utility
     */
    createCredentialLoader() {
        const loaderCode = `/**
 * 1Password Credential Loader
 * Secure credential loading from 1Password vault
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class OnePasswordCredentials {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get secret from 1Password vault
     */
    async getSecret(reference) {
        // Check cache first
        const cached = this.cache.get(reference);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.value;
        }

        try {
            const { stdout } = await execAsync(\`op read "\${reference}"\`);
            const value = stdout.trim();
            
            // Cache the value
            this.cache.set(reference, {
                value,
                timestamp: Date.now()
            });
            
            return value;
        } catch (error) {
            throw new Error(\`Failed to retrieve secret \${reference}: \${error.message}\`);
        }
    }

    /**
     * Load all credentials for a service
     */
    async loadAgentmailCredentials() {
        return {
            apiKey: await this.getSecret('op://Private/Choco-Agentmail/credential'),
            fromEmail: await this.getSecret('op://Private/Choco-Agentmail/username')
        };
    }

    async loadGitHubCredentials() {
        return {
            token: await this.getSecret('op://Private/Choco-GitHub/credential'),
            username: 'chocothebot'
        };
    }

    async loadBrowserUseCredentials() {
        return {
            apiKey: await this.getSecret('op://Private/Choco-BrowserUse/credential')
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Singleton instance
export const credentials = new OnePasswordCredentials();
`;

        writeFileSync('scripts/1password-credentials.mjs', loaderCode);
        console.log('✅ Created 1password-credentials.mjs utility');
    }

    /**
     * Run complete migration test
     */
    async runMigration() {
        console.log('🚀 Starting 1Password migration...\n');

        // Check prerequisites
        const cliOk = await this.checkCLI();
        if (!cliOk) return false;

        const authOk = await this.checkAuth();
        if (!authOk) return false;

        console.log('');

        // Read current setup
        this.readCurrentSecrets();
        console.log('');

        // Test 1Password integration
        await this.testSecretRetrieval();
        console.log('');

        // Generate new environment file
        this.generateEnvFile();
        console.log('');

        // Test environment file
        await this.testEnvFile();
        console.log('');

        // Create utility files
        this.createCredentialLoader();

        // Summary
        this.showSummary();

        return this.errors.length === 0;
    }

    /**
     * Show migration summary
     */
    showSummary() {
        console.log('\n📊 MIGRATION SUMMARY');
        console.log('====================');

        if (this.errors.length === 0) {
            console.log('✅ Migration successful!');
            console.log('');
            console.log('Next steps:');
            console.log('1. Test your applications with: op run --env-file=.env.1password -- your-command');
            console.log('2. Update your scripts to use the credentials loader');
            console.log('3. Backup and remove .secrets/ directory');
            console.log('4. Update .gitignore to exclude .env.1password');
        } else {
            console.log('❌ Migration encountered issues:');
            this.errors.forEach(error => console.log(`  • ${error}`));
            console.log('');
            console.log('Please resolve these issues before proceeding.');
        }
    }
}

// CLI execution
if (import.meta.url === \`file://\${process.argv[1]}\`) {
    const migrator = new OnePasswordMigrator();
    const success = await migrator.runMigration();
    
    if (!success) {
        process.exit(1);
    }
}

export { OnePasswordMigrator };
`;