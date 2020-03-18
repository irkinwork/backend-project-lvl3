import cheerio from 'cheerio';
import flatten from 'lodash/flatten';
import isUrlLocal from './isUrlLocal';
const tags = {
	img: 'src',
	link: 'href',
	script: 'src',
};

export default (data, link) => {
	const $ = cheerio.load(data);
	const getAllSourcesFromOneTag = (item) => $(item).map(function() {
		return $(this).attr(tags[item]);
	}).get();

	const allLinks = Object.keys(tags).map(getAllSourcesFromOneTag);
	return flatten(allLinks).filter(item => isUrlLocal(item, link));
};
