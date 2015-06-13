.PHONY: watch dist clean

default: gulp

build: node_modules

node_modules: package.json
	npm install
	touch $@

# Run a dev server
serve:
	gulp serve

clean:
	gulp clean

dist:
	gulp serve:dist

clean-deps:
	rm -rf node_modules

babel:
	babel gulpfile.babel.js --out-file gulpfile.js