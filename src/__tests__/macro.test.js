const path = require("path");
const pluginTester = require("babel-plugin-tester").default;
const plugin = require("babel-plugin-macros");
const prettier = require("prettier");

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: {
    filename: __filename,
  },
  formatResult(result) {
    return prettier.format(result, { trailingComma: "es5", parser: 'babel' });
  },
  tests: {
    "no usage": `import raw from '../macro'`,
    "correct usage": `
      import raw from '../macro';
      
      const macro = raw('raw.macro');
      const md = raw('./fixtures/markdown.md');
      const js = raw('./fixtures/javascript.js');
    `,
    "dynamic import directory": `
      import raw from '../macro';

      function dynamic(locale) {
        const md = raw(\`./fixtures/\${locale}/post.md\`);
        return md;
      }

      const data = dynamic('en')
    `,
    "dynamic import file name": `
      import raw from '../macro';

      function dynamic(fileName) {
        const md = raw(\`./fixtures/\${fileName}.md\`);
        return md;
      }

      const data = dynamic('markdown.md')
    `,
    "dynamic import multiple variable": `
      import raw from '../macro';

      const md = raw(\`./fixtures/\${locale}/\${fileName}.md\`);
    `,
    "multiple dynamic import": `
      import raw from '../macro';

      const a0 = raw('./fixtures/markdown.md');
      const a1 = raw(\`./\${fixtureDir}/markdown.md\`);
      const a2 = raw(\`./fixtures/\${fileName}\`);
    `,
  },
});
