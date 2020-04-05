install:
	npm i
run1:
	npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://jestjs.io/docs/en/expect
error1:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output wrong/path https://jestjs.io/docs/en/expect
error2:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output /root https://jestjs.io/docs/en/expect
error3:
	DEBUG=page-loader npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://jestjs.io/docs/en/expec
debug1:
	DEBUG=* npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://jestjs.io/docs/en/expect
axios-debug1:
	DEBUG=axios npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://jestjs.io/docs/en/expect
open1:
	xdg-open __fixtures__/jestjs_io_docs_en_expect.html
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
	npx jest --watchAll
