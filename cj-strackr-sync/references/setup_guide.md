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

### Manual Override

To run sync for specific date range:

```bash
node weekly_sync.mjs --date-range=2026-01-01,2026-01-07
```

### Credential Updates

When credentials need to be updated:

1. Update the respective `.secrets/*.env` file
2. Test the automation manually
3. No cron job changes needed (reads from files)

## Security Notes

- All credentials are stored in `.secrets/` directory (not in git)
- Automation accounts are separate from personal accounts
- Browser-use runs in isolated cloud environment
- Change passwords periodically for security