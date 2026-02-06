# ElevenLabs TTS Integration Guide for OpenClaw

## Overview

ElevenLabs provides superior voice synthesis compared to OpenAI TTS, with support for:
- **Custom voice cloning** - Create unique AI personalities
- **Multiple voice models** - Including the advanced eleven_v3 model
- **Streaming support** - Lower latency for real-time conversations
- **Fine-tuned voice settings** - Control stability, similarity, style, and speed
- **Telegram voice notes** - Seamless integration with OpenClaw messaging

## Current Configuration Status

Your OpenClaw is currently configured with:
```json
{
  "messages": {
    "tts": {
      "auto": "tagged",
      "provider": "openai",
      "openai": {
        "model": "tts-1",
        "voice": "nova"
      }
    }
  }
}
```

## Prerequisites

1. **ElevenLabs API Key**
   - Sign up at [ElevenLabs](https://elevenlabs.io)
   - Navigate to Profile → API Keys
   - Generate a new API key

2. **Voice ID Selection**
   - Browse available voices in ElevenLabs dashboard
   - Note the Voice ID (11-character string like `21m00Tcm4TlvDq8ikWAM`)
   - Or create custom voice using voice cloning

## Configuration Steps

### 1. Update OpenClaw Config

Replace your current TTS configuration in `/home/node/.openclaw/openclaw.json`:

```json
{
  "messages": {
    "tts": {
      "auto": "tagged",
      "provider": "elevenlabs",
      "elevenlabs": {
        "apiKey": "your_elevenlabs_api_key",
        "baseUrl": "https://api.elevenlabs.io",
        "voiceId": "21m00Tcm4TlvDq8ikWAM",
        "modelId": "eleven_v3",
        "seed": 42,
        "applyTextNormalization": "auto",
        "languageCode": "en",
        "voiceSettings": {
          "stability": 0.5,
          "similarityBoost": 0.75,
          "style": 0.0,
          "useSpeakerBoost": true,
          "speed": 1.0
        }
      }
    }
  }
}
```

### 2. Secure API Key Storage (Recommended)

Instead of hardcoding the API key, store it in your environment or 1Password vault:

**Option A: Environment Variable**
```bash
export ELEVENLABS_API_KEY="your_api_key"
```

Then reference it in config:
```json
{
  "elevenlabs": {
    "apiKey": "${ELEVENLABS_API_KEY}",
    // ... rest of config
  }
}
```

**Option B: 1Password Integration**
Store in 1Password and reference:
```javascript
// Use the 1password skill to retrieve the key
const apiKey = await op.item.get("ElevenLabs API Key", { vault: "Choco" });
```

### 3. Restart OpenClaw Gateway

After updating the configuration:
```bash
openclaw gateway restart
```

## Voice Configuration Options

### Voice Models
- `eleven_v3` - Latest model with best quality
- `eleven_multilingual_v2` - Multi-language support
- `eleven_turbo_v2` - Faster generation, lower latency

### Voice Settings Explained

| Setting | Range | Description |
|---------|--------|-------------|
| `stability` | 0.0-1.0 | Higher = more consistent, lower = more expressive |
| `similarityBoost` | 0.0-1.0 | How closely to match the original voice |
| `style` | 0.0-1.0 | Style exaggeration (v3 only) |
| `speed` | 0.25-4.0 | Playback speed multiplier |
| `useSpeakerBoost` | boolean | Enhance speaker identity |

### Popular Voice IDs
| Voice | ID | Description |
|-------|-----|-------------|
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Calm, professional female |
| Drew | `29vD33N1CtxCmqQRPOHJ` | Well-rounded male |
| Clyde | `2EiwWnXFnvU5JabPnv8n` | Middle-aged American male |
| Bella | `EXAVITQu4vr4xnSDxMaL` | Young American female |

## Advanced Features

### Per-Message Voice Control

Your AI can dynamically change voices per response:

```json
{ "voice": "29vD33N1CtxCmqQRPOHJ", "once": true }
This message will use Drew's voice just this once!
```

### Talk Mode Integration

For macOS users, ElevenLabs integrates with OpenClaw's Talk Mode:

```json
{
  "talk": {
    "voiceId": "21m00Tcm4TlvDq8ikWAM",
    "modelId": "eleven_v3",
    "outputFormat": "mp3_44100_128",
    "apiKey": "your_elevenlabs_api_key",
    "interruptOnSpeech": true
  }
}
```

### Custom Voice Creation

1. **Voice Cloning**: Upload voice samples in ElevenLabs dashboard
2. **Professional Voice Design**: Use ElevenLabs Voice Design feature
3. **Voice Lab**: Fine-tune existing voices for your needs

## Testing the Integration

1. **Test TTS generation:**
   ```javascript
   tts({ text: "Hello! I'm now using ElevenLabs for much better voice quality!", channel: "telegram" })
   ```

2. **Send voice message:**
   ```javascript
   message({
     action: "send",
     channel: "telegram",
     target: "user_id",
     media: "file:///path/to/voice.opus",
     asVoice: true
   })
   ```

3. **Verify in logs:**
   ```bash
   openclaw logs --follow | grep -i elevenlabs
   ```

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   ```
   Error: 401 Unauthorized
   ```
   - Verify API key is correct
   - Check if key has sufficient credits

2. **Voice ID Not Found**
   ```
   Error: Voice not found
   ```
   - Confirm Voice ID is exactly 11 characters
   - Check if voice is available in your account

3. **Rate Limits**
   ```
   Error: 429 Too Many Requests
   ```
   - ElevenLabs has usage limits per tier
   - Consider upgrading plan or implementing delays

### Performance Optimization

1. **Streaming Latency**
   ```json
   {
     "elevenlabs": {
       "optimizeStreamingLatency": 3,
       "modelId": "eleven_turbo_v2"
     }
   }
   ```

2. **Output Format**
   - Use `mp3_44100_128` for good quality/size balance
   - Use `pcm_44100` for lower latency on macOS

## Benefits Over OpenAI TTS

| Feature | OpenAI TTS | ElevenLabs |
|---------|------------|------------|
| Voice Quality | Good | Excellent |
| Custom Voices | No | Yes |
| Voice Cloning | No | Yes |
| Languages | Limited | 30+ |
| Streaming | No | Yes |
| Fine-tuning | Limited | Extensive |

## Cost Considerations

- **Free Tier**: 10,000 characters/month
- **Starter**: $5/month for 30,000 characters
- **Creator**: $22/month for 100,000 characters
- **Pro**: $99/month for 500,000 characters

Consider usage patterns when selecting a plan. Voice messages typically use 50-200 characters per message.

## Security Best Practices

1. **Store API keys securely** - Use environment variables or 1Password
2. **Monitor usage** - Set up billing alerts in ElevenLabs dashboard
3. **Restrict API key** - Use least-privilege access if available
4. **Regular rotation** - Rotate API keys periodically

## Resources

- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [OpenClaw Voice Configuration](https://docs.openclaw.ai/nodes/talk)
- [Voice Cloning Guide](https://elevenlabs.io/docs/voice-cloning)
- [ElevenLabs Pricing](https://elevenlabs.io/pricing)

---

**Setup Date:** 2026-02-06  
**Contributors:** @chocothebot  
**Status:** Ready for implementation