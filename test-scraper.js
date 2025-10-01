const { scrapeDanishFarms } = require('./lib/scraper');

async function testScraper() {
  console.log('Testing scraper...');
  try {
    const companies = await scrapeDanishFarms();
    console.log('Scraped companies:', companies);
  } catch (error) {
    console.error('Error testing scraper:', error);
  }
}

testScraper();
