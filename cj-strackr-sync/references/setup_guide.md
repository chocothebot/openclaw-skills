# CJ-Strackr Sync Setup Guide

## Account Requirements

### CJ Affiliate Account
- **Email:** chocothebot@gmail.com
- **Password:** Stored in `.secrets/cj-affiliate.env`
- **Purpose:** Automation account for exporting click statistics

### Strackr Account  
- **Email:** chocothebot@gmail.com (same as CJ)
- **Password:** Stored in `.secrets/strackr.env`
- **Purpose:** Automation account for importing click data

### Browser-Use API
- **API Key:** Stored in `.secrets/browser-use.env`
- **Service:** Cloud browser automation platform
- **Usage:** Automates both CJ export and Strackr import

## Credential Storage

Credentials are stored securely in `.secrets/` directory:

```bash
.secrets/
├── cj-affiliate.env      # CJ login credentials
├── strackr.env          # Strackr login credentials
└── browser-use.env      # Browser automation API key
```

## Data Flow

1. **CJ Affiliate Export**
   - Login to CJ with automation account
   - Navigate to Reports → Performance
   - Configure "Advertiser by Website" report with Daily trend
   - Set date range (default: last 7 days)
   - Export CSV file

2. **Strackr Import**
   - Login to Strackr with automation account
   - Navigate to CJ integration section
   - Upload the exported CSV file
   - Verify import completion

## Scheduling

Weekly automation runs every Monday at 9:00 AM ET via cron job:

```bash
# Weekly CJ-Strackr sync - Mondays at 9 AM ET
0 9 * * 1 /usr/bin/node /path/to/weekly_sync.mjs
```

## Troubleshooting

### Common Issues

**CJ Export Failures:**
- Check if CJ credentials are still valid
- Verify the report date range is valid
- Check if CJ website structure changed

**Strackr Import Failures:**
- Verify CSV file was downloaded correctly
- Check Strackr credentials and permissions
- Ensure CSV format matches Strackr requirements

**Browser-Use Issues:**
- Verify API key is valid and has sufficient credits
- Check for service outages at browser-use.com
- Retry with different browser automation parameters

### Monitoring & Status Tracking

**Check sync status:**
```bash
node scripts/check_status.mjs
```

**Status tracking features:**
- Real-time progress logging
- Step-by-step status tracking
- Error capture and reporting  
- Completion verification
- Status file: `.secrets/cj-strackr-status.json`

### Manual Override

To run sync for specific date range:

```bash
node scripts/weekly_sync.mjs --date-range=2026-01-01,2026-01-07
```

**Important:** Always run the complete workflow, never run export/import separately!

### Credential Updates

When credentials need to be updated:

1. Update the respective `.secrets/*.env` file
2. Test the automation manually
3. No cron job changes needed (reads from files)

## Process Improvements & Lessons Learned

### Critical Issue: Process Fragmentation
**Problem:** Running export and import as separate scripts led to incomplete syncs.
**Solution:** Always use the complete `weekly_sync.mjs` workflow.
**Prevention:** Added status tracking and monitoring to catch incomplete processes.

### Monitoring Enhancements
- **Status file:** `.secrets/cj-strackr-status.json` tracks every step
- **Real-time logging:** See exactly where the process is 
- **Error capture:** Detailed error messages for debugging
- **Progress verification:** Confirm both export AND import completed

### Best Practices
1. **Complete Workflow Only:** Use `scripts/weekly_sync.mjs`, not separate scripts
2. **Status Monitoring:** Run `scripts/check_status.mjs` after sync
3. **Verify Results:** Check Strackr dashboard for updated click data
4. **Error Handling:** Use status file to debug issues quickly

## Security Notes

- All credentials are stored in `.secrets/` directory (not in git)
- Automation accounts are separate from personal accounts
- Browser-use runs in isolated cloud environment
- Change passwords periodically for security