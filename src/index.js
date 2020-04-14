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
    .then((v) => ({ state: stateNames.success, value: v }))
    .catch((e) => ({ state: stateNames.error, error: e }));

  const runSaveMainDataPromise = () => axios.get(href)
    .then((response) => {
      data = response.data;
      const modifiedData = replaceWithLocalUrls(data, dirname, href);
      return fs.writeFile(htmlFilePath, modifiedData);
    });

  const createResourceTask = (fileResponse) => {
    if (fileResponse.state === stateNames.error) {
      const { pathname } = new URL(fileResponse.error.config.url);
      const filePath = path.join(filesDirPath, pathname);
      return {
        title: `Cannot save ${filePath}...`,
        task: () => Promise.reject(new Error(fileResponse.error)),
      };
    }

    const { pathname } = new URL(fileResponse.value.config.url);
    const filePath = path.join(filesDirPath, pathname);
    const { dir } = path.parse(filePath);
    return {
      title: `Save ${filePath}`,
      task: () => fs.mkdir(dir, { recursive: true })
        .then(() => fs.writeFile(filePath, fileResponse.data))
        .then(() => Promise.resolve()),
    };
  };

  const firstTask = new Listr([
    {
      title: `Save ${htmlFilePath}`,
      task: () => runSaveMainDataPromise()
        .then(() => Promise.resolve()),
    },
  ]);
  return fs.stat(dirPath)
    .then(() => firstTask.run())
    .then(() => {
      const allLocalResources = getAllLocalResources(data, href);
      const allRemoteUrls = buildRemoteUrls(allLocalResources, href);
      log(`allRemoteUrls:\n${allRemoteUrls.join('\n')}`);
      const innerPromises = allRemoteUrls.map(makeGetResourceRequest);
      return Promise.all(innerPromises);
    })
    .then((fileResponses) => {
      const innerTasks = new Listr(
        fileResponses.map(createResourceTask),
        { concurrent: true, exitOnError: false },
      );
      return innerTasks.run();
    })
    .catch((e) => {
      throw e;
    });
};
