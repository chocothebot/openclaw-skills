#!/usr/bin/env node
import { readFileSync } from 'fs';
import { join } from 'path';

// Read API keys from environment or .secrets
let anthropicKey = process.env.ANTHROPIC_API_KEY;
let openaiKey = process.env.OPENAI_API_KEY;

// If not in env, try .secrets files
if (!anthropicKey || !openaiKey) {
  try {
    const secretsDir = '.secrets';
    
    // Try to read Anthropic key
    if (!anthropicKey) {
      try {
        anthropicKey = readFileSync(join(secretsDir, 'anthropic.key'), 'utf8').trim();
      } catch (e) {
        console.log('💡 No Anthropic key in env or .secrets/anthropic.key');
      }
    }

    // Try to read OpenAI key  
    if (!openaiKey) {
      try {
        openaiKey = readFileSync(join(secretsDir, 'openai.key'), 'utf8').trim();
      } catch (e) {
        console.log('💡 No OpenAI key in env or .secrets/openai.key');
      }
    }
  } catch (e) {
    console.log('No .secrets directory found');
  }
}

// Fetch Anthropic models
if (anthropicKey) {
  try {
    console.log('🤖 Fetching Anthropic models...');
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Anthropic Models:');
      data.data.forEach(model => {
        console.log(`  ${model.id} - ${model.display_name || model.id}`);
      });
    } else {
      console.log('❌ Anthropic API error:', data);
    }
  } catch (error) {
    console.log('❌ Error fetching Anthropic models:', error.message);
  }
}

// Fetch OpenAI models
if (openaiKey) {
  try {
    console.log('\n🤖 Fetching OpenAI models...');
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiKey}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ OpenAI Models:');
      // Filter for GPT models only
      const gptModels = data.data.filter(model => 
        model.id.includes('gpt') || model.id.includes('o1')
      ).sort((a, b) => a.id.localeCompare(b.id));
      
      gptModels.forEach(model => {
        console.log(`  ${model.id} (${model.owned_by})`);
      });
    } else {
      console.log('❌ OpenAI API error:', data);
    }
  } catch (error) {
    console.log('❌ Error fetching OpenAI models:', error.message);
  }
}

if (!anthropicKey && !openaiKey) {
  console.log('\n💡 To use this script:');
  console.log('  1. Create .secrets/anthropic.key with your Anthropic API key');
  console.log('  2. Create .secrets/openai.key with your OpenAI API key');
  console.log('  3. Run: node fetch-models.mjs');
}