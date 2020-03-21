import {replaceWithLocalUrls} from '../src/utils';

const url = 'https://jestjs.io/docs/en/expect';
const dirPath = 'files';

test('replace simple links', () => {
	const head = `<html><head><title>RSS Feader</title><link rel="shortcut icon" href="./favicon.ico"><link href="css/bootstrap.min.css" rel="stylesheet"></head><body></body></html>`;
	const expected  = `<html><head><title>RSS Feader</title><link rel="shortcut icon" href="files/favicon.ico"><link href="files/css/bootstrap.min.css" rel="stylesheet"></head><body></body></html>`;
	expect(replaceWithLocalUrls(head, dirPath, url)).toEqual(expected)
})

test('replace complex links', () => {
	const head = `<html><head><title>RSS Feader</title><link rel="shortcut icon" href="./favicon.ico"><link href="https://cdn.jsdelivr.net/docsearch.js/1/docsearch.min.css" rel="stylesheet"></head><body></body></html>`;
	const expected  = `<html><head><title>RSS Feader</title><link rel="shortcut icon" href="files/favicon.ico"><link href="https://cdn.jsdelivr.net/docsearch.js/1/docsearch.min.css" rel="stylesheet"></head><body></body></html>`;
	expect(replaceWithLocalUrls(head, dirPath, url)).toEqual(expected)
});

test('replace complex local links', () => {
	const head = `<html><head><title>RSS Feader</title><link rel="shortcut icon" href="./favicon.ico"><link rel="alternate" type="application/atom+xml" href="https://jestjs.io/blog/atom.xml" title="Jest Blog ATOM Feed"></head><body></body></html>`;
	const expected  =`<html><head><title>RSS Feader</title><link rel="shortcut icon" href="files/favicon.ico"><link rel="alternate" type="application/atom+xml" href="files/blog/atom.xml" title="Jest Blog ATOM Feed"></head><body></body></html>`;
	expect(replaceWithLocalUrls(head, dirPath, url)).toEqual(expected)
});

test('replace with no attributes', () => {
	const head = `<html><head><title>RSS Feader</title><link rel="shortcut icon" href="./favicon.ico"><link rel="alternate" type="application/atom+xml" href="https://jestjs.io/blog/atom.xml" title="Jest Blog ATOM Feed"></head><body><script></script></body></html>`;
	const expected  =`<html><head><title>RSS Feader</title><link rel="shortcut icon" href="files/favicon.ico"><link rel="alternate" type="application/atom+xml" href="files/blog/atom.xml" title="Jest Blog ATOM Feed"></head><body><script></script></body></html>`;
	expect(replaceWithLocalUrls(head, dirPath, url)).toEqual(expected)
});
