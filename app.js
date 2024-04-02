const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = 8000;

app.get('/deshow', async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.page) || 0;
    console.log(`Página solicitada: ${pageNumber}`);

    const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });  //indica la ruta de chrome.exe

    const page = await browser.newPage();

    await page.goto(`https://deshow.com/advance-search/page/${pageNumber}/`);

    await page.waitForSelector('#property-search-results .col-lg-4');

    const listings = await page.evaluate(() => {
      const listings = [];
      const propertyElements = document.querySelectorAll('#property-search-results .col-lg-4');

      propertyElements.forEach(element => {
        const linkElement = element.querySelector('a');
        const titleElement = element.querySelector('h3');
        const priceSymbolElement = element.querySelector('.price .symbol');
        const priceNumberElement = element.querySelector('.price .number');
        const statusElement = element.querySelector('.status-update .tag');

        if (linkElement && titleElement && priceSymbolElement && priceNumberElement && statusElement) {
          const url = linkElement.href;
          const title = titleElement.textContent.trim();
          const priceSymbol = priceSymbolElement.textContent.trim();
          const priceNumber = priceNumberElement.textContent.trim();
          const price = `${priceSymbol}${priceNumber}`;
          const features = Array.from(element.querySelectorAll('.properties span')).map(span => span.textContent.trim());
          const status = statusElement.textContent.trim();

          listings.push({ url, title, price, features, status });
        } else {
          console.error('Faltan elementos en el listado de propiedades:', element);
        }
      });

      return listings;
    });

    await browser.close();
    console.log('Navegador cerrado correctamente');

    res.json(listings);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Se produjo un error al obtener los listados');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
