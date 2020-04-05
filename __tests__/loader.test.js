import { promises as fs } from 'fs';
import nock from 'nock';
import path from 'path';
import os from 'os';
import loadPage from '../src';

nock.disableNetConnect();
const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);
let dirpath, expectedFiles, expected, expectedSource;

describe('jestjs_io_docs_en_expect', () => {
  const link = 'https://jestjs.io/docs/en/expect';
  const urlPath = '/docs/en/expect';
  const nameBase = 'jestjs_io_docs_en_expect';
  const htmlFilename = `${nameBase}.html`;
  const htmlFilenameSource = `${nameBase}__source.html`;
  const dirname = `${nameBase}_files`;
  const getFixtureFilesPath = (name) => path.join(__dirname, '..', '__fixtures__', dirname, name);

  beforeEach(async () => {
    dirpath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-jest-'));
  });

  beforeAll(async () => {
    expected = await fs.readFile(getFixturePath(htmlFilename), 'utf-8');
    expectedSource = await fs.readFile(getFixturePath(htmlFilenameSource), 'utf-8');
    expectedFiles = await fs.readdir(getFixturePath(dirname));
  });

  test('page-loader should successfully load the jestjs.io', async () => {

    const jestSvgPath = '/img/jest.svg';
    const jestSvg = await fs.readFile(getFixtureFilesPath(jestSvgPath), 'utf-8');
    const languageSvgPath = '/img/language.svg';
    const languageSvg = await fs.readFile(getFixtureFilesPath(jestSvgPath), 'utf-8');
    const outlineSvgPath = '/img/jest-outline.svg';
    const outlineSvg = await fs.readFile(getFixtureFilesPath(outlineSvgPath), 'utf-8');
    const ossLogoPath = '/img/oss_logo.png';
    const ossLogoSvg = await fs.readFile(getFixtureFilesPath(ossLogoPath), 'utf-8');
    const faviconPath = '/img/favicon/favicon.ico';
    const favicon = await fs.readFile(getFixtureFilesPath(faviconPath), 'utf-8');
    const atomPath = '/blog/atom.xml';
    const atom = await fs.readFile(getFixtureFilesPath(atomPath), 'utf-8');
    const feedPath = '/blog/feed.xml';
    const feed = await fs.readFile(getFixtureFilesPath(feedPath), 'utf-8');
    const cssPath = '/css/main.css';
    const css = await fs.readFile(getFixtureFilesPath(cssPath), 'utf-8');
    const spyPath = '/js/scrollSpy.js';
    const spy = await fs.readFile(getFixtureFilesPath(spyPath), 'utf-8');
    const tabsPath = '/js/codetabs.js';
    const tabs = await fs.readFile(getFixtureFilesPath(tabsPath), 'utf-8');

    nock(/jestjs.io/)
        .log(console.log)
        .get(urlPath)
        .reply(200, expectedSource)
        .get(new RegExp(jestSvgPath))
        .reply(200, jestSvg)
        .get(new RegExp(languageSvgPath))
        .reply(200, languageSvg)
        .get(new RegExp(outlineSvgPath))
        .reply(200, outlineSvg)
        .get(new RegExp(ossLogoPath))
        .reply(200, ossLogoSvg)
        .get(new RegExp(faviconPath))
        .reply(200, favicon)
        .get(new RegExp(atomPath))
        .reply(200, atom)
        .get(new RegExp(feedPath))
        .reply(200, feed)
        .get(new RegExp(cssPath))
        .reply(200, css)
        .get(new RegExp(spyPath))
        .reply(200, spy)
        .get(new RegExp(tabsPath))
        .reply(200, tabs);
    await loadPage(dirpath, link);
    const actualFileName = path.join(dirpath, htmlFilename);
    const actual = await fs.readFile(actualFileName, 'utf-8');
    expect(actual.trim()).toBe(expected.trim());
  });

  test('page-loader should fail and show ENOENT error', async () => {
    await expect(loadPage('/wrong/path', link)).rejects.toThrow('ENOENT');
  });

  test('page-loader should fail and show EACCES error', async () => {
    await expect(loadPage('/root', link)).rejects.toThrow('EACCES');
  });

});

