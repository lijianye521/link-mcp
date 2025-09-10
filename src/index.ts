#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { LinkDocumentationTool } from "./tools/linkDocumentationTool.js";

class LinkMCPServer {
  private server: Server;
  private linkTool: LinkDocumentationTool;

  constructor() {
    this.server = new Server(
      {
        name: "link-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.linkTool = new LinkDocumentationTool();
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "fetch_link_documentation",
            description: "Fetch and analyze documentation from a website link, extracting all available components, APIs, and usage examples",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "The URL to fetch documentation from (e.g., WindUI documentation)",
                },
                selector: {
                  type: "string",
                  description: "Optional CSS selector to focus on specific content",
                  default: "body"
                },
                depth: {
                  type: "number",
                  description: "How deep to crawl links (0-3, default: 1)",
                  default: 1
                }
              },
              required: ["url"],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "fetch_link_documentation":
            return await this.linkTool.fetchDocumentation(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error executing ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Link MCP Server started successfully");
  }
}

const server = new LinkMCPServer();
server.start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});