import { AgentMailClient } from 'agentmail';
import { readFileSync } from 'fs';

// Load API key from environment
function loadApiKey() {
  try {
    const envContent = readFileSync('.secrets/agentmail.env', 'utf8');
    const apiKey = envContent
      .split('\n')
      .find(line => line.startsWith('AGENTMAIL_API_KEY='))
      ?.split('=')[1]
      ?.trim();
    
    if (!apiKey) {
      throw new Error('AGENTMAIL_API_KEY not found in .secrets/agentmail.env');
    }
    
    return apiKey;
  } catch (error) {
    console.error('❌ Error loading API key from .secrets/agentmail.env');
    console.error('Make sure you have your Agentmail API key stored there!');
    process.exit(1);
  }
}

function loadFromEmail() {
  try {
    const envContent = readFileSync('.secrets/agentmail.env', 'utf8');
    const email = envContent
      .split('\n')
      .find(line => line.startsWith('AGENTMAIL_FROM_EMAIL='))
      ?.split('=')[1]
      ?.trim();
    
    if (!email) {
      throw new Error('AGENTMAIL_FROM_EMAIL not found in .secrets/agentmail.env');
    }
    
    return email;
  } catch (error) {
    console.error('❌ Error loading from email from .secrets/agentmail.env');
    process.exit(1);
  }
}

const apiKey = loadApiKey();
const fromEmail = loadFromEmail();
const client = new AgentMailClient({ apiKey });

// Read the spec file
const specContent = readFileSync('/home/node/.openclaw/workspace/clawmunity/SPEC.md', 'utf-8');

async function sendSpec() {
  try {
    // Send email to myself
    const result = await client.inboxes.messages.send(
      fromEmail,  // inbox_id as first positional arg
      {
        to: fromEmail,
        subject: '📋 Clawmunity SPEC.md v0.1',
        text: `Here is the initial specification for Clawmunity.\n\nAuthors: Ramin + Choco 🐢\nDate: 2026-02-05\n\n---\n\n${specContent}`
      }
    );
    
    console.log('Email sent successfully!');
    console.log(result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendSpec();