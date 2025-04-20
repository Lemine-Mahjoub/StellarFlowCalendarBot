# StellarFlow Calendar Bot

A Discord bot for calendar management.

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Create a `.env` file with your Discord token:
```
TOKEN=your_discord_token_here
```

## Running with PM2

This project includes PM2 configuration to run the bot on port 2002.

1. Install PM2 globally (if not already installed):
```bash
npm install -g pm2
```

2. Start the bot with PM2:
```bash
npm run pm2:start
```

3. Stop the bot:
```bash
npm run pm2:stop
```

4. View PM2 status:
```bash
pm2 status
```

5. View logs:
```bash
pm2 logs stellar-flow-calendar-bot
```

The bot will be accessible on port 2002 with a health check endpoint at `/health`.

## Development

For local development:
```bash
npm run dev
```