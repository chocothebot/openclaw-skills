# PostHog MCP Integration Guide

A complete guide for integrating PostHog analytics with OpenClaw using the Model Context Protocol (MCP).

## Overview

This integration enables your OpenClaw bot to directly interact with PostHog's analytics platform through MCP, allowing you to:
- Query analytics data (trends, funnels, user paths)
- Manage feature flags and A/B tests
- Create and update dashboards
- Search PostHog documentation
- Track errors and investigate issues

## Prerequisites

- OpenClaw bot setup
- PostHog account with API access
- PostHog Personal API Key with MCP Server preset

## Step 1: Get PostHog API Key

1. Go to [PostHog Personal API Keys](https://app.posthog.com/settings/user-api-keys?preset=mcp_server)
2. Create a new API key using the **MCP Server preset**
3. Copy the API key (starts with `phx_`)

## Step 2: Install mcporter CLI

OpenClaw uses `mcporter` to manage MCP servers:

```bash
npm install -g mcporter
```

Verify installation:
```bash
mcporter --version
```

## Step 3: Configure PostHog MCP Server

Add PostHog MCP server to mcporter configuration:

```bash
mcporter config add posthog https://mcp.posthog.com/mcp
```

## Step 4: Add Authentication

Edit the mcporter configuration file to include your API key:

**File:** `config/mcporter.json`

```json
{
  "mcpServers": {
    "posthog": {
      "baseUrl": "https://mcp.posthog.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_POSTHOG_API_KEY_HERE"
      }
    }
  },
  "imports": []
}
```

**Important:** Replace `YOUR_POSTHOG_API_KEY_HERE` with your actual PostHog API key.

## Step 5: Verify Integration

Test the connection by listing available tools:

```bash
mcporter list posthog
```

You should see a comprehensive list of PostHog tools including:
- Analytics & insights tools
- Dashboard management
- Feature flag operations
- A/B testing functions
- Error tracking
- Documentation search

## Step 6: Test with Sample Query

Run a test query to ensure everything works:

```bash
mcporter call posthog.docs-search query="getting started with PostHog analytics"
```

## Available PostHog MCP Tools

### Analytics & Insights
- `query-run` - Execute trend, funnel, or HogQL queries
- `insight-create-from-query` - Save queries as insights
- `insight-get`, `insight-update`, `insight-delete` - Manage insights
- `insights-get-all` - List all insights

### Dashboard Management
- `dashboard-create`, `dashboard-update`, `dashboard-delete`
- `dashboards-get-all` - List all dashboards
- `add-insight-to-dashboard` - Add insights to dashboards
- `dashboard-reorder-tiles` - Reorganize dashboard layout

### Feature Flags
- `create-feature-flag` - Create new feature flags
- `feature-flag-get-all` - List all feature flags
- `update-feature-flag` - Modify existing flags
- `delete-feature-flag` - Remove feature flags

### A/B Testing
- `experiment-create` - Create A/B tests
- `experiment-get-all` - List experiments
- `experiment-results-get` - Get experiment results
- `experiment-update`, `experiment-delete` - Manage experiments

### Error Tracking
- `list-errors` - Get error lists
- `error-details` - Investigate specific errors

### Utilities
- `docs-search` - Search PostHog documentation
- `projects-get` - List accessible projects
- `switch-project` - Change active project

## Usage Examples

### Query Daily Active Users
```bash
mcporter call posthog.query-run \
  --args '{"query": {"kind": "TrendsQuery", "series": [{"event": "$pageview", "math": "dau"}], "dateRange": {"date_from": "-7d"}}}'
```

### Create Feature Flag
```bash
mcporter call posthog.create-feature-flag \
  name="new-checkout-flow" \
  key="new_checkout" \
  description="Testing new checkout process" \
  active=true \
  --args '{"filters": {"groups": [{"properties": [], "rollout_percentage": 50}]}}'
```

### Search Documentation
```bash
mcporter call posthog.docs-search query="funnel analysis setup"
```

## EU Cloud Users

If your PostHog project is on EU Cloud, use:
```bash
mcporter config add posthog https://mcp-eu.posthog.com/mcp
```

## Troubleshooting

### Authentication Issues
- Ensure your API key uses the "MCP Server preset"
- Verify the API key is correctly formatted in the config
- Check that the key hasn't expired

### Connection Problems
- Verify the correct PostHog MCP endpoint (US vs EU)
- Ensure mcporter is up to date
- Check network connectivity

### Tool Execution Errors
- Validate your PostHog project has the required features enabled
- Ensure proper permissions for the operations you're trying to perform
- Check PostHog API status if calls are failing

## Security Best Practices

1. **Store API Keys Securely**: Use environment variables or secure credential management
2. **Limit API Key Scope**: Use the MCP Server preset to restrict permissions
3. **Regular Key Rotation**: Rotate API keys periodically for security
4. **Monitor Usage**: Keep track of API usage and unusual activity

## Integration with OpenClaw

Once configured, PostHog MCP tools become available in your OpenClaw agent sessions. You can:
- Ask your bot to analyze user behavior trends
- Request feature flag creation and management
- Generate analytics reports
- Set up A/B tests through conversation

## Contributing

Found an issue or want to improve this guide? Please contribute to our documentation!

## Resources

- [PostHog MCP Documentation](https://posthog.com/docs/model-context-protocol)
- [mcporter GitHub](https://github.com/modelcontextprotocol/mcporter)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/introduction)
- [PostHog API Documentation](https://posthog.com/docs/api)

---

*Last updated: February 2026*