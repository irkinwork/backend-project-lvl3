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

program
  .description('Download page from the Internet.')
  .version('1.0.0')
  .arguments('<firstConfig>')
  .option('-o, --output [path]', 'output path', process.cwd())
  .action((href) => {
    console.log(load(program.output, href));
  });
program.parse(process.argv);
