import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

interface DocumentationResult {
  url: string;
  title: string;
  content: string;
  components: string[];
  apis: string[];
  examples: string[];
  links: string[];
}

interface FetchDocumentationArgs {
  url: string;
  selector?: string;
  depth?: number;
}

export class LinkDocumentationTool {
  private visitedUrls = new Set<string>();

  async fetchDocumentation(args: FetchDocumentationArgs) {
    this.visitedUrls.clear();

    try {
      const result = await this.crawlPage(args.url, args.selector || 'body', args.depth || 1);
      
      return {
        content: [
          {
            type: "text",
            text: this.formatDocumentationResult(result),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch documentation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async crawlPage(url: string, selector: string, depth: number): Promise<DocumentationResult> {
    if (this.visitedUrls.has(url) || depth < 0) {
      return this.createEmptyResult(url);
    }

    this.visitedUrls.add(url);

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const selectedContent = $(selector);

      const result: DocumentationResult = {
        url,
        title: $('title').text().trim() || $('h1').first().text().trim() || 'Untitled',
        content: this.extractTextContent(selectedContent),
        components: this.extractComponents($),
        apis: this.extractAPIs($),
        examples: this.extractExamples($),
        links: this.extractLinks($, url),
      };

      // 如果depth > 0，继续爬取相关链接
      if (depth > 0) {
        const relatedLinks = result.links
          .filter(link => this.isRelevantLink(link))
          .slice(0, 5); // 限制每页最多5个链接

        for (const link of relatedLinks) {
          const subResult = await this.crawlPage(link, selector, depth - 1);
          result.content += `\n\n--- Linked Page: ${subResult.title} ---\n${subResult.content}`;
          result.components.push(...subResult.components);
          result.apis.push(...subResult.apis);
          result.examples.push(...subResult.examples);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
      return this.createEmptyResult(url);
    }
  }

  private extractTextContent(element: any): string {
    // 移除script和style标签
    element.find('script, style').remove();
    
    // 提取文本内容，保持一定的结构
    let content = '';
    
    element.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const $el = cheerio.load(el);
      content += `\n## ${$el.text().trim()}\n`;
    });
    
    element.find('p, div, li').each((_, el) => {
      const $el = cheerio.load(el);
      const text = $el.text().trim();
      if (text && text.length > 10) {
        content += `${text}\n`;
      }
    });

    return content.trim();
  }

  private extractComponents($: any): string[] {
    const components: string[] = [];
    
    // 查找组件相关的关键词
    const componentPatterns = [
      /component[s]?/gi,
      /widget[s]?/gi,
      /<[A-Z][a-zA-Z]*/g, // React/Vue组件模式
      /class="[^"]*component[^"]*"/gi,
      /data-component/gi
    ];

    const text = $.html();
    componentPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        components.push(...matches.map(m => m.trim()).filter(m => m.length > 0));
      }
    });

    // 查找特定的组件名称
    $('[class*="component"], [data-component], .btn, .button, .card, .modal, .dropdown').each((_, el) => {
      const className = $(el).attr('class');
      const dataComponent = $(el).attr('data-component');
      
      if (className) {
        components.push(`Class: ${className}`);
      }
      if (dataComponent) {
        components.push(`Component: ${dataComponent}`);
      }
    });

    return [...new Set(components)].slice(0, 20); // 去重并限制数量
  }

  private extractAPIs($: any): string[] {
    const apis: string[] = [];
    
    // 查找API相关内容
    $('code, pre, .api, .method, .function').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 200) {
        // 查找函数调用模式
        const functionMatches = text.match(/\w+\([^)]*\)/g);
        if (functionMatches) {
          apis.push(...functionMatches);
        }
        
        // 查找属性模式
        const propMatches = text.match(/\w+:\s*\w+/g);
        if (propMatches) {
          apis.push(...propMatches);
        }
      }
    });

    // 查找表格中的API信息
    $('table tr').each((_, row) => {
      const cells = $(row).find('td, th');
      if (cells.length >= 2) {
        const apiName = cells.eq(0).text().trim();
        const apiDesc = cells.eq(1).text().trim();
        if (apiName && apiDesc && apiName.length < 50) {
          apis.push(`${apiName}: ${apiDesc.substring(0, 100)}`);
        }
      }
    });

    return [...new Set(apis)].slice(0, 30);
  }

  private extractExamples($: any): string[] {
    const examples: string[] = [];
    
    // 查找代码示例
    $('pre code, .example, .demo, .code-block').each((_, el) => {
      const code = $(el).text().trim();
      if (code && code.length > 10 && code.length < 1000) {
        examples.push(code);
      }
    });

    // 查找内联代码
    $('code').each((_, el) => {
      const code = $(el).text().trim();
      if (code && code.length > 5 && code.length < 200 && code.includes('(')) {
        examples.push(code);
      }
    });

    return [...new Set(examples)].slice(0, 15);
  }

  private extractLinks($: any, baseUrl: string): string[] {
    const links: string[] = [];
    const base = new URL(baseUrl);
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          if (absoluteUrl.startsWith(base.origin)) {
            links.push(absoluteUrl);
          }
        } catch {
          // 忽略无效链接
        }
      }
    });

    return [...new Set(links)];
  }

  private isRelevantLink(link: string): boolean {
    const relevantKeywords = [
      'component', 'api', 'doc', 'guide', 'tutorial', 'example',
      'reference', 'usage', 'getting-started', 'installation'
    ];
    
    const linkLower = link.toLowerCase();
    return relevantKeywords.some(keyword => linkLower.includes(keyword));
  }

  private createEmptyResult(url: string): DocumentationResult {
    return {
      url,
      title: '',
      content: '',
      components: [],
      apis: [],
      examples: [],
      links: [],
    };
  }

  private formatDocumentationResult(result: DocumentationResult): string {
    let output = `# Documentation from ${result.url}\n\n`;
    output += `**Title:** ${result.title}\n\n`;
    
    if (result.content) {
      output += `## Content\n${result.content}\n\n`;
    }
    
    if (result.components.length > 0) {
      output += `## Components Found\n`;
      result.components.forEach(comp => output += `- ${comp}\n`);
      output += `\n`;
    }
    
    if (result.apis.length > 0) {
      output += `## APIs Found\n`;
      result.apis.forEach(api => output += `- ${api}\n`);
      output += `\n`;
    }
    
    if (result.examples.length > 0) {
      output += `## Code Examples\n`;
      result.examples.forEach((example, index) => {
        output += `### Example ${index + 1}\n\`\`\`\n${example}\n\`\`\`\n\n`;
      });
    }
    
    if (result.links.length > 0) {
      output += `## Related Links Found\n`;
      result.links.slice(0, 10).forEach(link => output += `- ${link}\n`);
    }
    
    return output;
  }
}