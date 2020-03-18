install:
	npm i
run:
	npx babel-node 'src/bin/page-loader.js' --output __fixtures__ https://jestjs.io/docs/en/expect
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

