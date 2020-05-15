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

const filterUrl = (url, base) => {
  const { host: baseHost } = new URL(base);
  const { host, pathname } = new URL(url, base);
  return host === baseHost && pathname !== '/';
};

const tags = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export const modifyData = (data, dirPath, url) => {
  const { origin } = new URL(url);
  const $ = cheerio.load(data);
  const getAllSourcesFromOneTag = (tag) => $(tag).map((i, item) => $(item).attr(tags[tag])).get();

  const links = Object.keys(tags).flatMap(getAllSourcesFromOneTag)
    .filter((item) => filterUrl(item, url))
    .map((link) => new URL(link, origin).toString());

  Object.keys(tags).forEach((tag) => {
    $(tag).each((i, item) => {
      const link = $(item).attr(tags[tag]);
      if (link && filterUrl(link, url)) {
        const { pathname } = new URL(link, origin);
        const newAttr = path.join(dirPath, pathname);
        $(item).attr(tags[tag], newAttr);
      }
    });
  });
  return { html: $.html(), links };
};
