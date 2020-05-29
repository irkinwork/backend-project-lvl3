import debug from 'debug';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import axiosDebug from 'axios-debug-log';
import {
  buildFileNameFromUrl, prepareData,
} from './utils.js';

const axiosDebugConfig = {
  request: (log, config) => {
    log(`Request to ${config.url}`);
  },
  response: (log, response) => {
    log(
      `Response with ${response.headers['content-type']}`,
      `from ${response.config.url}`,
    );
  },
  error: (log, error) => {
    log('Error', error);
  },
};

const log = debug('page-loader');

export default (dirPath, link) => {
  axiosDebug(axiosDebugConfig);
  let resourcesUrls;
  let modifiedData;
  const htmlFileName = buildFileNameFromUrl(link, '.html');
  const filesDirName = buildFileNameFromUrl(link, '_files');
  const htmlFilePath = path.join(dirPath, htmlFileName);
  const filesDirPath = path.join(dirPath, filesDirName);

  log(`htmlFileName: ${htmlFileName}`);
  log(`filesDirName: ${filesDirName}`);
  log(`htmlFilePath: ${htmlFilePath}`);
  log(`filesDirPath: ${filesDirPath}`);

  const buildPromises = (url) => {
    const { pathname } = new URL(url);
    const filePath = path.join(filesDirPath, pathname);
    const { dir } = path.parse(filePath);
    let resourceData;
    return () => axios
      .get(url, { responseType: 'arraybuffer' })
      .then(({ data }) => {
        resourceData = data;
        return fs.mkdir(dir, { recursive: true });
      })
      .then(() => fs.writeFile(filePath, resourceData));
  };

  return fs.stat(dirPath)
    .then(() => axios.get(link))
    .then(({ data }) => {
      modifiedData = prepareData(data, filesDirName, link);
      resourcesUrls = modifiedData.links;
      log(`all remote urls:\n${resourcesUrls.join('\n')}`);
      return fs.writeFile(htmlFilePath, modifiedData.html);
    })

    .then(() => resourcesUrls.map(buildPromises))

    .then((promises) => ({
      path: htmlFilePath,
      data: modifiedData.html,
      promises,
      resourcesUrls,
    }));
};
