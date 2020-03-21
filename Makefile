install:
	npm i
run1:
	npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://weary-fan.surge.sh
open1:
	xdg-open __fixtures__/weary_fan_surge_sh_.html
open2:
	xdg-open __fixtures__/jestjs_io_docs_en_expect.html
run2:
	npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://jestjs.io/docs/en/expect
runAll:
	make run1 && make run2
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

