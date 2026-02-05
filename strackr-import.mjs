import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync } from 'fs';

// Load API key
const apiKey = readFileSync('.secrets/browser-use.env', 'utf8')
  .split('\n')
  .find(line => line.startsWith('BROWSER_USE_API_KEY='))
  ?.split('=')[1];

const client = new BrowserUseClient({ apiKey });

async function importToStrackr() {
  try {
    console.log("📈 Importing CJ click data to Strackr...");
    
    const task = await client.tasks.createTask({
      task: `Import CJ Affiliate click statistics to Strackr:

1. Go to https://strackr.com and login:
   - Email: chocothebot@gmail.com
   - Password: qmq.MXK7yhd9bwv@pde

2. Navigate to the CJ Affiliate integration section or click import area

3. Look for "Import Clicks" or "Upload CSV" functionality for CJ data

4. We have TWO CSV files that need to be imported:
   - performance_by_advertiser_by_website_09-30-2025_-_01-24-2026_daily.csv
   - performance_by_advertiser_by_website_02-05-2026.csv (recent data)

5. Upload both CSV files following Strackr's click import process

6. Verify the import completed successfully and report:
   - Number of records imported from each file
   - Date ranges now showing click data  
   - Any errors or warnings during import

This should fill the gap in click statistics from Sept 2025 through Feb 5, 2026.`,
    });

    console.log("⏳ Importing click data to Strackr...");
    const result = await task.complete();
    
    console.log("✅ Strackr Import Result:");
    console.log(result.output);
    return result;
    
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    throw error;
  }
}

importToStrackr();