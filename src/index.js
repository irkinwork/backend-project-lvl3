import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import buildFileName from './utils/buildFileName';

export default (dirPath, href) => {
  const filename = buildFileName(href);
  const filepath = path.join(dirPath, filename);
  return axios.get(href)
    .then(({ data }) => fs.writeFile(filepath, data)
      .catch((e) => {
        throw e;
      }))
    .catch((e) => {
      throw e;
    });
};
