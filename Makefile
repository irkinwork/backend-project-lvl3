run:
	npx babel-node 'src/bin/page-loader.js' https://ru.hexlet.io/blog/posts/vyshel-laravel-7
publish:
	npm publish --dry-run
publink:
	make publish && npm link
build:
	npm run build
