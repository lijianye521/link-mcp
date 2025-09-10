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
            description: "Save conversation summary or important information to Cursor memory files. IMPORTANT: The model should first summarize the conversation or information into a well-formatted document before calling this tool. The content should be properly structured with markdown formatting for better readability.",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Clear, descriptive title for the memory entry (e.g., 'React Hooks 学习总结', 'API 设计讨论摘要')",
                },
                content: {
                  type: "string",
                  description: "Well-formatted and summarized content in markdown format. Should include: main points, key insights, code examples (if any), decisions made, and actionable items. The model should process and structure the information before saving.",
                },
                category: {
                  type: "string",
                  description: "Category for organization: 'conversation' (对话记录), 'documentation' (技术文档), 'code-patterns' (代码模式), 'project-notes' (项目笔记)",
                  default: "conversation"
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Relevant tags for better searchability (e.g., ['react', 'hooks'], ['api', 'design'], ['meeting', 'decisions'])",
                  default: []
                }
              },
              required: ["title", "content"],
            },
          },
          {
            name: "get_cursor_memories",
            description: "Retrieve saved Cursor memories by category or tag",
            inputSchema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Filter by category",
                },
                tag: {
                  type: "string",
                  description: "Filter by tag",
                },
                limit: {
                  type: "number",
                  description: "Maximum number of memories to return",
                  default: 10
                }
              },
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

          case "get_cursor_memories":
            return await this.memoryTool.getMemories(args as any);

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