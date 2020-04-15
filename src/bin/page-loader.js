#!/usr/bin/env node
import program from 'commander';
import axiosDebug from 'axios-debug-log';
import load from '../index';

axiosDebug({
  request: (debug, config) => {
    debug(`Request to ${config.url}`);
  },
  response: (debug, response) => {
    debug(
      `Response with ${response.headers['content-type']}`,
      `from ${response.config.url}`,
    );
  },
  error: (debug, error) => {
    debug('Error', error);
  },
});

const handleError = (e) => {
  if (e.response) {
    const { url } = e.config;
    return `${e.response.statusText}: ${url}. ${e.message}.`;
  }
  return e.message;
};

program
  .description('Simple pageloader.')
  .version('1.0.0')
  .arguments('<href>')
  .option('-o, --output [path]', 'output path', process.cwd())
  .action((href) => load(program.output, href)
    .then((path) => {
      console.log(`All resources from ${href} were successfully downloaded.`);
      console.log(`You can open ${path}`);
    })
    .catch((e) => {
      console.error(handleError(e));
      process.exit(1);
    }));

program.parse(process.argv);
