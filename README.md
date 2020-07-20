# raw.macro

[![Build Status](https://travis-ci.org/pveyes/raw.macro.svg?branch=master)](https://travis-ci.org/pveyes/raw.macro) [![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros) [![Greenkeeper badge](https://badges.greenkeeper.io/pveyes/raw.macro.svg)](https://greenkeeper.io/)

> Webpack [`raw-loader`](https://github.com/webpack-contrib/raw-loader) implemented as [`babel-plugin-macros`](https://github.com/kentcdodds/babel-plugin-macros)

## Installation

In order to use raw.macro in your own project, you can use one of the following commands:

```
$ yarn add --dev raw.macro
$ npm install --save-dev raw.macro
```

## Usage

raw.macro is similar to Node’s `require` call:

```js
import raw from "raw.macro";

const markdown = raw("./README.md");
```

**Note: Because raw.macro uses babel internally to replace `raw()` calls, your transpiled code won't be changed if you only change the file that you import. This is because from babel perspective, your JS file is unchanged**

One workaround that you can do that doesn't involve restarting your build system is making small changes where you put `raw()` calls, for example by adding `console.log()` with different content.

### Dynamic path import

You can also use import dynamic path using [template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals). You can even use them inside a function / React component!

```js
import raw from "raw.macro";

function Article(props) {
  const content = raw(`../content/${props.locale}.md`);
  return <Markdown content={content} />;
}
```

**This method has 2 caveats:**

1. You can only use up to two variables inside template literal. 1 for directory name, and 1 for file name.
2. Using dynamic path import will includes all files that matches your dynamic path, which can make your JS bundle a lot bigger. This is also partly the reason of limitation described in #1

## License

MIT
