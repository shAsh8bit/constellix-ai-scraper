import type { Page } from 'playwright';
import { minify } from 'html-minifier-terser';
import TurndownService from 'turndown';

export class HtmlProcessor {

  static async  processIframes(page: any): Promise<void> {
    const iframeHandles = await page.$$('iframe');
  
    for (let i = 0; i < iframeHandles.length; i++) {
      const iframeHandle = iframeHandles[i];
      const frame = await iframeHandle.contentFrame?.();
  
      if (frame) {
        await frame.evaluate(() => {
          return new Promise<void>((resolve) => {
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              resolve();
            } else {
              window.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
            }
          });
        });
  
        const frameContent = await frame.evaluate(() => {
          document.querySelectorAll('script, style, svg').forEach(el => el.remove());
          document.querySelectorAll('a[href^="data:"]').forEach(link => link.removeAttribute('href'));
          return document.body?.innerHTML || '';
        });
  
        await page.evaluate(({ index, content }: any) => {
          const iframe = document.querySelectorAll('iframe')[index];
          if (!iframe) return;
  
          const container = document.createElement('div');
          container.setAttribute('data-was-iframe', 'true');
          container.innerHTML = content;
  
          iframe.parentNode?.replaceChild(container, iframe);
        }, { index: i, content: frameContent });
      }
    }
  }
  

  static async processPageWithInlinedIframes(page: Page): Promise<{ replacedHtml: string, dictString: string }> {
    await this.processIframes(page);

    const bodyHandle = await page.$('body');
    if (!bodyHandle) return { replacedHtml: '', dictString: '' };
    
    const html = await page.evaluate(body => {
      const scripts = body.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      
      const svgs = body.querySelectorAll('svg');
      svgs.forEach(svg => svg.remove());

      const styles = body.querySelectorAll('style');
      styles.forEach(style => style.remove());
      
      const base64Links = body.querySelectorAll('a[href^="data:"]');
      base64Links.forEach(link => link.removeAttribute('href'));
      
      const generateShashId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < 3; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      };

      const elements = body.querySelectorAll('*');
      elements.forEach(element => {
        const className = element.getAttribute('class');
        const id = element.getAttribute('id');
        const href = element.getAttribute('href');
        
        if (href && href.startsWith('data:')) {
          element.removeAttribute('href');
        }
        
        element.attributes.length && [...element.attributes].forEach(attr => element.removeAttribute(attr.name));
        if (className) element.setAttribute('class', className);
        if (id) element.setAttribute('id', id);
        if (href && !href.startsWith('data:')) element.setAttribute('href', href);

        element.setAttribute('shashid', generateShashId());
      });
      
      return body.innerHTML;
    }, bodyHandle);

    const minified = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      minifyJS: true,
      minifyCSS: true
    });

    const matches = minified.match(/<[^>]+>/g) || [];
    const dict: Record<string, string> = {};
    let idCounter = 1;
    matches.forEach(tag => {
      let dictKey;
      if (/^<\//.test(tag)) {
        dictKey = tag;
      } else {
        dictKey = tag.replace(/\s+shashid="[^"]*"/g, '');
      }
      if (!dict[dictKey]) {
        dict[dictKey] = `t${idCounter++}`;
      }
    });

    let replacedHtml = minified.replace(/<[^>]+>/g, tag => {
      let dictKey;
      if (/^<\//.test(tag)) {
        dictKey = tag;
        const tagId = dict[dictKey] || 'tX';
        return `${tagId}`;
      } else {
        dictKey = tag.replace(/\s+shashid="[^"]*"/g, '');
        const tagId = dict[dictKey] || 'tX';
        const shashidMatch = tag.match(/\s+shashid="([^"]*)"/);
        const shashid = shashidMatch ? shashidMatch[1] : '';
        return `${tagId}(${shashid})`;
      }
    });

    const dictString = Object.entries(dict)
      .map(([tag, id]) => `${id}: ${tag}`)
      .join('\n');

    return { replacedHtml, dictString };
  }

  static async extractStructuredMarkdown(page: Page): Promise<string> {
    const htmlContent = await page.evaluate(async () => {
      async function inlineIframes(doc: Document): Promise<void> {
        const iframes = Array.from(doc.querySelectorAll('iframe')) as HTMLIFrameElement[];

        await Promise.all(iframes.map(async (iframe: HTMLIFrameElement) => {
          try {
            const iframeDoc = iframe.contentDocument;
            if (!iframeDoc) return;

            iframeDoc.querySelectorAll('script,style').forEach(el => el.remove());
            await inlineIframes(iframeDoc);
            const wrapper = document.createElement('div');
            wrapper.innerHTML = iframeDoc.body?.innerHTML || '';
            iframe.replaceWith(wrapper);
          } catch (err) {
            console.error('Cross-origin iframe, skipping:', err);
            return;
          }
        }));
      }

      document.body.querySelectorAll('script,style').forEach(el => el.remove());

      const base64Links = document.querySelectorAll('a[href^="data:"]');
      base64Links.forEach(link => link.removeAttribute('href'));

      await inlineIframes(document);

      return document.body.outerHTML;
    });

    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    let markdown = turndownService.turndown(htmlContent);
    markdown = markdown.replace(/\n{2,}/g, '\n');

    return markdown;
  }
}
