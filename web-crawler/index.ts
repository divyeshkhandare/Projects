import axios from "axios";
import * as cheerio from "cheerio";
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
});

const url = "https://en.wikipedia.org/wiki/Ajit_Doval";

async function getAllLinks(url: string) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const $ = cheerio.load(data);

  const pageHead = $('head').html();
  const pageBody = $('body').html();

  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (href === url) return;
    if (href && href.startsWith("#")) return;
    if (href?.startsWith("https") || href?.startsWith("http")) {
      externalLinks.push(href);
    } else {
      internalLinks.push(href as string);
    }
  });

  return {internalLinks, externalLinks, pageHead, pageBody }

}

Bun.serve({
  port: 3000,
  async fetch() {
    const links = await getAllLinks(url);

    return new Response(JSON.stringify(links, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  },
});

console.log("Server running on http://localhost:3000");
