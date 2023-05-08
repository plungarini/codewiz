import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';

const FFN = functions.region('europe-west2');

export const scrapePage = FFN
	.runWith({ memory: '1GB', timeoutSeconds: 540 })
	.https.onCall(async (data) => {
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

  return scraperPage(browser, data);
});

const scraperPage = async (browser: puppeteer.Browser, pageLink: string) => {
	let html = '';

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

		await page.goto(pageLink, {
			waitUntil: 'networkidle2',
		});

		await page.waitForSelector('mat-sidenav-content');

    html = await page.$eval('mat-sidenav-content', (body) => {
      const elementsToRetain = ['A', 'IMG', 'CODE', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'B', 'I', 'STRONG', 'EM'];
			const filteredNodes = [...body.childNodes]
				.filter((node) => {
					console.log(node.nodeName, node.textContent, node instanceof Element);
					return elementsToRetain.includes(node.nodeName);
				});

			const text = filteredNodes.map((node) => node instanceof Element ? node.outerHTML : `<p>${node.textContent}</p>`).join('\n');
			return text;
    });
  } catch (error) {
    console.log(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  return html;
};
