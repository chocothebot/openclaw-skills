import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync } from 'fs';

// Load API key from environment
const apiKey = process.env.BROWSER_USE_API_KEY || readFileSync('.secrets/browser-use.env', 'utf8')
  .split('\n')
  .find(line => line.startsWith('BROWSER_USE_API_KEY='))
  ?.split('=')[1];

const client = new BrowserUseClient({
  apiKey: apiKey,
});

async function getRecentCJData() {
  try {
    console.log("🚀 Getting missing CJ data from Jan 25 - Feb 5, 2026...");
    
    const task = await client.tasks.createTask({
      task: `Get recent CJ Affiliate data that's missing:

1. Go to https://members.cj.com/member/login

2. Login with automation account:
   - Email: chocothebot@gmail.com  
   - Password: wqm4XCY0wtb-naz2cjr

3. Navigate to Reports → Performance

4. Configure the report for the MISSING period:
   - Performance by: "Advertiser by Website"
   - Trend: "Daily"
   - Date Range: January 25, 2026 to February 5, 2026
   - Click "Run Report"

5. Export the CSV file when ready

6. Tell me the filename and that it's ready for download.

This will fill the gap in our data from Jan 24 to today.`,
    });

    console.log("⏳ Getting recent data...");
    const result = await task.complete();
    
    console.log("✅ Result:", result.output);
    return result;
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

getRecentCJData();