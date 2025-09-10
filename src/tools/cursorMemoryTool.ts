import * as fs from 'fs-extra';
import * as path from 'path';

interface CursorMemory {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface SaveMemoryArgs {
  summary: string;
}

export class CursorMemoryTool {
  private cursorDir: string;
  private memoriesFile: string;

  constructor() {
    // 在当前工作目录下创建.cursor目录
    this.cursorDir = path.join(process.cwd(), '.cursor');
    this.memoriesFile = path.join(this.cursorDir, 'memories.json');
    this.ensureCursorDirectory();
  }

  async saveMemory(args: SaveMemoryArgs) {
    try {
      const memories = await this.loadMemories();
      
      // 从AI总结中提取标题（取第一行或前50个字符作为标题）
      const summaryLines = args.summary.split('\n').filter(line => line.trim());
      const firstLine = summaryLines[0] || '';
      const autoTitle = firstLine
        .replace(/^#+\s*/, '')  // 移除markdown标题标记
        .replace(/\*\*|\*|__|_/g, '')  // 移除markdown格式标记
        .substring(0, 50)
        .trim() || `对话记录-${new Date().toLocaleDateString()}`;
      
      // 生成友好的文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const safeTitle = autoTitle
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')  // 支持中文
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 30);
      
      const filename = `${timestamp}_${safeTitle}.md`;
      const memoryId = this.generateId();
      
      const newMemory: CursorMemory = {
        id: memoryId,
        title: autoTitle,
        content: args.summary,
        category: 'conversation',
        tags: ['ai-generated', 'conversation'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      memories.push(newMemory);
      await this.saveMemories(memories);

      // 直接保存为markdown文件，不依赖旧方法
      await this.saveToWorkspace(filename, newMemory);

      // 返回成功信息
      const filePath = `.cursor/${filename}`;
      return {
        content: [
          {
            type: "text",
            text: `✅ **对话记忆已保存**\n\n📁 **文件位置：** \`${filePath}\`\n📝 **自动标题：** ${newMemory.title}\n⏰ **保存时间：** ${new Date().toLocaleString()}\n\n💡 **提示：** 这个对话总结已经保存到当前工作区的 .cursor 目录中，可以被 Cursor AI 访问和引用。`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to save memory: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async saveToWorkspace(filename: string, memory: CursorMemory): Promise<void> {
    const filepath = path.join(this.cursorDir, filename);
    
    const content = `# ${memory.title}

**创建时间：** ${new Date(memory.createdAt).toLocaleString()}
**记忆ID：** ${memory.id}

---

${memory.content}

---

*此文件由 Link MCP 自动生成，保存在工作区 .cursor 目录中供 Cursor AI 访问*
`;

    await fs.writeFile(filepath, content);
  }

  private async ensureCursorDirectory(): Promise<void> {
    await fs.ensureDir(this.cursorDir);
    
    // 创建.cursor/README.md说明文件
    const readmePath = path.join(this.cursorDir, 'README.md');
    if (!await fs.pathExists(readmePath)) {
      const readmeContent = `# Cursor 工作区记忆

此目录包含由 Link MCP 保存的对话记忆文件。

## 文件说明

- \`memories.json\` - 记忆索引文件
- \`*.md\` - 对话记忆的 Markdown 文件

## 使用说明

这些文件被设计为可供 Cursor AI 读取，用于在会话中提供上下文记忆。

## 工作流程

1. 用户说："保存这次对话"或"记住刚才的内容"
2. AI 自动总结对话的核心内容和关键点  
3. 总结被保存为格式化的 Markdown 文件
4. Cursor AI 可以在后续会话中访问这些记忆

---
*由 Link MCP 自动生成和管理*
`;
      await fs.writeFile(readmePath, readmeContent);
    }
  }

  private async loadMemories(): Promise<CursorMemory[]> {
    try {
      if (await fs.pathExists(this.memoriesFile)) {
        const data = await fs.readFile(this.memoriesFile, 'utf-8');
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading memories:', error);
      return [];
    }
  }

  private async saveMemories(memories: CursorMemory[]): Promise<void> {
    await fs.writeFile(this.memoriesFile, JSON.stringify(memories, null, 2));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}