import type { Page, ElementHandle } from 'playwright';
import {xPath, cssPath} from 'playwright-dompath/dist/DOMPath.js'

type ElementResult = ElementHandle<HTMLElement | SVGElement> | null;

/**
 * Utility class for resolving element IDs to actual ElementHandles
 */
export class ElementResolver {
  /**
   * Recursively resolves string IDs in an object structure to actual ElementHandles
   */
  static async resolveIdsToElements(
    data: any, 
    page: Page
  ): Promise<any> {
    if (Array.isArray(data)) {
      const resolvedArray: (ElementResult | any)[] = [];
      for (const item of data) {
        if (typeof item === 'string') {
          resolvedArray.push(await page.$(`[shashid="${item}"]`));
        } else {
          resolvedArray.push(await this.resolveIdsToElements(item, page));
        }
      }
      return resolvedArray;
    } 
    else if (typeof data === 'object' && data !== null) {
      const resolvedObject: Record<string, ElementResult | any> = {};
      for (const key in data) {
        const value = data[key];
        if (typeof value === 'string') {
          resolvedObject[key] = await page.$(`[shashid="${value}"]`);
        } else {
          resolvedObject[key] = await this.resolveIdsToElements(value, page);
        }
      }
      return resolvedObject;
    } 
    else {
      return data;
    }
  }

  static async getCssPathFromElements(
    data: any, 
    page: any
  ): Promise<any> {
    if (Array.isArray(data)) {
      const resolvedArray: (ElementResult | any)[] = [];
      for (const item of data) {
        if (typeof item === 'string') {
          resolvedArray.push(await cssPath(await page.$(`[shashid="${item}"]`)));
        } else {
          resolvedArray.push(await this.getCssPathFromElements(item, page));
        }
      }
      return resolvedArray;
    } 
    else if (typeof data === 'object' && data !== null) {
      const resolvedObject: Record<string, ElementResult | any> = {};
      for (const key in data) {
        const value = data[key];
        if (typeof value === 'string') {
          resolvedObject[key] = await cssPath(await page.$(`[shashid="${value}"]`));
        } else {
          resolvedObject[key] = await this.getCssPathFromElements(value, page);
        }
      }
      return resolvedObject;
    } 
    else {
      return data;
    }
  }

  static async getXPathFromElements(
    data: any, 
    page: any
  ): Promise<any> {
    if (Array.isArray(data)) {
      const resolvedArray: (ElementResult | any)[] = [];
      for (const item of data) {
        if (typeof item === 'string') {
          resolvedArray.push(await xPath(await page.$(`[shashid="${item}"]`)));
        } else {
          resolvedArray.push(await this.getXPathFromElements(item, page));
        }
      }
      return resolvedArray;
    } 
    else if (typeof data === 'object' && data !== null) {
      const resolvedObject: Record<string, ElementResult | any> = {};
      for (const key in data) {
        const value = data[key];
        if (typeof value === 'string') {
          resolvedObject[key] = await xPath(await page.$(`[shashid="${value}"]`));
        } else {
          resolvedObject[key] = await this.getXPathFromElements(value, page);
        }
      }
      return resolvedObject;
    } 
    else {
      return data;
    }
  }
  
}