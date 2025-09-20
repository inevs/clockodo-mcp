#!/usr/bin/env node

import dotenv from "dotenv";

// Configure dotenv silently for MCP compatibility
const originalConsoleLog = console.log;
console.log = () => {}; // Temporarily silence console.log
dotenv.config();
console.log = originalConsoleLog; // Restore console.log

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
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

    // Register Entries resource with ResourceTemplate
    server.registerResource(
        "entries",
        new ResourceTemplate("clockodo://entries/{userId}/{timeSince}/{timeUntil}", { list: undefined }),
        {
            title: "Clockodo Entries",
            description: "Time entries for a specific user within a given timeframe. Use format: clockodo://entries/{userId}/{timeSince}/{timeUntil} where timeSince and timeUntil are ISO 8601 dates (e.g., 2025-09-01T00:00:00Z)",
            mimeType: "application/json"
        },
        async (uri, { userId, timeSince, timeUntil }) => {
            try {
                // Handle potential string arrays from ResourceTemplate
                const userIdStr = Array.isArray(userId) ? userId[0] : userId;
                const timeSinceStr = Array.isArray(timeSince) ? timeSince[0] : timeSince;
                const timeUntilStr = Array.isArray(timeUntil) ? timeUntil[0] : timeUntil;

                const userIdNum = parseInt(userIdStr, 10);
                if (isNaN(userIdNum)) {
                    throw new Error('Invalid userId: must be a number');
                }

                // Validate date format (basic ISO 8601 check)
                const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
                if (!dateRegex.test(timeSinceStr) || !dateRegex.test(timeUntilStr)) {
                    throw new Error('Invalid date format. Use ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ');
                }

                const entries = await clockodoAPI.getEntries(userIdNum, timeSinceStr, timeUntilStr);
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify(entries, null, 2)
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch entries: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    );

    // Register Projects resource
    server.registerResource(
        "projects",
        "clockodo://projects",
        {
            title: "Clockodo Projects",
            description: "All projects from your Clockodo instance",
            mimeType: "application/json"
        },
        async (uri) => {
            try {
                const projects = await clockodoAPI.getProjects();
                return {
                    contents: [{
                        uri: uri.href,
                        text: JSON.stringify(projects, null, 2)
                    }]
                };
            } catch (error) {
                throw new Error(`Failed to fetch projects: ${error instanceof Error ? error.message : String(error)}`);
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