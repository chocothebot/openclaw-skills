---
name: cj-strackr-sync
description: Automates weekly export of CJ Affiliate click statistics and import to Strackr. Use when managing affiliate marketing data synchronization, setting up recurring CJ-to-Strackr data flows, or when users need to import CJ click data for EPC calculations in Strackr.
---

# CJ-Strackr Sync

Automates the weekly process of exporting click statistics from CJ Affiliate and importing them into Strackr for accurate EPC (Earnings Per Click) calculations.

## Quick Start

Run the weekly sync automation:

```bash
node scripts/weekly_sync.mjs
```

The automation will:
1. Export click data from CJ Affiliate (last 7 days by default)
2. Import the CSV file into Strackr
3. Verify the import completed successfully

## Custom Date Range

For specific date ranges:

```bash
node scripts/weekly_sync.mjs --date-range=2026-01-01,2026-01-07
```

## Scheduling

Set up weekly automation with cron:

```bash
# Add to crontab (crontab -e)
0 9 * * 1 /usr/bin/node /path/to/scripts/weekly_sync.mjs
```

This runs every Monday at 9:00 AM ET.

## Requirements

### Accounts Needed
- **CJ Affiliate:** Automation account (chocothebot@gmail.com)
- **Strackr:** Automation account (chocothebot@gmail.com) 
- **Browser-Use API:** Cloud automation service

### Credentials Setup
Ensure these files exist with valid credentials:
- `.secrets/cj-affiliate.env`
- `.secrets/strackr.env` 
- `.secrets/browser-use.env`

## Process Details

### Step 1: CJ Affiliate Export
- Logs into CJ with automation account
- Navigates to Reports → Performance
- Configures "Advertiser by Website" report
- Sets trend to "Daily"
- Exports CSV for specified date range

### Step 2: Strackr Import
- Logs into Strackr with automation account
- Locates CJ integration section
- Uploads the exported CSV file
- Verifies import completion and record count

## Troubleshooting

Common issues and solutions:

**Export Failures:**
- Check CJ credentials in `.secrets/cj-affiliate.env`
- Verify date range is valid and not too far in the past
- Check if CJ website structure changed

**Import Failures:**  
- Verify CSV downloaded correctly from CJ
- Check Strackr credentials in `.secrets/strackr.env`
- Ensure CSV format matches Strackr requirements

**Automation Issues:**
- Check Browser-Use API key in `.secrets/browser-use.env`
- Verify sufficient API credits remain
- Try manual run first to isolate issues

## References

For detailed setup information, account configuration, and advanced troubleshooting:
- **Setup Guide:** See [setup_guide.md](references/setup_guide.md)

## Security

- Uses dedicated automation accounts (not personal accounts)
- Credentials stored securely in `.secrets/` directory
- Browser automation runs in isolated cloud environment
- No sensitive data stored in code or logs