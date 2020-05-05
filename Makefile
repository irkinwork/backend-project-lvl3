install:
	npm i
run1:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output /tmp https://frontend-project-lvl3-gamma.now.sh/
run2:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output /tmp https://jestjs.io/
run3:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output /tmp https://github.com/
run4:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output /tmp https://hexlet.io/
run5:
	npx node 'bin/page-loader.js' --output /tmp https://github.com/
error1:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output wrong/path https://jestjs.io/docs/en/expect
error2:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output /root https://jestjs.io/docs/en/expect
error3:
	DEBUG=page-loader npx node 'bin/page-loader.js' --output /tmp https://jestjs.io/docs/en/expec
debug1:
	DEBUG=* npx node 'bin/page-loader.js' --output /tmp https://jestjs.io/docs/en/expect
axios-debug1:
	DEBUG=axios npx node 'bin/page-loader.js' --output /tmp https://jestjs.io/docs/en/expect
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
tests:
	DEBUG=page-loader npx -n --experimental-vm-modules jest --watchAll
test:
	npm run test
