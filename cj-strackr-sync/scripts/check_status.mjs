#!/usr/bin/env node
/**
 * CJ-Strackr Sync Status Checker
 * 
 * Displays current status of the sync process and helps debug issues
 */

import { readFileSync } from 'fs';

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getStatusIcon(status) {
  switch (status) {
    case 'completed': return '✅';
    case 'in_progress': return '🔄';
    case 'failed': return '❌';
    case 'started': return '🚀';
    default: return '❓';
  }
}

function checkStatus() {
  try {
    const statusData = JSON.parse(readFileSync('.secrets/cj-strackr-status.json', 'utf8'));
    
    console.log("📊 CJ-Strackr Sync Status");
    console.log("=========================");
    
    if (statusData.lastRun) {
      console.log(`🕐 Last Run: ${formatTimestamp(statusData.lastRun)}`);
    }
    
    // Overall sync status
    if (statusData.sync) {
      const icon = getStatusIcon(statusData.sync.status);
      console.log(`${icon} Overall Status: ${statusData.sync.status.toUpperCase()}`);
      
      if (statusData.sync.dateRange) {
        console.log(`📅 Date Range: ${statusData.sync.dateRange.startDate} to ${statusData.sync.dateRange.endDate}`);
      }
      
      if (statusData.sync.error) {
        console.log(`❌ Error: ${statusData.sync.error}`);
      }
      
      if (statusData.sync.summary) {
        console.log(`📋 Summary: ${statusData.sync.summary}`);
      }
    }
    
    console.log("\n📋 Step Details:");
    console.log("─".repeat(40));
    
    // Step-by-step status
    ['step1', 'step2'].forEach((step, index) => {
      if (statusData[step]) {
        const icon = getStatusIcon(statusData[step].status);
        const stepNum = index + 1;
        console.log(`${icon} Step ${stepNum}: ${statusData[step].description}`);
        console.log(`   Status: ${statusData[step].status}`);
        console.log(`   Time: ${formatTimestamp(statusData[step].timestamp)}`);
        
        if (statusData[step].error) {
          console.log(`   Error: ${statusData[step].error}`);
        }
      }
    });
    
    // Export/Import specific details
    if (statusData.export) {
      console.log(`\n📤 Export Details:`);
      console.log(`   Status: ${getStatusIcon(statusData.export.status)} ${statusData.export.status}`);
      if (statusData.export.csvFilename) {
        console.log(`   CSV File: ${statusData.export.csvFilename}`);
      }
    }
    
    if (statusData.import) {
      console.log(`\n📥 Import Details:`);
      console.log(`   Status: ${getStatusIcon(statusData.import.status)} ${statusData.import.status}`);
      if (statusData.import.importResult) {
        console.log(`   Result: ${statusData.import.importResult.substring(0, 100)}...`);
      }
    }
    
    // Next steps / recommendations
    console.log(`\n💡 Next Steps:`);
    
    if (statusData.sync?.status === 'failed') {
      console.log(`   1. Check the error message above`);
      console.log(`   2. Fix any credential or API issues`);
      console.log(`   3. Re-run: node scripts/weekly_sync.mjs`);
    } else if (statusData.sync?.status === 'completed') {
      console.log(`   ✅ Sync completed successfully!`);
      console.log(`   📊 Check Strackr dashboard for updated click data`);
    } else if (statusData.sync?.status === 'in_progress') {
      console.log(`   ⏳ Sync is currently running...`);
      console.log(`   📊 Run this command again in a few minutes`);
    } else {
      console.log(`   🚀 Ready to run sync: node scripts/weekly_sync.mjs`);
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log("📊 CJ-Strackr Sync Status");
      console.log("=========================");
      console.log("❓ No status file found");
      console.log("\n💡 This means no sync has been run yet.");
      console.log("🚀 To start: node scripts/weekly_sync.mjs");
    } else {
      console.error("❌ Error reading status file:", error.message);
    }
  }
}

checkStatus();