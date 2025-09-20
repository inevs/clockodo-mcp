# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based MCP (Model Context Protocol) server for integrating with the Clockodo time tracking API. The project is currently in early development with minimal implementation.

## Commands

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `build/` directory and makes the output executable.

### Run MCP Server
```bash
node build/index.js
```
Starts the MCP server. Requires environment variables to be set.

### Development Testing
Use the `api.http` file with an HTTP client (like REST Client in VS Code) to test Clockodo API endpoints. Environment variables for authentication are loaded from `.env`:
- `CLOCKODO_EMAIL` - Your Clockodo email
- `CLOCKODO_API_KEY` - Your Clockodo API key

### MCP Testing
Test the server with MCP protocol messages:
```bash
echo '{"jsonrpc": "2.0", "method": "resources/list", "id": 1, "params": {}}' | node build/index.js
```

## Architecture

- **Entry Point**: `src/index.ts` - Main MCP server implementation with Users resource
- **API Client**: `src/clockodo.ts` - Clockodo API client with authentication and data fetching
- **Build Output**: `build/index.js` - Executable MCP server binary
- **API Testing**: `api.http` - Contains sample Clockodo API requests for development
- **Dependencies**:
  - `@modelcontextprotocol/sdk` - Core MCP framework
  - `zod` - Runtime type validation and API response schemas

## Environment Setup

The project expects a `.env` file with Clockodo credentials:
```
CLOCKODO_EMAIL=your-email@example.com
CLOCKODO_API_KEY=your-api-key
```

## MCP Server Context

This project implements a fully functional MCP server that provides:
- **Users Resource**: `clockodo://users` - Retrieves all registered users from your Clockodo instance
- **Stdio Transport**: Communicates via stdin/stdout for MCP client integration
- **Automatic Pagination**: Handles multiple pages of user data from Clockodo API
- **Error Handling**: Proper MCP protocol error responses for API failures
- **Input Validation**: Zod schemas for API response validation

## TypeScript Configuration

- Target: ES2022 with Node16 module resolution
- Strict mode enabled
- Output directory: `build/`
- Source directory: `src/`