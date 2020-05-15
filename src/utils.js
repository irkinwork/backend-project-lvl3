import cheerio from 'cheerio';
import { parse as parseUrl } from 'url';
import path from 'path';

export const isUrlLocal = (url, base) => {
  const { host: baseHost } = new URL(base);
  const { host } = new URL(url, base);
  return host === baseHost;
};

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

export const buildRemoteUrls = (data, link) => {
  const { origin } = new URL(link);
  const $ = cheerio.load(data);
  const getAllSourcesFromOneTag = (tag) => $(tag).map((i, item) => $(item).attr(tags[tag])).get();

  const allLinks = Object.keys(tags).flatMap(getAllSourcesFromOneTag);
  return allLinks
    .filter((item) => isUrlLocal(item, link))
    .map((url) => new URL(url, origin).toString());
};

export const replaceWithLocalUrls = (data, dirPath, url) => {
  const $ = cheerio.load(data);

  Object.keys(tags).forEach((tag) => {
    $(tag).each((i, item) => {
      const link = $(item).attr(tags[tag]);
      if (link && isUrlLocal(link, url)) {
        const { origin } = new URL(url);
        const { pathname } = new URL(link, origin);
        const newAttr = path.join(dirPath, pathname);
        $(item).attr(tags[tag], newAttr);
      }
    });
  });
  return $.html();
};
