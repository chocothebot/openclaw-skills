---
name: cj-strackr-sync
description: Automates weekly export of CJ Affiliate click statistics and import to Strackr. Use when managing affiliate marketing data synchronization, setting up recurring CJ-to-Strackr data flows, or when users need to import CJ click data for EPC calculations in Strackr.
---

# CJ-Strackr Sync

Automates the weekly process of exporting click statistics from CJ Affiliate and importing them into Strackr for accurate EPC (Earnings Per Click) calculations.

## Quick Start

**IMPORTANT: Always run the complete workflow, not individual steps!**

```bash
# Run the complete end-to-end sync
node scripts/weekly_sync.mjs

# Check status and monitor progress  
node scripts/check_status.mjs
```

The automation will:
1. **Export** click data from CJ Affiliate (last 7 days by default)
2. **Import** the CSV file into Strackr  
3. **Verify** both steps completed successfully
4. **Log** detailed status for monitoring

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

## Monitoring & Status

**Check sync status anytime:**
```bash
node scripts/check_status.mjs
```

This shows:
- Overall sync status (completed/failed/in progress)
- Step-by-step progress 
- Detailed error messages if any
- Next recommended actions

**Status file location:** `.secrets/cj-strackr-status.json`

## Troubleshooting

### ⚠️ CRITICAL: Avoid Process Fragmentation

**❌ NEVER run individual export/import scripts separately**  
**✅ ALWAYS run the complete workflow: `node scripts/weekly_sync.mjs`**

**Common mistake:** Running separate export scripts without completing import.  
**Result:** CJ data exported but never imported to Strackr → Click data stays at 0.  
**Fix:** Always use the complete workflow and check status afterward.

### Other Common Issues

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
- Use `check_status.mjs` to see exactly where it failed

## References

For detailed setup information, account configuration, and troubleshooting:
- **Setup Guide:** See [setup_guide.md](references/setup_guide.md)
- **Strackr UI Guide:** See [strackr_ui_guide.md](references/strackr_ui_guide.md) - Visual workflow with screenshots

## Security

- Uses dedicated automation accounts (not personal accounts)
- Credentials stored securely in `.secrets/` directory
- Browser automation runs in isolated cloud environment
- No sensitive data stored in code or logs