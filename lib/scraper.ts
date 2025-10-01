import puppeteer from 'puppeteer';

export interface FarmCompany {
  name: string;
  description: string;
  email: string | null;
  phone: string | null;
  url: string;
}

export async function scrapeDanishFarms(): Promise<FarmCompany[]> {
  let browser;
  
  try {
    // Launch browser with more robust settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Search for Danish farms on krak.dk
    const searchUrl = 'https://www.krak.dk/s%C3%B8g/landbrug';
    console.log('Starting scrape for Danish farms from:', searchUrl);
    
    // Navigate to the page
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for content to load
    await page.waitForSelector('body', { timeout: 10000 });

    // Get the page content
    const htmlContent = await page.content();
    
    // Simple regex to find company links - this is a basic approach
    // In a production environment, you'd want to use a more sophisticated parser
    let companies: any[] = [];
    const companyRegex = /<a[^>]*href="([^"]*virksomhed[^"]*)"[^>]*>([^<]+)<\/a>/g;
    let match;
    
    while ((match = companyRegex.exec(htmlContent)) !== null) {
      const url = match[1];
      const name = match[2].trim();
      
      if (name && url && !url.includes('javascript:')) {
        companies.push({
          name: name,
          url: url.startsWith('http') ? url : `https://www.krak.dk${url}`,
          description: 'Danish farm/agriculture company',
          email: null,
          phone: null
        });
      }
    }
    
    console.log(`Found ${companies.length} companies in initial scrape`);
    
    // If we didn't find companies in the search results, try a different approach
    if (companies.length === 0) {
      // Try to find any business links
      const businessRegex = /<a[^>]*href="([^"]*\/firma\/[^"]*)"[^>]*>([^<]+)<\/a>/g;
      
      while ((match = businessRegex.exec(htmlContent)) !== null) {
        const url = match[1];
        const name = match[2].trim();
        
        if (name && url) {
          companies.push({
            name: name,
            url: url.startsWith('http') ? url : `https://www.krak.dk${url}`,
            description: 'Danish farm/agriculture company',
            email: null,
            phone: null
          });
        }
      }
    }
    
    // Limit to 5 companies for testing/ethics
    const limitedCompanies: FarmCompany[] = companies
      .filter((company: any) => company.name && company.url)
      .slice(0, 5)
      .map((company: any) => ({
        name: company.name,
        description: company.description || 'Danish farm/agriculture company',
        email: company.email || extractEmailFromUrl(company.url) || null,
        phone: company.phone || null,
        url: company.url,
      }));

    console.log(`Returning ${limitedCompanies.length} companies`);
    return limitedCompanies;
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function extractEmailFromUrl(url: string): string | null {
  // Simple regex to find emails in URL or assume contact page
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const match = url.match(emailRegex);
  return match ? match[0] : null;
}
