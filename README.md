# Clockodo MCP Server

A TypeScript-based Model Context Protocol (MCP) server that integrates with the Clockodo time tracking API. This server provides comprehensive access to your Clockodo data through the standardized MCP protocol, enabling Claude Desktop and other MCP clients to interact with users, time entries, and projects from your Clockodo instance.

## Features

- **Users Resource**: Access all registered users from your Clockodo instance
- **Entries Resource**: Retrieve time entries for specific users within date ranges
- **Projects Resource**: Access all projects with detailed information including budgets and status
- **Automatic Pagination**: Handles multiple pages of data automatically
- **Real-time Data**: Fetches live data from Clockodo API
- **Comprehensive Logging**: Detailed API request/response logging for debugging
- **Type Safety**: Full TypeScript implementation with Zod validation
- **MCP Compliant**: Follows Model Context Protocol standards for seamless integration

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Clockodo account with API access
- Clockodo API credentials (email and API key)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd clockodo-ts
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your Clockodo credentials in `.env` (see [Configuration](#configuration))

5. Build the project:
```bash
npm run build
```

## Configuration

Create a `.env` file in the project root with your Clockodo credentials:

```env
CLOCKODO_EMAIL=your-email@example.com
CLOCKODO_API_KEY=your-api-key-here
```

### Getting Clockodo API Credentials

1. Log in to your Clockodo account
2. Go to Settings → API
3. Generate or copy your API key
4. Use your Clockodo login email as `CLOCKODO_EMAIL`

## Usage

### Development Mode

For development with live TypeScript compilation:

```bash
npm run dev
```

### Production Mode

Build and run the compiled server:

```bash
npm run build
node build/index.js
```

### MCP Client Integration

#### Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "clockodo": {
      "command": "node",
      "args": ["/absolute/path/to/your/clockodo-ts/build/index.js"],
      "env": {
        "CLOCKODO_EMAIL": "your-email@example.com",
        "CLOCKODO_API_KEY": "your-api-key"
      }
    }
  }
}
```

Or using your existing `.env` file:

```json
{
  "mcpServers": {
    "clockodo": {
      "command": "node",
      "args": ["/absolute/path/to/your/clockodo-ts/build/index.js"],
      "cwd": "/absolute/path/to/your/clockodo-ts"
    }
  }
}
```

**Note**: Replace `/absolute/path/to/your/clockodo-ts` with the actual absolute path to your project directory.

#### MCP Inspector

For development and testing:

```bash
npx @modelcontextprotocol/inspector
```

Configure with:
- **Server Command**: `npx tsx /absolute/path/to/your/clockodo-ts/src/index.ts`
- **Transport**: stdio
- **Working Directory**: `/absolute/path/to/your/clockodo-ts`

## Available Resources

### Users Resource

- **URI**: `clockodo://users`
- **Description**: Retrieves all registered users from your Clockodo instance
- **Data**: Complete user information including names, emails, roles, and settings
- **Format**: JSON array of user objects

Example usage in Claude:
```
Can you show me all users from my Clockodo instance?
```

### Entries Resource

- **URI**: `clockodo://entries/{userId}/{timeSince}/{timeUntil}`
- **Description**: Retrieves time entries for a specific user within a given timeframe
- **Parameters**:
  - `userId`: Clockodo user ID (number)
  - `timeSince`: Start date in ISO 8601 format (e.g., `2025-09-01T00:00:00Z`)
  - `timeUntil`: End date in ISO 8601 format (e.g., `2025-09-30T23:59:59Z`)
- **Data**: Complete time entry information including project details, time spent, and descriptions
- **Format**: JSON array of entry objects

Example usage in Claude:
```
Show me time entries for user 148226 from September 1-30, 2025
What did I work on last week? --clockodo
```

**Example URIs**:
- `clockodo://entries/148226/2025-09-01T00:00:00Z/2025-09-30T23:59:59Z`
- `clockodo://entries/123/2024-12-01T00:00:00Z/2024-12-31T23:59:59Z`

### Projects Resource

