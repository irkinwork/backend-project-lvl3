import url from 'url';

export default (href) => {
	const {path: urlPath, host} = url.parse(href);
	const filename = [host, urlPath]
		.join('')
		.replace(/[^\w]/g, '_');
	return `${filename}.html`;
}