#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ClockodoAPI } from "./clockodo.js";

async function main() {
    const server = new McpServer({
        name: "clockodo-mcp-server",
        version: "1.0.0"
    });

    const clockodoAPI = new ClockodoAPI();

    // Register Users resource
    server.registerResource(
        "users",
        "clockodo://users",
        {
            title: "Clockodo Users",
            description: "All registered users from your Clockodo instance",
            mimeType: "application/json"
        },
        async (uri) => {
            try {
                const users = await clockodoAPI.getUsers();
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify(users, null, 2)
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    );

    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.error('Received SIGINT, shutting down gracefully...');
        await server.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.error('Received SIGTERM, shutting down gracefully...');
        await server.close();
        process.exit(0);
    });
}

main().catch(error => {
    console.error("Server error:", error);
    process.exit(1);
});