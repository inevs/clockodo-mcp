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

### Development Testing
Use the `api.http` file with an HTTP client (like REST Client in VS Code) to test Clockodo API endpoints. Environment variables for authentication are loaded from `.env`:
- `CLOCKODO_EMAIL` - Your Clockodo email
- `CLOCKODO_API_KEY` - Your Clockodo API key

## Architecture

- **Entry Point**: `src/index.ts` - Currently contains minimal placeholder code
- **Build Output**: `build/index.js` - Executable MCP server binary
- **API Testing**: `api.http` - Contains sample Clockodo API requests for development
- **Dependencies**:
  - `@modelcontextprotocol/sdk` - Core MCP framework
  - `zod` - Runtime type validation

## Environment Setup

The project expects a `.env` file with Clockodo credentials:
```
CLOCKODO_EMAIL=your-email@example.com
CLOCKODO_API_KEY=your-api-key
```

## MCP Server Context

This project implements an MCP server, which means:
- The main entry point should implement MCP server protocol handlers
- The server will expose tools and resources for Clockodo time tracking operations
- Client applications connect to this server to access Clockodo functionality through MCP

## TypeScript Configuration

- Target: ES2022 with Node16 module resolution
- Strict mode enabled
- Output directory: `build/`
- Source directory: `src/`