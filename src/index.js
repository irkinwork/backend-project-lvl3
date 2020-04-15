import debug from 'debug';
import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import Listr from 'listr';
import {
  buildFileName, buildRemoteUrls, getAllLocalResources, replaceWithLocalUrls,
} from './utils';

const log = debug('page-loader');

const stateNames = {
  success: 'success',
  error: 'error',
};

export default (dirPath, href) => {
  let data;
  const { filename, dirname } = buildFileName(href);
  const htmlFilePath = path.join(dirPath, filename);
  log(`dirname: ${dirname}`);
  log(`filename: ${filename}`);
  const filesDirPath = path.join(dirPath, dirname);
  log(`htmlFilePath: ${htmlFilePath}`);
  log(`filesDirPath: ${filesDirPath}`);

  const makeGetResourceRequest = (url) => axios
    .get(url, { responseType: 'arraybuffer' })
    .then((value) => ({ state: stateNames.success, data: value }))
    .catch((e) => ({ state: stateNames.error, data: e }));

  const createResourceTask = (fileResponse) => {
    const { url } = fileResponse.data.config;
    const { pathname } = new URL(url);
    const filePath = path.join(filesDirPath, pathname);
    if (fileResponse.state === stateNames.error) {
      return {
        title: url,
        task: () => Promise.reject(new Error(fileResponse.data)),
      };
    }
    const { dir } = path.parse(filePath);
    return {
      title: url,
      task: () => fs.mkdir(dir, { recursive: true })
        .then(() => fs.writeFile(filePath, fileResponse.data))
        .then(() => Promise.resolve()),
    };
  };

  return fs.stat(dirPath)
    .then(() => axios.get(href))
    .then((response) => {
      data = response.data;
      const modifiedData = replaceWithLocalUrls(data, dirname, href);
      return fs.writeFile(htmlFilePath, modifiedData);
    })
    .then(() => {
      const allLocalResources = getAllLocalResources(data, href);
      const allRemoteUrls = buildRemoteUrls(allLocalResources, href);
      log(`allRemoteUrls:\n${allRemoteUrls.join('\n')}`);
      const innerPromises = allRemoteUrls.map(makeGetResourceRequest);
      return Promise.all(innerPromises);
    })
    .then((fileResponses) => {
      const resourcesTasks = new Listr(
        fileResponses.map(createResourceTask),
        { concurrent: true, exitOnError: false },
      );
      return resourcesTasks.run();
    })
    .then(() => Promise.resolve(htmlFilePath))
    .catch((e) => {
      throw e;
    });
};
