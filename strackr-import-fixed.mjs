import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync } from 'fs';

// Load API key
const apiKey = readFileSync('.secrets/browser-use.env', 'utf8')
  .split('\n')
  .find(line => line.startsWith('BROWSER_USE_API_KEY='))
  ?.split('=')[1];

const client = new BrowserUseClient({ apiKey });

async function importToStrackrCorrect() {
  try {
    console.log("📈 Importing CJ click data to Strackr (CORRECTED WORKFLOW)...");
    
    const task = await client.tasks.createTask({
      task: `Import CJ Affiliate click statistics to Strackr - EXACT WORKFLOW:

1. Go to https://strackr.com and login:
   - Email: chocothebot@gmail.com
   - Password: qmq.MXK7yhd9bwv@pde

2. Navigate DIRECTLY to: https://app.strackr.com/connections/importdata

3. On the Import Data page:
   - Look for the table with connections
   - Find the row with "CJ" (Network: CJ Affiliate)  
   - In the Actions column for the CJ row, click the "Upload" button

4. Upload the CSV files we exported from CJ:
   - performance_by_advertiser_by_website_09-30-2025_-_01-24-2026_daily.csv
   - performance_by_advertiser_by_website_02-05-2026.csv

5. Complete the upload process and verify import success

6. Report back:
   - Number of records imported from each file
   - Any success/error messages
   - Confirmation that click data is now showing in Strackr

This is the EXACT workflow shown in the user's screenshot.`,
    });

    console.log("⏳ Running corrected Strackr import workflow...");
    const result = await task.complete();
    
    console.log("✅ Strackr Import Result:");
    console.log(result.output);
    return result;
    
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    throw error;
  }
}

importToStrackrCorrect();