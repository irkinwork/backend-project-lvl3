import { promises as fs } from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';
nock.disableNetConnect();

const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
let dirpath, expected, expectedFiles;

describe('hexlet', () => {

  const link = 'https://ru.hexlet.io/blog/posts/vyshel-laravel-7';
  const urlPath = '/blog/posts/vyshel-laravel-7';
  const filename1 = 'ru_hexlet_io_blog_posts_vyshel_laravel_7.html';

  beforeEach(async () => {
    dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  beforeAll(async () => {
    expected = await fs.readFile(getFixturePath(filename1), 'utf-8');
  });

  test('page-loader should successfully load the hexlet.io', async () => {
    nock(/hexlet.io/)
        .log(console.log)
        .get(urlPath)
        .reply(200, expected);
    await loadPage(dirpath, link);
    const actualFileName = path.join(dirpath, filename1);
    const actual = await fs.readFile(actualFileName, 'utf-8');
    expect(actual.trim()).toBe(expected.trim());
  });
});

describe('weary-fan.surge.sh', () => {

  const link = 'https://weary-fan.surge.sh';
  const filename1 = 'weary_fan_surge_sh_.html';
  const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

  beforeEach(async () => {
    dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  beforeAll(async () => {
    expected = await fs.readFile(getFixturePath(filename1), 'utf-8');
  });

  test('page-loader should successfully load the weary-fan.surge.sh', async () => {
    nock(/weary-fan.surge.sh/)
        .log(console.log)
        .get('/')
        .reply(200, expected);
    await loadPage(dirpath, link);
    const actualFileName = path.join(dirpath, filename1);
    const actual = await fs.readFile(actualFileName, 'utf-8');
    expect(actual.trim()).toBe(expected.trim());
  });
});

describe('jestjs_io_docs_en_expect', () => {

  const link = 'https://jestjs.io/docs/en/expect';
  const urlPath = '/docs/en/expect';
  const filename1 = 'jestjs_io_docs_en_expect.html';
  const dirname = 'jestjs_io_docs_en_expect_files';
  const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

  beforeEach(async () => {
    dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-jest-'));
  });

  beforeAll(async () => {
    expected = await fs.readFile(getFixturePath(filename1), 'utf-8');
    expectedFiles = await fs.readdir(getFixturePath(dirname));
  });

  test('page-loader should successfully load the jestjs.io', async () => {
    nock(/jestjs.io/)
        .log(console.log)
        .get(urlPath)
        .reply(200, expected);
    await loadPage(dirpath, link);
    const actualFileName = path.join(dirpath, filename1);
    const actual = await fs.readFile(actualFileName, 'utf-8');
    expect(actual.trim()).toBe(expected.trim());
    // нужно проверить, что файлы, которые мы скачаем
  });
});

