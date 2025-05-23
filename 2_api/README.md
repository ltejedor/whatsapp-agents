# WhatsApp AI Chatbot Tutorial

Welcome to this tutorial on building an intelligent WhatsApp chatbot using OpenAI's GPT models! This project provides everything you need to create a WhatsApp bot that can understand and respond to user messages, process images, and maintain conversation context.

## What You'll Build

This project allows you to create a WhatsApp chatbot that:

- Processes text messages using OpenAI's GPT models
- Analyzes images with OpenAI's Vision capabilities
- Maintains conversation history
- Can be customized for any business use case

## Prerequisites

- A Meta Developer account
- A WhatsApp Business account
- An OpenAI API key
- Node.js installed on your development machine

## Environment Setup

1. Clone this repository or remix it on platforms like Glitch
2. Create a `.env` file with these environment variables:
   - `WEBHOOK_VERIFY_TOKEN`: A secret string you choose for webhook verification
   - `GRAPH_API_TOKEN`: Your WhatsApp API token from Meta for Developers
   - `PORT`: The port your server will run on (default: 3000)
   - `OPENAI_API_KEY`: Your OpenAI API key

## WhatsApp Business API Setup

1. Create an app in the [Meta for Developers](https://developers.facebook.com/) portal
2. Set up the WhatsApp integration for your app
3. Get your temporary access token from the API Setup section (or set up permanent access)
4. Deploy this server to a platform like Glitch, Vercel, or any hosting service
5. Get your webhook URL (e.g., `https://your-project.glitch.me/webhook`)
6. In the WhatsApp Configuration section of your Meta app dashboard:
   - Subscribe to your webhook URL
   - Use your `WEBHOOK_VERIFY_TOKEN` as the Verify Token
   - Make sure to subscribe to the **messages** webhook field

## Customization

### System Prompt

Edit the `SYSTEM_PROMPT` variable in `server.js` to change how your AI assistant behaves. This is where you define the personality, capabilities, and limitations of your bot.

### Message Storage

The current implementation uses in-memory storage for conversation history. For production:
- Replace the `messageStore` with a proper database solution
- Add authentication and user management
- Implement proper error handling and logging

### Media Handling

The bot can process images by default. You can extend it to handle:
- Audio messages
- Documents
- Location data
- Contact cards

## Testing Your Bot

1. Start your server (`npm start`)
2. Use the WhatsApp Business Platform Test Number feature in your Meta Developer dashboard
3. Send a message to your test number
4. The bot should respond based on your system prompt

## Project Structure

- `server.js`: The main server file containing all the webhook logic
- `.env`: Environment variables (not included in the repo)

## Advanced Features to Consider

- Integration with other databases (MongoDB, PostgreSQL, etc.)
- Adding NLP capabilities for intent detection
- Implementing template messages for rich media
- Creating interactive buttons and list messages
- Integrating with your CRM or ticketing system
- Adding human handoff capabilities

## Troubleshooting

- Check your server logs for any errors
- Verify that your webhook is properly set up and receiving events
- Ensure your environment variables are correctly set
- Make sure your Meta app has the necessary permissions

## Resources

- [WhatsApp Business Platform Documentation](https://developers.facebook.com/docs/whatsapp/)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Express.js Documentation](https://expressjs.com/)

## License

This project is licensed under the MIT License - see the LICENSE file for details.