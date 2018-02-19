# raw.macro

[![Greenkeeper badge](https://badges.greenkeeper.io/pveyes/raw.macro.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/pveyes/raw.macro.svg?branch=master)](https://travis-ci.org/pveyes/raw.macro)

> Webpack [`raw-loader`](https://github.com/webpack-contrib/raw-loader) implemented as [`babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros)

## Usage

Similar to nodejs `require` call:

```js
import raw from "raw.macro";

const markdown = raw("./README.md");
```

## Why

I came across a few problem when using `raw-loader` in `create-react-app`.

* I need to use webpack loader syntax (which needs to be disabled via eslint).
* Some newlines are removed unintentionally.

This can also be useful in environment where webpack is not available / not extensible. Just use babel and you're good to go.

## License

MIT
