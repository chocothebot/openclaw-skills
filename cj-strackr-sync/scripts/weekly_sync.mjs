#!/usr/bin/env node
/**
 * CJ Affiliate -> Strackr Weekly Sync
 * 
 * Automates the weekly process of:
 * 1. Exporting click statistics from CJ Affiliate
 * 2. Importing the data into Strackr
 * 
 * Usage: node weekly_sync.mjs [--date-range=YYYY-MM-DD,YYYY-MM-DD]
 */

import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync, writeFileSync } from 'fs';

// Load API key
function loadApiKey() {
  try {
    const envContent = readFileSync('.secrets/browser-use.env', 'utf8');
    return envContent
      .split('\n')
      .find(line => line.startsWith('BROWSER_USE_API_KEY='))
      ?.split('=')[1];
  } catch (error) {
    console.error('❌ Error loading API key:', error.message);
    process.exit(1);
  }
}

// Load credentials
function loadCredentials() {
  try {
    const cjCreds = readFileSync('.secrets/cj-affiliate.env', 'utf8')
      .split('\n')
      .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});

    const strackrCreds = readFileSync('.secrets/strackr.env', 'utf8')
      .split('\n')
      .reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});

    return {
      cj: {
        email: cjCreds.CJ_EMAIL,
        password: cjCreds.CJ_PASSWORD
      },
      strackr: {
        email: strackrCreds.STRACKR_EMAIL,
        password: strackrCreds.STRACKR_PASSWORD
      }
    };
  } catch (error) {
    console.error('❌ Error loading credentials:', error.message);
    process.exit(1);
  }
}