- **URI**: `clockodo://projects`
- **Description**: Retrieves all projects from your Clockodo instance
- **Data**: Complete project information including:
  - Project names, numbers, and descriptions
  - Customer assignments and relationships
  - Budget information (monetary amounts, hard/soft budgets)
  - Project status (active, completed, dates)
  - Billing settings and revenue factors
  - Detailed notes and contact information
- **Format**: JSON array of project objects

Example usage in Claude:
```
Show me all projects from Clockodo
Which projects are currently active?
What's the budget for project "Agile Coaching 2025"?
```

## API Structure

### Project Structure

```
src/
├── index.ts          # Main MCP server entry point
├── clockodo.ts       # Clockodo API client
build/
├── index.js          # Compiled executable
├── clockodo.js       # Compiled API client
```

### Key Components

- **McpServer**: Main server instance handling MCP protocol
- **ClockodoAPI**: API client for Clockodo integration with comprehensive logging
- **StdioServerTransport**: Communication layer for MCP clients
- **Zod Schemas**: Type validation for API responses (Users, Entries, Projects)
- **Logger**: Built-in logging system that writes to `clockodo-api.log`

## Development

### Scripts

- `npm run dev` - Start development server with live reload
- `npm run build` - Build TypeScript to JavaScript
- `npm test` - Run tests (if implemented)

### Testing API Integration

Test your Clockodo API connection directly:

```bash
curl "https://my.clockodo.com/api/v3/users?page=1" \
  -H "Accept: application/json" \
  -H "X-ClockodoApiUser: your-email@example.com" \
  -H "X-ClockodoApiKey: your-api-key" \
  -H "X-Clockodo-External-Application: mcp-ts"
```

### MCP Protocol Testing

Test MCP protocol responses:

```bash
# List all available resources
echo '{"jsonrpc": "2.0", "method": "resources/list", "id": 1, "params": {}}' | npm run dev

# Test users resource
echo '{"jsonrpc": "2.0", "method": "resources/read", "id": 2, "params": {"uri": "clockodo://users"}}' | npm run dev

# Test projects resource
echo '{"jsonrpc": "2.0", "method": "resources/read", "id": 3, "params": {"uri": "clockodo://projects"}}' | npm run dev

# Test entries resource (replace with actual user ID and dates)
echo '{"jsonrpc": "2.0", "method": "resources/read", "id": 4, "params": {"uri": "clockodo://entries/148226/2025-09-01T00:00:00Z/2025-09-30T23:59:59Z"}}' | npm run dev
```

### Logging and Debugging

The server includes comprehensive logging that writes to `clockodo-api.log`:
- All API requests and responses
- Authentication details (API keys are masked)
- Data validation results
- Error details and stack traces

To monitor logs in real-time:
```bash
tail -f clockodo-api.log
```

## Error Handling

The server includes comprehensive error handling:

- **Authentication Errors**: Invalid Clockodo credentials
- **API Errors**: Clockodo API failures or rate limits
- **Validation Errors**: Invalid API response formats
- **Network Errors**: Connection timeouts or network issues

All errors are properly formatted as MCP protocol error responses.

## Security

- Environment variables are required for API credentials
- No credentials are logged or exposed in error messages
- API requests include proper authentication headers
- All API responses are validated before processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

**"Environment variables are required" error:**
- Ensure `.env` file exists with correct credentials
- Check that `dotenv.config()` is called before importing other modules

**"Invalid API response format" errors:**
- Verify your Clockodo API credentials are correct
- Check if your API key has proper permissions
- Ensure your Clockodo account has access to the users endpoint

**MCP connection issues:**
- Verify the server starts without errors in development mode
- Check that your MCP client configuration points to the correct path
- Ensure the server process has proper permissions

### Debug Mode

Run with debug output:

```bash
DEBUG=* npm run dev
```

## License

[Add your license here]

## Support

For issues related to:
- **MCP Protocol**: See [Model Context Protocol documentation](https://modelcontextprotocol.io/)
- **Clockodo API**: See [Clockodo API documentation](https://www.clockodo.com/de/api/)
- **This Project**: Create an issue in this repository