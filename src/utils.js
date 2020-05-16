import cheerio from 'cheerio';
import { parse as parseUrl } from 'url';
import path from 'path';

export const buildFileNameFromUrl = (url, postfix) => {
  const { host, path: urlPath } = parseUrl(url);
  const baseName = [host, urlPath]
    .join('')
    .replace(/[^\w]/g, '_');
  return `${baseName}${postfix}`;
};

const tags = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export const modifyData = (data, dirPath, baseUrl) => {
  const { origin, host } = new URL(baseUrl);
  const $ = cheerio.load(data);

  const isLinkLocal = (link) => new URL(link, baseUrl).host === host;
  const isLinkNonRoot = (link) => new URL(link, baseUrl).pathname !== '/';
  const isLinkProper = (link) => isLinkNonRoot(link) && isLinkLocal(link);

  const getAllSourcesFromOneTag = (tag) => $(tag).map((i, item) => $(item).attr(tags[tag])).get();

  const links = Object.keys(tags).flatMap(getAllSourcesFromOneTag)
    .filter(isLinkProper)
    .map((link) => new URL(link, origin).toString());

  Object.keys(tags).forEach((tag) => {
    $(tag).each((i, item) => {
      const link = $(item).attr(tags[tag]);
      if (link && isLinkProper(link)) {
        const { pathname } = new URL(link, origin);
        const newAttr = path.join(dirPath, pathname);
        $(item).attr(tags[tag], newAttr);
      }
    });
  });
  return { html: $.html(), links };
};
