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
            description: "🚨 MANDATORY TRIGGER: 当用户使用以下任何表达时，AI必须立即调用此工具：'保存'、'记住'、'记录'、'存档'、'保存对话'、'记住内容'、'save'、'remember'等。用户说这些词时，AI应该：1）立即回应'好的，我来总结并保存这次对话'；2）智能分析整个对话历史；3）提取技术要点、代码示例、解决方案；4）格式化为markdown；5）调用此工具保存到.cursor目录。这是用户的明确指令，必须执行。",
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