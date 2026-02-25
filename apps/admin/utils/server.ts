import type { Browser } from 'puppeteer-core';
import 'server-only';

export async function resolvePuppeteerBrowser(): Promise<Browser> {
  if (process.env.NODE_ENV === 'development') {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    return browser as unknown as Browser;
  }

  const chromium = (await import('@sparticuz/chromium')).default;
  const puppeteer = await import('puppeteer-core');
  const launchOptions = {
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  };
  const browser = await puppeteer.launch(launchOptions);
  return browser;
}
