import { AgentMailClient } from 'agentmail';
import { readFileSync } from 'fs';

const apiKey = 'am_8819efebdae82a1bec21275c6d7a846bca53625d2608216a0c19f631e3cc747b';
const client = new AgentMailClient({ apiKey });

// Read the spec file
const specContent = readFileSync('/home/node/.openclaw/workspace/clawmunity/SPEC.md', 'utf-8');

async function sendSpec() {
  try {
    // Send email to myself
    const result = await client.inboxes.messages.send(
      'choco@agentmail.to',  // inbox_id as first positional arg
      {
        to: 'choco@agentmail.to',
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
