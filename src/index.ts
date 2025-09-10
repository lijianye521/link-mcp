#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { LinkDocumentationTool } from "./tools/linkDocumentationTool.js";
import { CursorMemoryTool } from "./tools/cursorMemoryTool.js";

class LinkMCPServer {
  private server: Server;
  private linkTool: LinkDocumentationTool;
  private memoryTool: CursorMemoryTool;

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
    this.memoryTool = new CursorMemoryTool();
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
          {
            name: "save_cursor_memory",
            description: "当用户要求保存对话或重要信息时使用此工具。AI应该自动：1) 智能总结整个对话的核心内容、关键讨论点、代码示例和重要决策；2) 将总结格式化为结构化的markdown文档；3) 保存到当前工作区的.cursor目录。用户体验：用户只需说'保存这次对话'或'记住刚才讨论的内容'，AI就会自动完成分析、总结和保存全过程。",
            inputSchema: {
              type: "object",
              properties: {
                summary: {
                  type: "string",
                  description: "AI总结的完整对话内容，必须包含：对话主题概述、关键技术点、代码示例、解决方案、重要决策、待办事项等，使用清晰的markdown格式结构化展示"
                }
              },
              required: ["summary"],
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

          case "save_cursor_memory":
            return await this.memoryTool.saveMemory(args as any);

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