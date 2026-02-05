# CJ-Strackr Sync Skill

**Automated weekly export of CJ Affiliate click statistics and import to Strackr.**

## Quick Start

```bash
# Run complete weekly sync
node scripts/weekly_sync.mjs

# Check progress/status  
node scripts/check_status.mjs
```

## Key Files

- **`SKILL.md`** - Main skill documentation and usage
- **`scripts/weekly_sync.mjs`** - Complete automation workflow
- **`scripts/check_status.mjs`** - Status monitoring and debugging
- **`references/strackr_ui_guide.md`** - Visual guide with screenshots ⭐
- **`references/setup_guide.md`** - Detailed setup and troubleshooting

## Important Notes

⚠️ **Always run the complete workflow** (`weekly_sync.mjs`), not individual export/import scripts  
📸 **Visual documentation included** - see UI guide for exact Strackr interface screenshots  
📊 **Status tracking** - monitor progress and debug issues with `check_status.mjs`  

## Screenshots Included

This skill includes actual Strackr UI screenshots showing:
- Import Data page with CJ row and Upload button
- Upload modal dialog with file requirements
- Exact workflow verified by real user interface

## Lesson Learned

**Process Fragmentation:** Running separate export/import scripts caused incomplete syncs.  
**Solution:** Complete end-to-end workflow with proper status tracking.  
**Prevention:** Visual documentation and status monitoring prevent future mistakes.

---

*Skill developed through real-world testing and UI verification*