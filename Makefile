.PHONY: watch dist clean serve default babel

default: babel gulpfile.babel.js --out-file gulpfile.js && gulp default

build: node_modules

node_modules: package.json
	npm install
	touch $@

# Run a dev server
serve:
	babel gulpfile.babel.js --out-file gulpfile.js && gulp serve

clean:
	babel gulpfile.babel.js --out-file gulpfile.js && gulp clean

dist:
	babel gulpfile.babel.js --out-file gulpfile.js && gulp default

servedist:
	babel gulpfile.babel.js --out-file gulpfile.js && gulp serve:dist

clean-deps:
	rm -rf node_modules

babel:
	babel gulpfile.babel.js --out-file gulpfile.js
	
build:
	babel gulpfile.babel.js --out-file gulpfile.js && gulp build
	
buildserve:
	babel gulpfile.babel.js --out-file gulpfile.js && gulp build && gulp serve	