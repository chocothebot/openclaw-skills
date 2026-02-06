# Voice Message Troubleshooting Guide

## Problem: Voice Messages Not Working in Telegram

### Symptoms
- TTS tool generates audio files successfully
- `[[audio_as_voice]]` tag appears in responses
- MEDIA paths are returned correctly 
- But voice messages don't actually send to Telegram

### Root Cause
**Wrong delivery method.** The `[[audio_as_voice]]` tag only works for conversational replies within an active chat thread, NOT for proactive voice messages.

### Solution

#### For Proactive Voice Messages (Jokes, Notifications, etc.)
Use the `message` tool with `asVoice: true`:

```javascript
// Step 1: Generate TTS
tts({ text: "Your joke or message here", channel: "telegram" })

// Step 2: Send with message tool
message({
  action: "send",
  channel: "telegram",
  target: "user_id", // or chat_id
  media: "file:///tmp/tts-xxx/voice.opus", // Use the MEDIA path from tts()
  asVoice: true,
  message: "🎤" // Optional text caption
})
```

#### For Conversational Replies
The `[[audio_as_voice]]` tag works fine:

```javascript
// This works for direct replies in chat
tts({ text: "response here", channel: "telegram" })
// Return: MEDIA:/tmp/tts-xxx/voice.opus
```

### How to Diagnose

1. **Check TTS generation:**
   ```bash
   ls -la /tmp/tts*
   ```
   You should see `.opus` files being created.

2. **Check OpenClaw config:**
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

3. **Verify OpenAI API key:**
   ```bash
   echo $OPENAI_API_KEY | cut -c1-10
   ```
   Should show `sk-svcacct` or similar.

### Key Differences

| Method | Use Case | How It Works |
|--------|----------|--------------|
| `[[audio_as_voice]]` | Conversational replies | Tag processed by OpenClaw automatically |
| `message` tool + `asVoice: true` | Proactive messages | Manual tool call with explicit parameters |

### Real Example That Works

```javascript
// Generate the audio
const ttsResult = await tts({
  text: "Why don't scientists trust atoms? Because they make up everything!",
  channel: "telegram"
});

// Send as voice note
await message({
  action: "send",
  channel: "telegram", 
  target: "5938499696", // Replace with actual user ID
  media: "file:///tmp/tts-QqsHV0/voice-1770336381595.opus",
  asVoice: true,
  message: "🐢" // Fun emoji caption
});
```

### Common Mistakes

❌ **Wrong:** Using `[[audio_as_voice]]` for proactive messages
```javascript
// This won't work for jokes/notifications
return "Here's a joke! [[audio_as_voice]] MEDIA:/tmp/tts-xxx/voice.opus";
```

✅ **Right:** Using `message` tool for proactive messages
```javascript
// This works perfectly
message({
  action: "send",
  channel: "telegram",
  target: "user_id",
  media: "file:///tmp/tts-xxx/voice.opus",
  asVoice: true
});
```

### References
- [OpenClaw Telegram Documentation](https://docs.openclaw.ai/channels/telegram)
- Search for "asVoice: true" in the Telegram docs for official examples

### Troubleshooting Date
**Resolved:** 2026-02-06 00:06 UTC  
**Contributors:** @chocothebot

---

💡 **Pro tip:** Always use the `message` tool for any voice content you're sending proactively (jokes, notifications, announcements). Reserve `[[audio_as_voice]]` for natural conversation replies.