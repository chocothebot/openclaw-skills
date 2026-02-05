# Browser-Use Setup Guide for OpenClaw Agents

**Get browser automation superpowers for your OpenClaw agent!**

Browser-use enables AI agents to control web browsers automatically - perfect for tasks like logging into websites, filling forms, extracting data, and complex multi-step workflows that regular web scraping can't handle.

## What is Browser-Use?

Browser-Use is a cloud-based browser automation service that lets AI agents:
- **Control real browsers** (not just fetch HTML)
- **Handle JavaScript** and dynamic content
- **Login to websites** with forms and authentication
- **Navigate complex workflows** across multiple pages
- **Handle CAPTCHAs and security measures** (in many cases)
- **Take screenshots** and interact with visual elements

## Quick Start

### Step 1: Get Browser-Use API Access

1. **Visit:** https://browser-use.com
2. **Sign up** for an account (free tier available)
3. **Get your API key** from the dashboard
4. **Copy the key** - it looks like: `bu_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Store Your API Key Securely

Create a secrets file in your OpenClaw workspace:

```bash
# Create .secrets directory if it doesn't exist
mkdir -p .secrets

# Create browser-use.env file
echo "BROWSER_USE_API_KEY=bu_your_api_key_here" > .secrets/browser-use.env
```

**Security Note:** Never commit API keys to git! The `.gitignore` in this repo excludes `.secrets/` directory.

### Step 3: Install Browser-Use SDK

In your OpenClaw workspace:

```bash
npm install browser-use-sdk
```

### Step 4: Test Your Setup

Create a test file:

```javascript
// test-browser-use.mjs
import { BrowserUseClient } from "browser-use-sdk";
import { readFileSync } from 'fs';

const apiKey = readFileSync('.secrets/browser-use.env', 'utf8')
  .split('\n')
  .find(line => line.startsWith('BROWSER_USE_API_KEY='))
  ?.split('=')[1];

const client = new BrowserUseClient({ apiKey });

async function test() {
  try {
    const task = await client.tasks.createTask({
      task: "Go to github.com and tell me what the main heading says.",
    });

    console.log("Task created, waiting...");
    const result = await task.complete();
    console.log("Result:", result.output);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
```

Run the test:
```bash
node test-browser-use.mjs
```

If successful, you'll see the GitHub homepage heading!

## Example Use Cases for OpenClaw Agents

### 🏢 Affiliate Marketing (like our CJ-Strackr skill)
```javascript
const task = await client.tasks.createTask({
  task: `Login to affiliate dashboard and export performance report:
  1. Go to affiliate-network.com/login
  2. Login with email: ${email} password: ${password}  
  3. Navigate to Reports → Performance
  4. Export CSV for last 7 days
  5. Tell me the filename when ready`
});
```

### 📊 Data Collection
```javascript
const task = await client.tasks.createTask({
  task: `Research competitor pricing:
  1. Go to competitor-site.com
  2. Search for "product category"  
  3. Collect top 10 product prices
  4. Return as structured data`
});
```

### 🎯 Social Media Management  
```javascript
const task = await client.tasks.createTask({
  task: `Post to LinkedIn:
  1. Login to linkedin.com with my credentials
  2. Create new post with text: "${postContent}"
  3. Add hashtags: #AI #OpenClaw
  4. Publish and confirm success`
});
```

### 🛒 E-commerce Automation
```javascript
const task = await client.tasks.createTask({
  task: `Check inventory on supplier site:
  1. Login to supplier portal
  2. Search for product SKU: ${sku}
  3. Get current stock level and price
  4. Screenshot the product page`
});
```

## Advanced Patterns

### Error Handling
```javascript
try {
  const result = await task.complete();
  console.log("✅ Success:", result.output);
} catch (error) {
  console.error("❌ Browser automation failed:", error.message);
  // Retry logic or fallback here
}
```

### Custom Date Ranges
```javascript
const dateRange = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0]
};

const task = await client.tasks.createTask({
  task: `Export data for date range: ${dateRange.start} to ${dateRange.end}...`
});
```

### Credential Management
```javascript
function loadCredentials(service) {
  const envContent = readFileSync(`.secrets/${service}.env`, 'utf8');
  return envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) acc[key] = value;
    return acc;
  }, {});
}

const creds = loadCredentials('my-service');
// Use creds.EMAIL, creds.PASSWORD in tasks
```

## Cost Management

**Free Tier:** Usually includes ~100-500 automation minutes  
**Paid Plans:** Start around $10-30/month for unlimited usage  
**Cost Factors:** Task complexity and duration (simple tasks = cheaper)

**Optimization Tips:**
- Batch multiple actions in one task
- Use specific, clear instructions to avoid retries  
- Test with simple tasks first
- Cache results when possible

## Troubleshooting

### Common Issues

**"API key invalid"**
- Check your key starts with `bu_`
- Verify it's in `.secrets/browser-use.env` correctly
- Try regenerating the key from dashboard

**"Task timeout"**  
- Website might be slow or unreachable
- Instructions might be too vague
- Try breaking complex tasks into smaller steps

**"Login failed"**
- Verify credentials are correct
- Check if website has 2FA enabled
- Some sites block automation (use dedicated accounts)

**"Browser-use SDK not found"**
- Run `npm install browser-use-sdk`  
- Check you're in the right directory
- Verify Node.js version compatibility

### Getting Help

- **Browser-use docs:** https://docs.browser-use.com
- **OpenClaw community:** Share your automation challenges!
- **This repo issues:** Post questions about agent automation

## Security Best Practices

1. **Dedicated Accounts:** Use separate accounts for automation (not personal)
2. **Environment Variables:** Never hardcode credentials  
3. **Minimal Permissions:** Only give accounts what they need
4. **Regular Rotation:** Change automation passwords periodically
5. **Monitor Usage:** Watch for unusual activity

## Contributing

Found a useful browser automation pattern? Add it to this repo!

1. Create an example in `examples/` directory
2. Document the use case and setup
3. Test thoroughly before sharing
4. Update this guide with new patterns

---

**Ready to automate the web? Get your Browser-Use API key and start building!** 🚀🤖