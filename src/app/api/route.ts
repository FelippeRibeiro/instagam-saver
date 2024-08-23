import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  const linksAndThumbs: { link: string; thumb: string }[] = [];
  const { link } = await request.json();

  const window = {
    location: {
      hostname: 'saveig.app',
    },
  };
  const value = {
    innerHTML: '',
  };

  const document = {
    getElementById: (id: string): { innerHTML: string } => {
      return value;
    },
  };

  const form = new FormData();
  form.append('q', link);
  form.append('t', 'midia');
  form.append('lang', 'en');
  form.append('v', 'v2');

  try {
    const query = await fetch('https://v3.saveig.app/api/ajaxSearch', {
      method: 'POST',
      body: form,
      headers: {},
    });
    let response = await query.json();

    if (response.v === 'v2') {
      const obfuscatedCode = response.data;
      eval(obfuscatedCode);

      const $ = cheerio.load(value.innerHTML);

      $('.download-items').each((i, el) => {
        const div = cheerio.load(el);
        const thumbEle = div('.download-items__thumb > img').attr();
        const link = div('.download-items__btn:nth-child(3) > a').attr()?.href;
        if (link)
          linksAndThumbs.push({
            thumb: thumbEle ? thumbEle['data-src'] || thumbEle['src'] : '',
            link,
          });
      });
    }
    if (response.v == 'v1') {
      linksAndThumbs.push(...(await extractLinks(response.data)));
    }
  } catch (error) {
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json(linksAndThumbs);
}
function getMaxResolutionDownloadLink($: cheerio.CheerioAPI, selectElement: cheerio.Element): string {
  const options = $(selectElement).find('option');
  let maxResolutionLink = '';
  let maxResolution = 0;

  options.each((_, option) => {
    const value = $(option).attr('value');
    const resolutionText = $(option).text();
    const resolutionMatch = resolutionText.match(/(\d+)x(\d+)/);

    if (resolutionMatch) {
      const resolution = parseInt(resolutionMatch[1], 10) * parseInt(resolutionMatch[2], 10);

      if (resolution > maxResolution) {
        maxResolution = resolution;
        maxResolutionLink = value!;
      }
    }
  });

  return maxResolutionLink;
}

// Função principal para extrair as informações
async function extractLinks(html: string) {
  const $ = cheerio.load(html);
  const downloadItems = $('.download-items');

  const results: { thumb: string; link: string }[] = [];

  downloadItems.each((_, element) => {
    const thumbLink = $(element).find('.download-items__thumb img').attr('src');
    const selectElement = $(element).find('.photo-option select')[0];
    const downloadLink = getMaxResolutionDownloadLink($, selectElement);

    if (thumbLink && downloadLink) {
      results.push({
        thumb: thumbLink,
        link: downloadLink,
      });
    }
  });

  return results;
}
