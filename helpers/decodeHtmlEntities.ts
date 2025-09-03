import * as cheerio from "cheerio";

/**
 * Decodes HTML entities in a string using Cheerio's built-in decoding
 * This converts entities like &amp; back to & and &lt; back to <
 */
export const decodeHtmlEntities = (str: string): string => {
  // Create a temporary Cheerio instance with the string wrapped in a div
  // This allows us to leverage Cheerio's built-in HTML entity decoding
  const $ = cheerio.load(`<div>${str}</div>`);
  return $("div").text();
};
