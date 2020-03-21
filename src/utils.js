import cheerio from 'cheerio';
import { flatten, isNil } from 'lodash';
import url from 'url';
import path from 'path';

export const isUrlLocal = (url, base) => {
  const { host: baseHost } = new URL(base);
  const { host } = new URL(url, base);
  return host === baseHost;
};

export const buildFileName = (href) => {
  const { host, path } = url.parse(href);
  const baseName = [host, path]
    .join('')
    .replace(/[^\w]/g, '_');
  const filename = `${baseName}.html`;
  const dirname = `${baseName}_files`;
  return { filename, dirname };
};

export const buildRemoteUrls = (urls, href) => {
  const { origin } = new URL(href);

  return urls.map((url) => new URL(url, origin).toString());
};

const tags = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export const getAllLocalResources = (data, link) => {
  const $ = cheerio.load(data);
  const getAllSourcesFromOneTag = (tag) => $(tag).map((i, item) => $(item).attr(tags[tag])).get();

  const allLinks = Object.keys(tags).map(getAllSourcesFromOneTag);
  return flatten(allLinks)
    .filter((item) => !isNil(item))
    .filter((item) => isUrlLocal(item, link));
};

export const replaceWithLocalUrls = (data, dirPath, url) => {
  const $ = cheerio.load(data);
  Object.keys(tags).map((tag) => {
    $(tag).map((i, item) => {
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