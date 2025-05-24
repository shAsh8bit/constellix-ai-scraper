# Constellix AI Scraper

An open-source web automation and scraping library powered by LLM. Interact with and extract data from websites using natural or structured queries — streamline automation without writing complex code.

## Live 
Try playground → [https://constellix.vercel.app/](https://constellix.vercel.app/)



## Installation

```bash
npm i @constellix/ai-scraper
```

## Prerequisites

You'll need a Gemini API key from Google. Get one from [https://ai.google.dev/gemini-api/docs/api-key](https://ai.google.dev/gemini-api/docs/api-key)

## Usage

```typescript
import { setup, wrapper } from '@constellix/ai-scraper';
import { chromium } from 'playwright';

// Setup with your Gemini API key
setup('your-gemini-api-key');

async function run() {
  const browser = await chromium.launch();
  
  // Wrap your Playwright page to make it LLM-friendly
  const page = await wrapper(await browser.newPage());
  await page.goto('https://example.com');
  
  // Find elements using natural language
  const loginButton = await page.getElementsByQuery("Find the login button");
  await loginButton.click();

  //Automate logging using credentials
  const loginFormQuery = `{
    username_input_field,
    password_input_field,
    submit_btn
  }`
  const form = await page.getElementsByQuery(loginFormQuery);
  await form.username_input_field.fill("shashank");
  await form.password_input_field.fill("123@s&$NND");
  await form.submit_btn.click();
  
  // Extract structured data
  const productsQuery = `{
    products[] {
      name,
      price,
      description
    }
  }`;
  const products = await page.getDataByQuery(productsQuery);
  console.log(products);
  
  // Get CSS paths or XPaths
  const cssPath = await page.getCssPathByQuery("Find the search box");
  const xpath = await page.getXPathByQuery("Find the submit button");
  
  await browser.close();
}

run().catch(console.error);
```

## Features

- Automate user actions using AI
- Extract structured data from web pages
- Query HTML elements using natural language
- Get CSS selectors or XPaths for elements
- Compatible with Playwright and Puppeteer

## Examples
[Playwright Examples](https://github.com/shAsh8bit/constellixai-examples/tree/main/examples/playwright)

[Puppeteer Examples](https://github.com/shAsh8bit/constellixai-examples/tree/main/examples/puppeteer)
## License

MIT
