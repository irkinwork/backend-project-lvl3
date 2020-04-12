install:
	npm i
run1:
	npx babel-node 'src/bin/page-loader.js' --output /tmp https://weary-fan.surge.sh/
run2:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output /tmp https://jestjs.io/
run3:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output /tmp https://github.com/
run4:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output /tmp https://hexlet.io/
run5:
	npx babel-node 'src/bin/page-loader.js' --output /tmp https://github.com/
error1:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output wrong/path https://jestjs.io/docs/en/expect
error2:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output /root https://jestjs.io/docs/en/expect
error3:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output /tmp https://jestjs.io/docs/en/expec
debug1:
	DEBUG=* npx babel-node 'src/bin/page-loader.js' --output /tmp https://jestjs.io/docs/en/expect
axios-debug1:
	DEBUG=axios npx babel-node 'src/bin/page-loader.js' --output /tmp https://jestjs.io/docs/en/expect
open1:
	xdg-open /tmp/jestjs_io_docs_en_expect.html
publish:
	npm publish --dry-run
publink:
	make publish && npm link
build:
	npm run build
lint:
	npx eslint .
lintfix:
	npx eslint . --fix
test:
	DEBUG=page-loader npx jest --watchAll
tests:
	DEBUG=page-loader npx jest