// Calculate date range for weekly sync (last 7 days by default)
function getDateRange() {
  const args = process.argv.slice(2);
  const dateRangeArg = args.find(arg => arg.startsWith('--date-range='));
  
  if (dateRangeArg) {
    const [startDate, endDate] = dateRangeArg.split('=')[1].split(',');
    return { startDate, endDate };
  }
  
  // Default: last 7 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

async function exportFromCJ(client, credentials, dateRange) {
  console.log("📊 Step 1: Exporting click data from CJ Affiliate...");
  
  const task = await client.tasks.createTask({
    task: `Export CJ Affiliate performance data:

1. Go to https://members.cj.com/member/login

2. Login with automation account:
   - Email: ${credentials.cj.email}
   - Password: ${credentials.cj.password}

3. Navigate to Reports → Performance

4. Configure "Advertiser by Website" report:
   - Performance by: "Advertiser by Website"
   - Trend: "Daily" 
   - Date Range: ${dateRange.startDate} to ${dateRange.endDate}
   - Click "Run Report"

5. Export the CSV file when ready

6. Return the filename and confirm it's ready for download.

Note: This is weekly click data sync for Strackr import.`,
  });

  const result = await task.complete();
  console.log("✅ CJ Export Result:", result.output);
  return result;
}

async function importToStrackr(client, credentials, csvFilename) {
  console.log("📈 Step 2: Importing click data to Strackr...");
  
  const task = await client.tasks.createTask({
    task: `Import CJ Affiliate click statistics to Strackr - COMPLETE WORKFLOW:

1. LOGIN:
   - Go to https://strackr.com and login
   - Email: ${credentials.strackr.email}
   - Password: ${credentials.strackr.password}

2. NAVIGATE TO IMPORT PAGE:
   - Go directly to: https://app.strackr.com/connections/importdata

3. FIND CJ ROW AND CLICK UPLOAD:
   - Look for the table with connections
   - Find the row with "CJ" (Network: CJ Affiliate)
   - In the Actions column for the CJ row, click the "Upload" button

4. MODAL DIALOG WILL OPEN:
   - Title: "Import data for CJ"
   - File upload area says "Choose a file or drag it here"
   - Supported types: XLS, ZIP, XLSX, CSV (our files are CSV)
   - Max size: 10 MB

5. UPLOAD CSV FILE:
   - Upload the CSV file: ${csvFilename}
   - After selecting file, click the "Import" button (purple button)

6. VERIFY AND REPORT:
   - Wait for import completion
   - Report number of records imported
   - Note any success/error messages
   - Confirm click data now shows in dashboard

Note: Complete workflow verified from Strackr UI screenshots (see references/strackr_ui_guide.md).`,
  });

  const result = await task.complete();
  console.log("✅ Strackr Import Result:", result.output);
  return result;
}

// Status tracking
async function updateStatus(step, status, details = {}) {
  const statusFile = '.secrets/cj-strackr-status.json';
  const timestamp = new Date().toISOString();
  
  let statusData = {};
  try {
    statusData = JSON.parse(readFileSync(statusFile, 'utf8'));
  } catch (e) {
    // File doesn't exist yet, start fresh
  }
  
  statusData.lastRun = timestamp;
  statusData[step] = { status, timestamp, ...details };
  
  try {
    writeFileSync(statusFile, JSON.stringify(statusData, null, 2));
    console.log(`📊 Status Updated: ${step} = ${status}`);
  } catch (error) {
    console.warn(`⚠️ Could not write status file: ${error.message}`);
  }
}

async function logStep(stepNumber, description, action) {
  console.log(`\n🔄 Step ${stepNumber}: ${description}`);
  console.log("─".repeat(50));
  
  try {
    await updateStatus(`step${stepNumber}`, 'in_progress', { description });
    const result = await action();
    await updateStatus(`step${stepNumber}`, 'completed', { description });
    console.log(`✅ Step ${stepNumber} completed successfully`);
    return result;
  } catch (error) {
    await updateStatus(`step${stepNumber}`, 'failed', { description, error: error.message });
    console.error(`❌ Step ${stepNumber} failed: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    console.log("🚀 Starting CJ → Strackr Weekly Sync");
    console.log("=====================================");
    
    const apiKey = loadApiKey();
    const credentials = loadCredentials();
    const dateRange = getDateRange();
    
    console.log(`📅 Sync Period: ${dateRange.startDate} to ${dateRange.endDate}`);
    await updateStatus('sync', 'started', { dateRange });
    
    const client = new BrowserUseClient({ apiKey });
    
    // Step 1: Export from CJ
    const exportResult = await logStep(1, "Export click data from CJ Affiliate", async () => {
      return await exportFromCJ(client, credentials, dateRange);
    });
    
    // Extract CSV filename from result
    const csvFilename = extractFilename(exportResult.output);
    
    if (!csvFilename) {
      throw new Error("Could not determine CSV filename from CJ export");
    }
    
    console.log(`📄 CSV File: ${csvFilename}`);
    await updateStatus('export', 'completed', { csvFilename });
    
    // Step 2: Import to Strackr  
    const importResult = await logStep(2, "Import click data to Strackr", async () => {
      return await importToStrackr(client, credentials, csvFilename);
    });
    
    await updateStatus('import', 'completed', { importResult: importResult.output });
    await updateStatus('sync', 'completed', { 
      dateRange, 
      csvFilename, 
      summary: "Both export and import completed successfully" 
    });
    
    console.log("\n🎉 Weekly sync completed successfully!");
    console.log("=====================================");
    console.log("Summary:");
    console.log(`- Period: ${dateRange.startDate} to ${dateRange.endDate}`);
    console.log(`- CJ Export: ${csvFilename}`);
    console.log(`- Strackr Import: Completed`);
    console.log(`- Status File: .secrets/cj-strackr-status.json`);
    
  } catch (error) {
    await updateStatus('sync', 'failed', { error: error.message });
    console.error("❌ Weekly sync failed:", error.message);
    console.error("📊 Check .secrets/cj-strackr-status.json for detailed status");
    process.exit(1);
  }
}

// Helper function to extract filename from CJ export result
function extractFilename(output) {
  // Look for common CSV filename patterns in the output
  const patterns = [
    /filename:\s*([^\s]+\.csv)/i,
    /exported.*?([^\s]+\.csv)/i,
    /([^\s]*performance[^\s]*\.csv)/i
  ];
  
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match) return match[1];
  }
  
  // Default fallback
  return "performance_by_advertiser_by_website_daily.csv";
}

// Run the automation
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}