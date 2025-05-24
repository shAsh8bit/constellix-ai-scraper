import type { Page } from 'playwright';
import { HtmlProcessor } from './HtmlProcessor';
import { GeminiLLM } from './llm/geminiLLM';
import { JsonExtractor, ElementResolver } from './utils/index';

type LLMEnhancedPage = Page & {
  getElementsByQuery: (query: string) => Promise<any>,
  getDataByQuery: (query: string) => Promise<any>,
  getCssPathByQuery: (query: string) => Promise<any>,
  getXPathByQuery: (query: string) => Promise<any>,
}

let globalGeminiLLM: GeminiLLM | null = null;

/**
 * Sets up the LLM service for page querying.
 * Note: Currently only supports Gemini.
 * @param apiKey Gemini API key - Get one from https://ai.google.dev/gemini-api/docs/api-key
 */
export function setup(apiKey: string): void {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  globalGeminiLLM = new GeminiLLM(apiKey);
}

/**
 * @example
 * // First set up the LLM with your API key
 * setup('your-gemini-api-key');
 * 
 * // Then wrap your page to make it LLM-friendly
 * const page = await wrapper(await browser.newPage());
 * await page.goto('https://example.com');
 */
export async function wrapper(page: any): Promise<LLMEnhancedPage> {
  
  if (!globalGeminiLLM) {
    throw new Error('Gemini API has not been set up. Call setup() with your API key first.');
  }
  
  const llm = globalGeminiLLM;
  const enhancedPage = page as LLMEnhancedPage;
  
  /**
   * Finds HTML elements on the page using natural language or structured queries.
   * 
   * @param query A natural language query or structured query to describe what you need.
   * @returns Promise resolving to matched elements
   * @example
   * // Find a specific button
   * const loginButton = await page.getElementsByQuery("Find the login button");
   * await loginButton.click();
   * // Automate form filling
   * const formQuery = `{
   *   form_enter_name,
   *   form_enter_email,
   *   form_submit_button
   * }`
   * const result = await page.getElementsByQuery(query);
   */
  enhancedPage.getElementsByQuery = async function(query: string) {
    const { replacedHtml, dictString } = await HtmlProcessor.processPageWithInlinedIframes(page);
    const pageStructure = `<!-- Tag Dictionary -->\n${dictString}\n\n<!-- Minified HTML -->\n${replacedHtml}`;
    const llmOutput = await llm.processQuery(pageStructure, query, 'Element');
    const jsonLlmResult = JsonExtractor.extractJson(llmOutput);
    const jsonElementResult = await ElementResolver.resolveIdsToElements(jsonLlmResult, page);
    return jsonElementResult;
  };

  /**
   * Extracts data from the page using natural language or structured queries.
   * 
   * @param query A natural language query or structured query to describe what you need.
   * @returns Promise resolving to extracted data
   * @example
   * // Extract products from an ecommerce page
   * const productsQuery = `{
   *   products[] {
   *     name,
   *     price,
   *     description
   *   }
   * }`;
   * const products = await page.getDataByQuery(productsQuery);
   * 
   */
  enhancedPage.getDataByQuery = async function(query: string) {
    const markdown = await HtmlProcessor.extractStructuredMarkdown(page);
    const llmOutput = await llm.processQuery(markdown, query, 'Data');
    const jsonLlmResult = JsonExtractor.extractJson(llmOutput);
    return jsonLlmResult;
  };

/**
 * Extracts CSS paths from the page using natural language or structured queries.
 * 
 * @param query A natural language query or structured query to describe what you need.
 * @returns Promise resolving to CSS paths of matched elements
 */
  enhancedPage.getCssPathByQuery = async function(query: string) {
    const { replacedHtml, dictString } = await HtmlProcessor.processPageWithInlinedIframes(page);
    const pageStructure = `<!-- Tag Dictionary -->\n${dictString}\n\n<!-- Minified HTML -->\n${replacedHtml}`;
    const llmOutput = await llm.processQuery(pageStructure, query, 'Element');
    const jsonLlmResult = JsonExtractor.extractJson(llmOutput);
    const jsonCssPathResult = await ElementResolver.getCssPathFromElements(jsonLlmResult, page);
    return jsonCssPathResult;
  }

  /**
   * Extracts XPath from the page using natural language or structured queries.
   *  
   * @param query A natural language query or structured query to describe what you need.
   * @returns Promise resolving to XPath of matched elements
   * 
   */
  enhancedPage.getXPathByQuery = async function(query: string) {
    const { replacedHtml, dictString } = await HtmlProcessor.processPageWithInlinedIframes(page);
    const pageStructure = `<!-- Tag Dictionary -->\n${dictString}\n\n<!-- Minified HTML -->\n${replacedHtml}`;
    const llmOutput = await llm.processQuery(pageStructure, query, 'Element');
    const jsonLlmResult = JsonExtractor.extractJson(llmOutput);
    const jsonCssPathResult = await ElementResolver.getXPathFromElements(jsonLlmResult, page);
    return jsonCssPathResult;
  }

  return enhancedPage;
}
