import axios from "axios";
import * as cheerio from "cheerio";

/**
 * Extracts text content from a webpage.
 *
 * @param url The URL of the webpage to crawl.
 * @returns A promise that resolves to a string containing the crawled text content.
 */
export async function crawlWebpage(url: string): Promise<string> {
  try {
    // Fetch webpage content
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; WebCrawler/1.0)",
      },
      timeout: 10000,
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Remove scripts, styles, and other non-content elements
    $("script, style, nav, footer, header").remove();

    // Extract text from body, normalize whitespace
    const text = $("body").text().replace(/\s+/g, " ").trim();

    return text.length > 0 ? text : `No meaningful content found at ${url}`;
  } catch (error) {
    console.error(`Error crawling ${url}:`, error);
    return `Failed to crawl content from ${url}.`;
  }
}
