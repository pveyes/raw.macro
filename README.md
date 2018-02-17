# raw.macro

[![Build Status](https://travis-ci.org/pveyes/raw.macro.svg?branch=master)](https://travis-ci.org/pveyes/raw.macro)

> Webpack [`raw-loader`](https://github.com/webpack-contrib/raw-loader) implemented as [`babel-plugin-macro`](https://github.com/kentcdodds/babel-plugin-macros)

## Why

I came across a few problem when using `raw-loader` in `create-react-app`.

* I need to use webpack loader syntax (which needs to be disabled via eslint)
* Some newlines are removed unintentionally

## Usage

Similar to nodejs `require` call:

```js
import raw from "raw.macro";

const markdown = raw("./README.md");
```

## License

MIT
