import {promises as fs} from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';

nock.disableNetConnect();
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
let dirpath, expectedFiles, expected, expectedSource;

const link = 'https://frontend-project-lvl3-gamma.now.sh';
const urlPath = '/';
const nameBase = 'frontend_project_lvl3_gamma_now_sh_';
const htmlFilename = `${nameBase}.html`;
const htmlFilenameSource = `${nameBase}__source.html`;
const dirname = `${nameBase}_files`;
const getFixtureFilesPath = (name) => path.join(__dirname, '..', '__fixtures__', dirname, name);

beforeEach(async () => {
  dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-rss-'));
});

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath(htmlFilename), 'utf-8');
  expectedSource = await fs.readFile(getFixturePath(htmlFilenameSource), 'utf-8');
  expectedFiles = await fs.readdir(getFixturePath(dirname));
});

test('page-loader should successfully load the https://frontend-project-lvl3-gamma.now.sh', async () => {

  // const iconPath = '/favicon.ico';
  // const cssPath = '/css/bootstrap.min.css';
  // const jsPath = '/main.js';
  //
  // const resourcesPaths = [
  //   '/favicon.ico',
  //   '/css/bootstrap.min.css',
  //   '/main.js',
  // ];
  //
  // const resourcesData = {};
  //
  // for (const key of resourcesPaths) {
  //   try {
  //     resourcesData[key] = await fs.readFile(getFixtureFilesPath(key));
  //   } catch (e) {
  //     throw new Error(e);
  //   }
  // }

  nock(/jestjs.io/)
    .log(console.log)
    .get(urlPath)
    // .reply(200, expectedSource)
    // .get(link => resourcesPaths.includes(new RegExp(link)))
    // .reply(200, Object.values(resourcesData))

    await loadPage(dirpath, link);
    const actualFileName = path.join(dirpath, htmlFilename);
    const actual = await fs.readFile(actualFileName, 'utf-8');
    await expect(actual.trim()).toBe(expected.trim());
});

// test('page-loader should load jestjs.io with listr error', async () => {
//
//   const jestSvgPath = '/img/jest.svg';
//   const jestSvg = await fs.readFile(getFixtureFilesPath(jestSvgPath), 'utf-8');
//   const languageSvgPath = '/img/language.svg';
//
//   nock(/jestjs.io/)
//     .log(console.log)
//     .get(urlPath)
//     .reply(200, expectedSource)
//     .get(new RegExp(jestSvgPath))
//     .reply(200, jestSvg)
//     .get(new RegExp(languageSvgPath))
//     .reply(404, [])
//     try {
//       await loadPage(dirpath, link);
//     } catch (e) {
//       const actualFileName = path.join(dirpath, htmlFilename);
//       const actual = await fs.readFile(actualFileName, 'utf-8');
//       expect(actual.trim()).toBe(expected.trim());
//       expect(e.message).toBe('Something went wrong');
//     }
// });
//
// test('page-loader should fail and show ENOENT error', async () => {
//   await expect(loadPage('/wrong/path', link)).rejects.toThrow('ENOENT');
// });
//
// test('page-loader should fail and show EACCES error', async () => {
//   nock(/jestjs.io/)
//     .log(console.log)
//     .get(urlPath)
//     .reply(200, expectedSource)
//   await expect(loadPage('/root', link)).rejects.toThrow('EACCES');
// });
//
// test('page-loader should fail and show 400 error', async () => {
//   const link = 'https://jestjs.io/docs/en/expec';
//   const urlPath = '/docs/en/expec';
//   nock(/jestjs.io/)
//     .log(console.log)
//     .get(urlPath)
//     .reply(404, []);
//
//   await expect(loadPage(dirpath, link)).rejects.toThrow('404');
// });
//
// test('page-loader should fail and show 500 error', async () => {
//   nock(/jestjs.io/)
//     .log(console.log)
//     .get(urlPath)
//     .reply(500, []);
//
//   await expect(loadPage(dirpath, link)).rejects.toThrow('500');
// });

