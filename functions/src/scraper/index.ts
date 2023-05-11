import { warn } from 'firebase-functions/logger';
import * as puppeteer from 'puppeteer';
import * as Turndown from 'turndown';

export const scrapeDocumentedPage = async (data: {
  page_link: string;
  body_selector: string;
  excluded_selectors: string[];
}) => {
  warn('Starting scrape. Arguments:', data);

  const browser = await puppeteer.launch({
    headless: true,
    timeout: 20000,
    ignoreHTTPSErrors: true,
    slowMo: 0,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-sandbox',
      '--no-zygote',
      '--window-size=1280,720',
    ],
  });

  let markdown = '';
  let pageTitle = '';
  let host = '';

  try {
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 720 });

    // Block images, videos, fonts from downloading
    await page.setRequestInterception(true);

    page.on('request', (interceptedRequest) => {
      const blockResources = ['stylesheet', 'font'];
      if (blockResources.includes(interceptedRequest.resourceType())) {
        interceptedRequest.abort();
      } else {
        interceptedRequest.continue();
      }
    });

    // Change the user agent of the scraper
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
    );

    await page.goto(data.page_link, {
      waitUntil: 'networkidle2',
    });

    await page.waitForSelector(data.body_selector);

    const scrape = await page.$eval(
      data.body_selector,
      (body, data) => {
        const excludedSelLen = data.excluded_selectors.length;
        for (let i = 0; i < excludedSelLen; i++) {
          const selector = data.excluded_selectors[i];
          const el = body.querySelector(selector);
          if (el) el.remove();
        }

        return { html: body.innerHTML, page_title: document.title, host: location.origin };
      },
      data
    );

    const converter = new Turndown({});
    markdown = converter.turndown(scrape.html).trim();
    pageTitle = scrape.page_title.trim();
    host = scrape.host.trim();

    // Regular expression to match relative links
    const relativeLinkRegex = /\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g;
    // Replace relative links with absolute links
    markdown = markdown.replace(relativeLinkRegex, `[$1](${host}/$2)`);
  } catch (error) {
    console.log(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  return { markdown, page_title: pageTitle };
};
