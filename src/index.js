import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import buildFileName from './utils/buildFileName';
import getAllLocalResources from './utils/getAllLocalResources';

export default (dirPath, href) => {
	const {filename, dirname} = buildFileName(href);
	const filepath = path.join(dirPath, filename);
	const dirpath = path.join(dirPath, dirname);
	let data;
	return axios
		.get(href)
		.then((response) => {
			data = response.data;
			return fs.writeFile(filepath, response.data);
		})
		.then(() => {
			const allLocalResources = getAllLocalResources(data, href);
			return fs.mkdir(dirpath);
		})
		.then(() => {
			console.log(`File ${filename} was saved!`);
			console.log(`Directory ${dirname} was saved!`);
		})
		.catch((e) => {
			throw e;
		});
};
