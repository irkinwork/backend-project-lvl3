import {getAllLocalResources} from '../src/utils';
import { promises as fs } from 'fs';
import path from "path";

const getFixturePath = (name) => path.join(__dirname, '..', '__fixtures__', name);

describe('jestjs_io_docs_en_expect', () => {
	let dom;
	const filename1 = 'jestjs_io_docs_en_expect__source.html';
	const link = 'https://jestjs.io/docs/en/expect';
	beforeAll(async () => {
		dom = await fs.readFile(getFixturePath(filename1), 'utf-8');
	});

	test('get resources from jestjs_io_docs_en_expect.html with external links', async () => {
		const expected = [
			'/img/jest.svg',
			'/img/language.svg',
			'/img/jest-outline.svg',
			'/img/oss_logo.png',
			'/img/favicon/favicon.ico',
			'https://jestjs.io/blog/atom.xml',
			'https://jestjs.io/blog/feed.xml',
			'/css/main.css',
			'/js/scrollSpy.js',
			'/js/codetabs.js',
		];
		expect(getAllLocalResources(dom, link)).toEqual(expected);
	});
});
