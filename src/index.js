import debug from 'debug';
import axios from 'axios';
import {promises as fs} from 'fs';
import path from 'path';
import Listr from 'listr';
import axiosDebug from 'axios-debug-log';
import {
  buildFileNameFromUrl, buildRemoteUrls, replaceWithLocalUrls,
} from './utils';

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

export default (dirPath, url) => {
  axiosDebug(axiosDebugConfig);
  let data;
  const htmlFileName = buildFileNameFromUrl(url, '.html');
  const filesDirName = buildFileNameFromUrl(url, '_files');
  const htmlFilePath = path.join(dirPath, htmlFileName);
  const filesDirPath = path.join(dirPath, filesDirName);

  log(`htmlFileName: ${htmlFileName}`);
  log(`filesDirName: ${filesDirName}`);
  log(`htmlFilePath: ${htmlFilePath}`);
  log(`filesDirPath: ${filesDirPath}`);

  return fs.stat(dirPath)
    .then(() => axios.get(url))
    .then((response) => {
      data = response.data;
      const modifiedData = replaceWithLocalUrls(data, filesDirName, url);
      return fs.writeFile(htmlFilePath, modifiedData);
    })

    .then(() => {
      const allRemoteUrls = buildRemoteUrls(data, url);

      log(`all remote urls:\n${allRemoteUrls.join('\n')}`);

      const innerPromises = allRemoteUrls.map((url) => axios
        .get(url, {responseType: 'arraybuffer'})
        .then((value) => ({state: stateNames.success, payload: value}))
        .catch((e) => ({state: stateNames.error, payload: e})));
      return Promise.all(innerPromises);
    })

    .then((responses) => {
      const tasks = new Listr(
        responses.map((response) => {
          const {url} = response.payload.config;
          const {pathname} = new URL(url);
          const filePath = path.join(filesDirPath, pathname);
          if (response.state === stateNames.error) {
            return {
              title: url,
              task: () => Promise.reject(new Error(response.payload)),
            };
          }
          const {dir} = path.parse(filePath);
          return {
            title: url,
            task: () => fs.mkdir(dir, {recursive: true})
              .then(() => {
                log(response.payload.data);
                return fs.writeFile(filePath, response.payload.data);
              }),
          };
        }),
        {concurrent: true, exitOnError: false},
      );
      return tasks.run();
    })
    .then(() => htmlFilePath);
};
