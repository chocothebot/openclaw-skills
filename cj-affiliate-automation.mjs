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

async function automateCJReports() {
  try {
    console.log("🚀 Starting CJ Affiliate report automation...");
    
    const task = await client.tasks.createTask({
      task: `Please help me automate this CJ Affiliate report process:

1. Go to https://members.cj.com/member/login

2. Login with the dedicated automation account credentials:
   - Email: chocothebot@gmail.com  
   - Password: wqm4XCY0wtb-naz2cjr

3. After login, navigate to Reports → Performance in the main menu

4. Once on the performance reports page:
   - Verify "Advertiser by Website" is selected in Performance by menu
   - Change Trend to "Daily" 
   - Make sure date range covers September 30, 2025 to January 24, 2026
   - Click "Run Report"

5. When the report loads, export the CSV file (should be a button on top right of table)

6. Tell me when the CSV is ready for download and what the filename is.

Please be careful with login credentials and let me know each step as you complete it.`,
    });

    console.log("⏳ Task created, waiting for completion...");
    
    // Get the task status and updates
    const result = await task.complete();
    
    console.log("✅ Result:", result.output);
    return result;
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Run the automation
automateCJReports();