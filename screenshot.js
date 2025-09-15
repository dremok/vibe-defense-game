import { chromium } from 'playwright';

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'game-screenshot.png', fullPage: true });
    console.log('Screenshot saved as game-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();