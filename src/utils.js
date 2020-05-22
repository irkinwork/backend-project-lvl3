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
  const { origin } = new URL(baseUrl);
  const getNormalized = (link) => new URL(link, baseUrl);

  const getHash = (sourceLink) => {
    const normalizedUrl = getNormalized(sourceLink);
    const normalized = normalizedUrl.toString();
    const relative = path.join(dirPath, normalizedUrl.pathname);
    return { sourceLink, normalized, relative };
  };

  const getAllSourcesFromOneTag = (tag) => $(tag)
    .map((i, item) => $(item).attr(tags[tag]))
    .get();

  const hash = Object.keys(tags)
    .flatMap(getAllSourcesFromOneTag)
    .filter((link) => getNormalized(link).pathname !== '/')
    .filter((link) => getNormalized(link).origin === origin)
    .map(getHash);

  const links = hash.map(({ normalized }) => normalized);
  const html = hash
    .reduce((acc, item) => acc.replace(item.sourceLink, item.relative), data);

  return { html, links };
};
