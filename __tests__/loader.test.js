import {promises as fs} from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';

nock.disableNetConnect();
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
let dirpath, expected, expectedSource, scope;

const link = 'https://frontend-project-lvl3-gamma.now.sh';
const urlPath = '/';
const nameBase = 'frontend_project_lvl3_gamma_now_sh_';
const htmlFilename = `${nameBase}.html`;
const htmlFilenameSource = `${nameBase}__source.html`;
const dirname = `${nameBase}_files`;
const getFixtureFilesPath = (name) => path.join(__dirname, '..', '__fixtures__', dirname, name);

beforeEach(async () => {
  const resourcesPaths = [
    '/favicon.ico',
    '/css/bootstrap.min.css',
    '/main.js',
  ];

  scope = nock(link).log(console.log);
  scope
    .get(urlPath)
    .reply(200, expectedSource)
  resourcesPaths.forEach((path) => {
    scope
      .get(path)
      .reply(200, fs.readFile(getFixtureFilesPath(path)))
  });
  dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-rss-'));
});

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath(htmlFilename), 'utf-8');
  expectedSource = await fs.readFile(getFixturePath(htmlFilenameSource), 'utf-8');
});

test('page-loader should successfully load the https://frontend-project-lvl3-gamma.now.sh', async () => {
    await loadPage(dirpath, link);
    const actualFileName = path.join(dirpath, htmlFilename);
    const actual = await fs.readFile(actualFileName, 'utf-8');
    await expect(actual.trim()).toBe(expected.trim());
});

test('page-loader should load https://frontend-project-lvl3-gamma.now.sh with listr error', async () => {
    try {
      await loadPage(dirpath, link);
    } catch (e) {
      const actualFileName = path.join(dirpath, htmlFilename);
      const actual = await fs.readFile(actualFileName, 'utf-8');
      expect(actual.trim()).toBe(expected.trim());
      expect(e.message).toBe('Something went wrong');
    }
});

test('page-loader should fail and show ENOENT error', async () => {
  await expect(loadPage('/wrong/path', link)).rejects.toThrow('ENOENT');
});

test('page-loader should fail and show EACCES error', async () => {
  await expect(loadPage('/root', link)).rejects.toThrow('EACCES');
});

test('page-loader should fail and show 400 error', async () => {
  const errorUrl = 'https://frontend-project-lvl3-gamma.now.sh/error';
  const urlPath = '/error';
  scope
    .get(urlPath)
    .reply(404, []);

  await expect(loadPage(dirpath, errorUrl)).rejects.toThrow('404');
});

test('page-loader should fail and show 500 error', async () => {
  const errorUrl = 'https://frontend-project-lvl3-gamma.now.sh/error';
  const urlPath = '/error';
  scope
    .get(urlPath)
    .reply(500, []);

  await expect(loadPage(dirpath, errorUrl)).rejects.toThrow('500');
});

