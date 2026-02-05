import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync } from 'fs';

// Load API key
const apiKey = readFileSync('.secrets/browser-use.env', 'utf8')
  .split('\n')
  .find(line => line.startsWith('BROWSER_USE_API_KEY='))
  ?.split('=')[1];

const client = new BrowserUseClient({ apiKey });

async function importToStrackrComplete() {
  try {
    console.log("📈 Importing CJ click data to Strackr (COMPLETE WORKFLOW)...");
    
    const task = await client.tasks.createTask({
      task: `Import CJ Affiliate click statistics to Strackr - COMPLETE STEP-BY-STEP:

1. LOGIN:
   - Go to https://strackr.com and login
   - Email: chocothebot@gmail.com
   - Password: qmq.MXK7yhd9bwv@pde

2. NAVIGATE TO IMPORT PAGE:
   - Go directly to: https://app.strackr.com/connections/importdata

3. FIND CJ ROW AND CLICK UPLOAD:
   - Look for the table with connections
   - Find the row with "CJ" (Network: CJ Affiliate)
   - In the Actions column for the CJ row, click the "Upload" button

4. MODAL DIALOG WILL OPEN:
   - Title: "Import data for CJ"
   - You'll see a file upload area that says "Choose a file or drag it here"
   - Supported file types: XLS, ZIP, XLSX, CSV
   - Maximum file size: 10 MB

5. UPLOAD THE CSV FILES:
   - Upload: performance_by_advertiser_by_website_09-30-2025_-_01-24-2026_daily.csv
   - Upload: performance_by_advertiser_by_website_02-05-2026.csv
   - (May need to upload one at a time)

6. COMPLETE THE IMPORT:
   - After selecting file(s), click the "Import" button (purple button)
   - Wait for import to complete
   - Note any success/error messages

7. VERIFY AND REPORT:
   - Confirm the import completed successfully
   - Report number of records imported
   - Check if click data now shows in the dashboard

This is the EXACT workflow from the user's screenshots showing both the main page and the modal dialog.`,
    });

    console.log("⏳ Running complete Strackr import workflow...");
    const result = await task.complete();
    
    console.log("✅ Complete Strackr Import Result:");
    console.log(result.output);
    return result;
    
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    throw error;
  }
}

importToStrackrComplete();