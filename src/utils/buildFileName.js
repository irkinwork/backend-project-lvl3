import url from 'url';

export default (href) => {
  const { path, host } = url.parse(href);
  const filename = [host, path]
    .join('')
    .replace(/[^\w]/g, '_');
  return `${filename}.html`;
};
