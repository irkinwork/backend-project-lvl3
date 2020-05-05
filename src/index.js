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

const stateNames = {
  success: 'success',
  error: 'error',
};

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
      const allRemoteUrls = buildRemoteUrls(data, link);

      log(`all remote urls:\n${allRemoteUrls.join('\n')}`);

      const innerPromises = allRemoteUrls.map((remoteUrl) => axios
        .get(remoteUrl, { responseType: 'arraybuffer' })
        .then((value) => {
          const { url } = value.config;
          const { pathname } = new URL(url);
          const filePath = path.join(filesDirPath, pathname);
          const { dir } = path.parse(filePath);
          return {
            payload: value.data, url, filePath, dir, state: stateNames.success,
          };
        })
        .catch((e) => ({ payload: e, url: e.config.url, state: stateNames.error })));
      return Promise.all(innerPromises);
    })

    .then((responses) => {
      const tasks = new Listr(
        responses.map((response) => {
          if (response.state === stateNames.error) {
            return {
              title: response.url,
              task: () => Promise.reject(new Error(response.payload)),
            };
          }
          const { url, filePath, dir } = response;
          return {
            title: url,
            task: () => fs.mkdir(dir, { recursive: true })
              .then(() => fs.writeFile(filePath, response.payload)),
          };
        }),
        { concurrent: true, exitOnError: false },
      );
      return tasks.run();
    })
    .then(() => htmlFilePath);
};
