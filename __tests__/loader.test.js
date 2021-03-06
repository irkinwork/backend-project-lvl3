import { test, expect } from '@jest/globals';
import {promises as fs} from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
nock.disableNetConnect();
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
let dirpath, expected, expectedSource, noAcessDir;

const link = 'https://frontend-project-lvl3-gamma.now.sh';
const urlPath = '/';
const nameBase = 'frontend_project_lvl3_gamma_now_sh_';
const htmlFilename = `${nameBase}.html`;
const htmlFilenameSource = `${nameBase}__source.html`;
const filesDirname = `${nameBase}_files`;
const getFixtureFilesPath = (name) => path.join(__dirname, '..', '__fixtures__', filesDirname, name);

const resourcesPaths = [
  '/favicon.ico',
  '/css/bootstrap.min.css',
  '/main.js',
];
const scope = nock(link).log(console.log);

beforeEach(async () => {
  dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-rss-'));
  noAcessDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-no-access'));
  await fs.chmod(noAcessDir, 0o000);
  scope
    .get(urlPath)
    .reply(200, expectedSource);
});

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath(htmlFilename), 'utf-8');
  expectedSource = await fs.readFile(getFixturePath(htmlFilenameSource), 'utf-8');
});

test('page-loader should successfully load the https://frontend-project-lvl3-gamma.now.sh', async () => {
  resourcesPaths.forEach((path) => {
    const resourceData = fs.readFile(getFixtureFilesPath(path));
    scope
      .get(path)
      .reply(200, resourceData)
  });
  const {data} = await loadPage(dirpath, link);
  await expect(data.trim()).toBe(expected.trim());
});

describe('errors', () => {
  test('page-loader should load https://frontend-project-lvl3-gamma.now.sh with listr error', async () => {
    resourcesPaths.forEach((path) => {
      scope
        .get(path)
        .reply(404)
    });

    expect(async () => {
        const {data} = await loadPage(dirpath, link);
        expect(data.trim()).toBe(expected.trim());
      }).rejects.toThrow('Something went wrong');
  });

  test('page-loader should fail and show ENOENT error', async () => {
    await expect(loadPage('/wrong/path', link)).rejects.toThrow('ENOENT');
  });

  test('page-loader should fail and show EACCES error', async () => {
    await expect(loadPage(noAcessDir, link)).rejects.toThrow('EACCES');
  });

  test('page-loader should fail and show 400 error', async () => {
    const errorUrl = 'https://frontend-project-lvl3-gamma.now.sh/error';
    const urlPath = '/error';
    scope
      .get(urlPath)
      .reply(404, []);

    await expect(loadPage(dirpath, errorUrl)).rejects.toThrow('404');
  });
})

