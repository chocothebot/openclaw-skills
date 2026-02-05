import { AgentMailClient } from 'agentmail';
import { readFileSync } from 'fs';
import { credentials } from '../scripts/1password-credentials.mjs';

// Example: Send email using 1Password credentials
async function sendSpecWith1Password() {
  try {
    console.log('🔐 Loading credentials from 1Password...');
    
    // Load credentials securely from 1Password
    const agentmailCreds = await credentials.loadAgentmailCredentials();
    
    console.log('✅ Credentials loaded successfully');
    
    // Initialize client with 1Password credentials
    const client = new AgentMailClient({ 
      apiKey: agentmailCreds.apiKey 
    });

    // Read the spec file
    const specContent = readFileSync('/home/node/.openclaw/workspace/clawmunity/SPEC.md', 'utf-8');

    // Send email
    const result = await client.inboxes.messages.send(
      agentmailCreds.fromEmail,  // inbox_id
      {
        to: agentmailCreds.fromEmail,
        subject: '📋 Clawmunity SPEC.md v0.1 (via 1Password)',
        text: `Here is the initial specification for Clawmunity.\n\nAuthors: Ramin + Choco 🐢\nDate: 2026-02-05\nSecurity: Enhanced with 1Password integration\n\n---\n\n${specContent}`
      }
    );
    
    console.log('✅ Email sent successfully!');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    process.exit(1);
  }
}

// Alternative: Use environment variables with op run
async function sendSpecWithOpRun() {
  try {
    // This function expects to be called with:
    // op run --env-file=.env.1password -- node examples/send-email-1password.mjs
    
    const apiKey = process.env.AGENTMAIL_API_KEY;
    const fromEmail = process.env.AGENTMAIL_FROM_EMAIL;
    
    if (!apiKey || !fromEmail) {
      throw new Error('Missing environment variables. Run with: op run --env-file=.env.1password -- node this-script.mjs');
    }
    
    console.log('✅ Using environment variables from op run');
    
    const client = new AgentMailClient({ apiKey });
    const specContent = readFileSync('/home/node/.openclaw/workspace/clawmunity/SPEC.md', 'utf-8');

    const result = await client.inboxes.messages.send(
      fromEmail,
      {
        to: fromEmail,
        subject: '📋 Clawmunity SPEC.md v0.1 (via op run)',
        text: `Here is the initial specification for Clawmunity.\n\nAuthors: Ramin + Choco 🐢\nDate: 2026-02-05\nSecurity: Enhanced with 1Password + op run\n\n---\n\n${specContent}`
      }
    );
    
    console.log('✅ Email sent via op run!');
    console.log(result);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Choose method based on how script is called
if (process.env.AGENTMAIL_API_KEY) {
  // Called with op run
  sendSpecWithOpRun();
} else {
  // Called directly, use 1Password credentials loader
  sendSpecWith1Password();
}