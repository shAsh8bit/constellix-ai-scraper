export interface ScraperPromptParams {
  content: string;
  query: string;
}

export class ScraperPrompt {
  static elementQuery({ content, query }: ScraperPromptParams): string {
    return `
You are an expert web scraper assistant. I'll provide you with minified HTML content and a query.
Based on the query, extract the relevant <Element_id> from the minified HTML and return the data in JSON format based on the <Element_Extraction_rules>.

HTML Content:
${content}

Query: 
${query}


<Element_id> 
These are unique IDs present in the minified HTML inside () brackets after each tag.
for example:
t123(eb4) eb4 is the unique ID for the element.
</Element_id> 

<Element_Extraction_rules>
The Query can be of two type [Natural, Structured] , natural query is a human readable query <Natural Query Example> and structured query is a query in GraphQL like predefined format <Structured Query Example>.

<Natural Query Example>
- Suppose the user want list of any items from the page, the query can be like this:
  "List all the products on the page"
  for this you must return the list of items in Json format, create a relevant json key-value pairs based on the query.

  !Strictly return the data in Json format only, you are free to decide the key names based on the natural language query , the values should always be the <Element_id> or empty string.
</Natural Query Example>


<Structured Query Example>
- Suppose the user want list of any items from the page, the query can be like this:
  {
    products_list[]{
      product_name,
      product_price,
      product_image,
    }
  } 
  for this you must return the list of items in the same Json format as the query.
Like this: 
  {
    products_list: [
      {
        product_name: "3r2",
        product_price: "23s",
        product_image: "if4"
      },
      {
        product_name: "4r3",
        product_price: "f43",
        product_image: "5r2"
      }
    ]
  }
- User can explicitly specify the data type or define using natural language inside () brackets.
For example:
  {
    products_list[]{
      product_name (string),
      product_price (number),
      product_image (string),
    }
  } 
  or
  {
    products_list (products made out of cotton)[]{
      product_name,
      product_price,
      product_image,
    }
  }
 - User may just want a single object of element, in that case the query can be like this:
  {
    form_data{
      form_name,
      form_submit_button,
    }
  } 
  for this you must return something like this:
  {
    form_data: {
      form_name: "2b3",
      form_submit_button: "4n5"
    }
  }
- User may just want the list of elements, in that case the query can be like this:
  {
    nav_items[]
  } 
  for this you must return something like this:
  {
    nav_items: [
      "hy7",
      "h7t",
      "hy7"
    ]
  }
 
  ! Strictly return the data in the same format as the query and only the key that are present in the query.
    Do not create any new key other than keys present in the query.
    If for certain key the data is not present in the HTML, then return "" empty string for that key.
</Structured Query Example>
</Element_Extraction_rules>

Return the data in JSON format only, do not add any other text or explanation.

    `.trim();
  }

  static dataQuery({ content, query }: ScraperPromptParams): string {
    return `
You are an expert web scraper assistant. I'll provide you with html page markdown content and a query.
Based on the query, extract the relevant data from the page and return the data in JSON format based on the <Data_Extraction_rules>.

Markdown Content:
${content}

Query: 
${query}

<Data_Extraction_rules>
The Query can be of two type [Natural, Structured] , natural query is a human readable query <Natural Query Example> and structured query is a query in GraphQL like predefined format <Structured Query Example>.

<Natural Query Example>
- Suppose the user want list of any items from the page, the query can be like this:
  "List all the products on the page"
  for this you must return the list of items in Json format, create a relevant json key-value pairs based on the query.

  !Strictly return the data in Json format only, you are free to decide the key names based on the natural language query , the values should always be the data or empty string.
</Natural Query Example>

<Structured Query Example>
- Suppose the user want list of any items from the page, the query can be like this:
  {
    products_list[]{
      product_name,
      product_price,
      product_image,
    }
  }
  for this you must return the list of items in the same Json format as the query.
Like this: 
  {
    products_list: [
      {
        product_name: "Product 1",
        product_price: "$10",
        product_image: "image1.jpg"
      },
      {
        product_name: "Product 2",
        product_price: "$20",
        product_image: "image2.jpg"
      }
    ]
  }
- User can explicitly specify the data type or define using natural language inside () brackets.
For example:
  {
    products_list[]{
      product_name (string),
      product_price (number),
      product_image (string),
    }
  }
  or
  {
    products_list (products made out of cotton)[]{
      product_name,
      product_price,
      product_image,
    }
  }
 for this you must return something like this:
  {
    products_list: [
      {
        product_name: "Product 1",
        product_price: 10,
        product_image: "image1.jpg"
      },
      {
        product_name: "Product 2",
        product_price: 20,
        product_image: "image2.jpg"
      }
    ]
  }
  - User may just want the list of elements, in that case the query can be like this:
  {
    nav_items[]
  }
  for this you must return something like this:
  {
    nav_items: [
      "Home",
      "Products",
      "Contact"
    ]
  }
  ! Strictly return the data in the same format as the query and only the key that are present in the query.
    Do not create any new key other than keys present in the query.
    If for certain key the data is not present in the makrdown, then return "" empty string for that key.
</Structured Query Example>
</Data_Extraction_rules>

Return the data in JSON format only, do not add any other text or explanation
`.trim();
  }
}