import cheerio from 'cheerio';
import { parse as parseUrl } from 'url';
import path from 'path';
import _ from 'lodash';

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
  const isLinkNonRoot = (link) => new URL(link, baseUrl).pathname !== '/';
  const isLinkNonEmpty = (link) => !_.isEmpty(link);
  const isLinkProper = (link) => isLinkNonRoot(link) && isLinkNonEmpty(link);
  const $ = cheerio.load(data);

  const getNormalizedAttr = (currentValue) => new URL(currentValue, baseUrl).toString();

  const getLocalUrl = (currentValue) => {
    const newUrl = new URL(currentValue, baseUrl);
    const { pathname } = newUrl;
    return isLinkProper(currentValue) ? path.join(dirPath, pathname) : currentValue;
  };

  const modifyTree = (getNewAttr) => {
    $(Object.keys(tags).join(', ')).each((i, item) => {
      const currentTag = $(item).prop('tagName').toLowerCase();
      const currentValue = $(item).attr(tags[currentTag]);
      const newValue = currentValue ? getNewAttr(currentValue) : currentValue;
      $(item).attr(tags[currentTag], newValue);
    });
  };

  modifyTree(getNormalizedAttr);

  const getAllSourcesFromOneTag = (tag) => $(tag).map((i, item) => $(item).attr(tags[tag])).get();

  const links = Object.keys(tags)
    .flatMap(getAllSourcesFromOneTag)
    .filter(isLinkProper);

  modifyTree(getLocalUrl);

  return { html: $.html(), links };
};
