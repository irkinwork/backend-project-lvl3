import { promises as fs } from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';

nock.disableNetConnect();

let dirpath; let
  expected;

const link = 'https://ru.hexlet.io/blog/posts/vyshel-laravel-7';
const urlPath = '/blog/posts/vyshel-laravel-7';
const filename1 = 'ru_hexlet_io_blog_posts_vyshel_laravel_7.html';
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

beforeEach(async () => {
  dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  console.log(dirpath);
});

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath(filename1), 'utf-8');
});

test('page-loader should successfully load the page', async () => {
  nock(/hexlet.io/)
    .log(console.log)
    .get(urlPath)
    .reply(200, expected);
 	await loadPage(dirpath, link);
  const actualFileName = path.join(dirpath, filename1);
  const actual = await fs.readFile(actualFileName, 'utf-8');
  expect(actual.trim()).toBe(expected.trim());
});
