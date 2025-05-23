# WhatsApp Agents: Building AI Where Your Users Are

Build AI agents that integrate directly with WhatsApp, enabling seamless interactions with users where they already communicate.

## Why WhatsApp?

WhatsApp is the communication backbone for billions of users worldwide. In Brazil, over 93% of businesses use it as their primary interface. In India, healthcare providers use it for appointment reminders, lab results, and payment confirmations.

When building AI agents, two main pain points emerge:

1. **Context loss**: Switching to a separate bot UI means your agent starts with limited context.
2. **Flow breakage**: Moving users out of their preferred communication platform adds friction.

By embedding agents directly in WhatsApp:
- Chat history provides built-in context
- Users stay in their familiar environment
- No new UI or app installations required

## Features

- Connect AI agents to your personal WhatsApp account
- Search and read WhatsApp messages (including media)
- Search contacts and send messages to individuals or groups
- Send and receive various media types (images, videos, documents, audio)
- Process messages locally with AI agents
- Store message history in a local SQLite database

## Project Structure

This repository provides two approaches to integrate AI agents with WhatsApp:

1. **MCP Server Approach** (Implemented): An unofficial but easier method using the WhatsApp web multidevice API
2. **Meta Business API** (Coming soon): The official approach using Meta's business API

## Installation & Setup

### 1. Clone the Repository

```bash
git clone --recurse-submodules https://github.com/ltejedor/whatsapp-agents.git
cd whatsapp-agents
```

### 2. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 4. Run the WhatsApp Bridge

```bash
cd 1_mcp/whatsapp-mcp/whatsapp-bridge
go run main.go
```

The first time you run it, you'll be prompted to scan a QR code with your WhatsApp mobile app to authenticate.


### 5. Run the Example Agent

```bash
cd 1_mcp
python main.py
```

## How It Works

### Architecture Overview

The WhatsApp Agents project consists of three main components:

1. **Go WhatsApp Bridge**: Connects to WhatsApp's web API using the [whatsmeow](https://github.com/tulir/whatsmeow) library, handles authentication, and stores message history in SQLite.

2. **Python MCP Server**: Implements the Model Context Protocol (MCP), providing standardized tools for AI models to interact with WhatsApp data.

3. **AI Agent**: Uses the MCP tools to process user inputs, generate responses, and perform actions on WhatsApp.

### Data Flow

1. The Go bridge connects to WhatsApp and maintains a local database of messages
2. The MCP server provides tools that query the database or interact with the bridge
3. The AI agent uses these tools to process requests and generate responses
4. Messages are sent back to WhatsApp through the bridge

### Available MCP Tools

- **search_contacts**: Find contacts by name or phone number
- **list_messages**: Retrieve message history with filters
- **list_chats**: View available conversations
- **send_message**: Send text messages to contacts or groups
- **send_file**: Share media files (images, videos, documents)
- **send_audio_message**: Send voice messages
- **download_media**: Access media from received messages

## Approaches to WhatsApp Integration

### 1. MCP Server 

The current implementation uses an unofficial but straightforward approach:
- Connects directly to your personal WhatsApp account via the web multidevice API
- Stores all messages locally in a SQLite database
- Only sends specific messages to AI models when explicitly requested
- Requires QR code authentication similar to WhatsApp Web

**Pros**: Easy setup, works with personal accounts, full message history access
**Cons**: Unofficial API, requires maintaining an active session

### 2. Meta Business API 

The official approach using Meta's WhatsApp Business API:
- Requires a Meta Business account and approval process
- More robust for production applications
- Limited message history retention
- Follows official Meta guidelines and policies


## Troubleshooting

### Authentication Issues

- **QR Code Problems**: If the QR code doesn't display or scan properly, restart the Go bridge
- **Session Expiration**: WhatsApp sessions expire after approximately 20 days, requiring re-authentication
- **Device Limit**: WhatsApp limits the number of connected devices; remove unused ones from WhatsApp Settings > Linked Devices

### Database Synchronization

If messages appear out of sync:
1. Stop the Go bridge
2. Delete the database files in `1_mcp/whatsapp-mcp/whatsapp-bridge/store/`
3. Restart the bridge and re-authenticate

### Windows Compatibility

On Windows, you need to enable CGO and install a C compiler:

1. Install [MSYS2](https://www.msys2.org/) and add `ucrt64\bin` to your PATH
2. Run the bridge with CGO enabled:
   ```bash
   cd 1_mcp/whatsapp-mcp/whatsapp-bridge
   go env -w CGO_ENABLED=1
   go run main.go
   ```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project uses components with various licenses. Please check the individual submodules for specific license information.
