import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import {
  buildFileName, buildRemoteUrls, getAllLocalResources, replaceWithLocalUrls,
} from './utils';


export default (dirPath, href) => {
  const { filename, dirname } = buildFileName(href);
  const htmlFilePath = path.join(dirPath, filename);
  const filesDirPath = path.join(dirPath, dirname);
  let data; let
    allRemoteUrls;
  return axios
    .get(href)
    .then((response) => {
      data = response.data;
      const modifiedData = replaceWithLocalUrls(data, dirname, href);
      return fs.writeFile(htmlFilePath, modifiedData);
    })
    .then(() => {
      const allLocalResources = getAllLocalResources(data, href);
      allRemoteUrls = buildRemoteUrls(allLocalResources, href);
      return Promise.all(allRemoteUrls.map((url) => axios({
        method: 'get',
        url,
        responseType: 'arraybuffer',
      })));
    })
    .then((fileResponses) => {
      fileResponses.forEach((fileResponse) => {
        const { pathname } = new URL(fileResponse.config.url);
        const filePath = path.join(filesDirPath, pathname);
        const { dir } = path.parse(filePath);
        fs.mkdir(dir, { recursive: true })
          .then(() => {
            fs.writeFile(filePath, fileResponse.data);
          });
      });
      console.log(`File ${filename} was saved!`);
      console.log(`Directory ${dirname} was saved!`);
    })
    .catch((e) => {
      throw e;
    });
};
