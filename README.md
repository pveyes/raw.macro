# raw.macro

[![Build Status](https://travis-ci.org/pveyes/raw.macro.svg?branch=master)](https://travis-ci.org/pveyes/raw.macro) [![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros) [![Greenkeeper badge](https://badges.greenkeeper.io/pveyes/raw.macro.svg)](https://greenkeeper.io/)

> Webpack [`raw-loader`](https://github.com/webpack-contrib/raw-loader) implemented as [`babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros)

## Usage

raw.macro is similar to Node’s `require` call:

```js
import raw from "raw.macro";

const markdown = raw("./README.md");
```

## Installation

In order to use raw.macro in your own project, you can use one of the following commands:

```
$ yarn add --dev raw.macro
$ npm install --save-dev raw.macro
```

## Why

I came across a few problem when using `raw-loader` in `create-react-app`:

* I need to use webpack loader syntax (which needs to be disabled via eslint).
* Some newlines are removed unintentionally.

This can also be useful in environment where webpack is not available / not extensible. Just use babel and you're good to go.

## License

MIT
