import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppitierExtra = require('puppeteer-extra');

puppitierExtra.use(StealthPlugin());

@Injectable()
export class AppService {
  constructor() {}

  async getAllGenres() {
    const browser = await puppeteer.launch();
    const url = 'https://www.goodreads.com/choiceawards/best-books-2020';
    const page = await browser.newPage();
    await page.goto(url);

    const allGenres = await page.$$eval('.category__copy', (e) =>
      e.map((a: any) => a.innerText),
    );
    await browser.close();

    return allGenres;
  }

  async getBestBook(genre: string) {
    const browser = await puppeteer.launch();
    const url = `https://www.goodreads.com/choiceawards/best-${genre.toLowerCase()}-books-2020`;
    const page = await browser.newPage();
    await page.goto(url);

    const bookName = await page.$eval('.winningTitle', (e: any) => e.innerText);
    await browser.close();

    return bookName;
  }

  async getCheckoutScreenOfBook(bookName: string) {
    console.log('bookName :>> ', bookName);

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--start-maximized'],
      defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto('https://www.amazon.com');

    const loginOnAmazon = async () => {
      // login ----------------------
      await page.waitForSelector('[data-nav-role="signin"]');
      await page.click(`[data-nav-role="signin"]`);

      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'roma@redberry.ge');

      await page.waitForSelector('#continue');
      await page.click('#continue');

      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      await page.waitForSelector('input[type="password"]');
      await page.type('input[type="password"]', 'roma2021');

      await page.waitForSelector('#signInSubmit');
      await page.click('#signInSubmit');

      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      // ----------------------------------
    };

    const searchProductAndNavigate = async () => {
      await await Promise.all([
        page.waitForSelector('#twotabsearchtextbox'),
        page.waitForSelector('#nav-search-submit-button'),
      ]);

      await page.type('#twotabsearchtextbox', bookName);

      await Promise.all([
        page.click('#nav-search-submit-button'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ]);

      await page.waitForSelector('[data-index] h2 a');

      const linkOfBook = await await page.$eval(
        '[data-index] h2 a',
        (e: any) => e.href,
      );
      console.log('linkOfBook :>> ', linkOfBook);

      await page.goto(linkOfBook, { waitUntil: 'networkidle0' });
    };

    await loginOnAmazon();
    await searchProductAndNavigate();

    await page.waitForSelector('li.swatchElement span a');

    const options = await page.$$eval('li.swatchElement span a', (e) =>
      e.map((e: any) => {
        return { href: e.href, text: e.firstElementChild.innerText };
      }),
    );
    console.log('options :>> ', options);

    const item = options.find((obj) => obj.text === 'Hardcover');

    if (item.href === 'javascript:void(0)') {
    } else {
      await page.goto(item.href, { waitUntil: 'networkidle0' });
    }
    await page.waitForSelector('#add-to-cart-button');
    await page.click('#add-to-cart-button');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    try {
      await page.waitForSelector('input[name="proceedToRetailCheckout"]');
      await page.click('input[name="proceedToRetailCheckout"]');
    } catch (error) {
      console.log('error :>> ', error);
      await page.waitForSelector('#hlb-ptc-btn-native');
      await page.click('#hlb-ptc-btn-native');
    }
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const pic = await page.screenshot({ path: 'checkout.jpg', fullPage: true });
    console.log('pic :>> ', pic);
    await browser.close();
    return pic;
  }
}
