# Credential Templates

These are template files for common service credentials. 

## Usage

1. **Copy templates to .secrets/ directory:**
   ```bash
   cp .secrets-templates/* .secrets/
   ```

2. **Replace placeholder values with your actual credentials:**
   - Edit each `.env` file in `.secrets/`
   - Replace `your_*_here` with actual API keys/passwords
   - Follow the setup links provided in each file

3. **Verify setup:**
   ```bash
   npm run security:validate
   ```

## Security Notes

- ✅ **Never commit .secrets/ to git** - it's gitignored by default
- ✅ **Use environment variables** in your code: `process.env.API_KEY`
- ✅ **Rotate credentials regularly** - quarterly recommended
- ❌ **Never hardcode credentials** - git hooks will block commits

## Common Services

| File | Service | Purpose |
|------|---------|---------|
| `agentmail.env` | [Agentmail.to](https://agentmail.to) | Email automation |
| `browser-use.env` | [Browser-Use](https://browser-use.com) | Browser automation |
| `github.env` | [GitHub](https://github.com/settings/tokens) | Git operations |
| `gmail.env` | [Gmail](https://myaccount.google.com/apppasswords) | Email integration |
| `openai.env` | [OpenAI](https://platform.openai.com/api-keys) | GPT models |
| `anthropic.env` | [Anthropic](https://console.anthropic.com/) | Claude models |