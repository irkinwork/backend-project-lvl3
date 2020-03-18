import url from 'url';

export default (href) => {
  const { host, path } = url.parse(href);
  const baseName = [host, path]
    .join('')
    .replace(/[^\w]/g, '_');
  const filename = `${baseName}.html`;
  const dirname = `${baseName}_files`;
  return {filename, dirname};
};
