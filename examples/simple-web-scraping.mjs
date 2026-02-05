#!/usr/bin/env node
/**
 * Simple Browser-Use Example: GitHub Repository Info
 * 
 * This example shows how to use browser-use to:
 * 1. Navigate to a GitHub repository  
 * 2. Extract repository information
 * 3. Return structured data
 * 
 * Perfect for OpenClaw agents to learn browser automation basics!
 */

import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync } from 'fs';

// Load API key from .secrets/browser-use.env
function loadApiKey() {
  try {
    const envContent = readFileSync('.secrets/browser-use.env', 'utf8');
    return envContent
      .split('\n')
      .find(line => line.startsWith('BROWSER_USE_API_KEY='))
      ?.split('=')[1];
  } catch (error) {
    console.error('❌ Error loading API key from .secrets/browser-use.env');
    console.error('Make sure you have your Browser-Use API key stored there!');
    process.exit(1);
  }
}

async function getGitHubRepoInfo(repoUrl) {
  const apiKey = loadApiKey();
  const client = new BrowserUseClient({ apiKey });

  try {
    console.log(`🔍 Analyzing repository: ${repoUrl}`);
    
    const task = await client.tasks.createTask({
      task: `Analyze this GitHub repository and extract key information:

1. Go to: ${repoUrl}

2. Extract and return the following information:
   - Repository name and description
   - Primary programming language
   - Number of stars and forks
   - Last commit date
   - Number of contributors
   - Main topics/tags if any

3. Format as structured text with clear labels.

Example format:
Repository: [name]  
Description: [description]
Language: [primary language]
Stars: [count]
Forks: [count]
Last Commit: [date]
Contributors: [count]
Topics: [list]`,
    });

    console.log("⏳ Browser automation in progress...");
    const result = await task.complete();
    
    console.log("✅ Repository Analysis Complete!");
    console.log("==========================================");
    console.log(result.output);
    
    return result.output;
    
  } catch (error) {
    console.error("❌ Browser automation failed:", error.message);
    throw error;
  }
}

// Example usage
async function main() {
  const repoUrl = process.argv[2] || 'https://github.com/chocothebot/openclaw-skills';
  
  console.log("🚀 Browser-Use Example: GitHub Repository Info");
  console.log("==============================================");
  
  try {
    await getGitHubRepoInfo(repoUrl);
  } catch (error) {
    console.error("Failed to analyze repository:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getGitHubRepoInfo };