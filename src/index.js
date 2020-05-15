import debug from 'debug';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import Listr from 'listr';
import axiosDebug from 'axios-debug-log';
import {
  buildFileNameFromUrl, buildRemoteUrls, replaceWithLocalUrls,
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
  let data;
  const htmlFileName = buildFileNameFromUrl(link, '.html');
  const filesDirName = buildFileNameFromUrl(link, '_files');
  const htmlFilePath = path.join(dirPath, htmlFileName);
  const filesDirPath = path.join(dirPath, filesDirName);

  log(`htmlFileName: ${htmlFileName}`);
  log(`filesDirName: ${filesDirName}`);
  log(`htmlFilePath: ${htmlFilePath}`);
  log(`filesDirPath: ${filesDirPath}`);

  return fs.stat(dirPath)
    .then(() => axios.get(link))
    .then((response) => {
      data = response.data;
      const modifiedData = replaceWithLocalUrls(data, filesDirName, link);
      return fs.writeFile(htmlFilePath, modifiedData);
    })

    .then(() => {
      const allUrls = buildRemoteUrls(data, link);

      log(`all remote urls:\n${allUrls.join('\n')}`);
      const tasks = new Listr(allUrls.map((url) => {
        let resourceData;
        let filePath;
        return ({
          title: url,
          task: () => axios
            .get(url, { responseType: 'arraybuffer' })
            .then((value) => {
              resourceData = value.data;
              const { pathname } = new URL(url);
              filePath = path.join(filesDirPath, pathname);
              const { dir } = path.parse(filePath);
              return fs.mkdir(dir, { recursive: true });
            })
            .then(() => fs.writeFile(filePath, resourceData))
            .catch((e) => Promise.reject(e)),
        });
      }), { concurrent: true, exitOnError: false });
      return tasks.run();
    })

    .then(() => htmlFilePath);
};
