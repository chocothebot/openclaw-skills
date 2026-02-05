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
import { readFileSync } from 'fs';

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
    task: `Import the CJ click statistics to Strackr:

1. Go to Strackr.com and login:
   - Email: ${credentials.strackr.email}
   - Password: ${credentials.strackr.password}

2. Navigate to the CJ Affiliate integration section

3. Find the click import/upload feature (follow their documentation for importing clicks)

4. Upload the CSV file: ${csvFilename}

5. Verify the import completed successfully and return confirmation with:
   - Number of records imported
   - Date range covered
   - Any warnings or errors

Note: This completes the weekly CJ→Strackr sync process.`,
  });

  const result = await task.complete();
  console.log("✅ Strackr Import Result:", result.output);
  return result;
}

async function main() {
  try {
    console.log("🚀 Starting CJ → Strackr Weekly Sync");
    console.log("=====================================");
    
    const apiKey = loadApiKey();
    const credentials = loadCredentials();
    const dateRange = getDateRange();
    
    console.log(`📅 Sync Period: ${dateRange.startDate} to ${dateRange.endDate}`);
    
    const client = new BrowserUseClient({ apiKey });
    
    // Step 1: Export from CJ
    const exportResult = await exportFromCJ(client, credentials, dateRange);
    
    // Extract CSV filename from result (you may need to parse this based on actual response)
    const csvFilename = extractFilename(exportResult.output);
    
    if (!csvFilename) {
      throw new Error("Could not determine CSV filename from CJ export");
    }
    
    console.log(`📄 CSV File: ${csvFilename}`);
    
    // Step 2: Import to Strackr  
    const importResult = await importToStrackr(client, credentials, csvFilename);
    
    console.log("🎉 Weekly sync completed successfully!");
    console.log("=====================================");
    console.log("Summary:");
    console.log(`- Period: ${dateRange.startDate} to ${dateRange.endDate}`);
    console.log(`- CJ Export: ${csvFilename}`);
    console.log(`- Strackr Import: Completed`);
    
  } catch (error) {
    console.error("❌ Weekly sync failed:", error.message);
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