export default (url, base) => {
	const {host: baseHost} = new URL(base);
	const {host} = new URL(url, base);
	return host === baseHost;
}