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

export const prepareData = (data, dirPath, baseUrl) => {
  const $ = cheerio.load(data);

  const getNewLink = (link) => new URL(link, baseUrl);

  const getNormalized = (sourceLink) => {
    const normalizedUrl = getNewLink(sourceLink);
    const normalized = normalizedUrl.toString();
    const relative = path.join(dirPath, normalizedUrl.pathname);
    return { sourceLink, normalized, relative };
  };

  const getAllSourcesFromOneTag = (tag) => $(tag)
    .map((i, item) => $(item).attr(tags[tag]))
    .get();

  const hash = Object.keys(tags)
    .flatMap(getAllSourcesFromOneTag)
    .filter((link) => getNewLink(link).pathname !== '/')
    .map(getNormalized);

  const links = hash.map(({ normalized }) => normalized);
  const html = hash
    .reduce((acc, item) => acc.replace(item.sourceLink, item.relative), data);

  return { html, links };
};
