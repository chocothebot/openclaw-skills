#!/usr/bin/env node

/**
 * ElevenLabs TTS Setup Script for OpenClaw
 * 
 * This script helps you configure ElevenLabs as your TTS provider in OpenClaw.
 * Run with: node scripts/setup-elevenlabs.mjs
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => {
  rl.question(prompt, resolve);
});

const CONFIG_PATH = '/home/node/.openclaw/openclaw.json';

const POPULAR_VOICES = {
  'rachel': '21m00Tcm4TlvDq8ikWAM',  // Calm, professional female
  'drew': '29vD33N1CtxCmqQRPOHJ',    // Well-rounded male
  'clyde': '2EiwWnXFnvU5JabPnv8n',   // Middle-aged American male
  'bella': 'EXAVITQu4vr4xnSDxMaL',   // Young American female
  'antoni': 'ErXwobaYiN019PkySvjV',   // Well-rounded male
  'elli': 'MF3mGyEYCl7XYWbV9V6O',    // Emotional female
  'josh': 'TxGEqnHWrfWFTfGW9XjX',    // Deep male
  'arnold': 'VR6AewLTigWG4xSOukaG',   // American male
  'adam': 'pNInz6obpgDQGcFmaJgB',     // Deep male
  'sam': 'yoZ06aMxZJJ28mfd3POQ'       // Raspy male
};

async function main() {
  console.log('🎤 ElevenLabs TTS Setup for OpenClaw\n');

  try {
    // Check if config exists
    if (!fs.existsSync(CONFIG_PATH)) {
      console.error('❌ OpenClaw config not found at:', CONFIG_PATH);
      console.log('Make sure OpenClaw is installed and configured first.');
      return;
    }

    // Read current config
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configContent);

    console.log('📋 Current TTS Provider:', config.messages?.tts?.provider || 'none');
    console.log('');

    // Get API key
    const apiKey = await question('🔑 Enter your ElevenLabs API Key: ');
    if (!apiKey || !apiKey.startsWith('sk-')) {
      console.log('⚠️  Warning: ElevenLabs API keys usually start with "sk-"');
    }

    // Choose voice
    console.log('\\n🎭 Popular Voice Options:');
    Object.entries(POPULAR_VOICES).forEach(([name, id]) => {
      console.log(`  ${name}: ${id}`);
    });
    console.log('  custom: Enter your own voice ID');
    console.log('');

    const voiceChoice = await question('Choose a voice (e.g., "rachel" or voice ID): ').toLowerCase();
    const voiceId = POPULAR_VOICES[voiceChoice] || voiceChoice;

    if (voiceId.length !== 20) {
      console.log('⚠️  Warning: Voice IDs are usually 20 characters long');
    }

    // Configure TTS settings
    const useSecure = await question('🔐 Store API key in environment variable? (y/n): ');
    
    const ttsConfig = {
      auto: "tagged",
      provider: "elevenlabs",
      elevenlabs: {
        apiKey: useSecure.toLowerCase().startsWith('y') ? "${ELEVENLABS_API_KEY}" : apiKey,
        baseUrl: "https://api.elevenlabs.io",
        voiceId: voiceId,
        modelId: "eleven_v3",
        seed: 42,
        applyTextNormalization: "auto",
        languageCode: "en",
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true,
          speed: 1.0
        }
      }
    };

    // Update config
    config.messages = config.messages || {};
    config.messages.tts = ttsConfig;

    // Backup original config
    const backupPath = CONFIG_PATH + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, configContent);
    console.log('💾 Config backed up to:', backupPath);

    // Write new config
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('✅ OpenClaw config updated!');

    if (useSecure.toLowerCase().startsWith('y')) {
      console.log('\\n🔧 Don\\'t forget to set your environment variable:');
      console.log(`   export ELEVENLABS_API_KEY="${apiKey}"`);
    }

    console.log('\\n🚀 Restart OpenClaw gateway to apply changes:');
    console.log('   openclaw gateway restart');

    console.log('\\n📖 For more details, see: docs/ELEVENLABS_INTEGRATION_GUIDE.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main().catch(console.error);