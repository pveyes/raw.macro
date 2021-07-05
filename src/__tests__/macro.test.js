const path = require("path");
const pluginTester = require("babel-plugin-tester").default;
const plugin = require("babel-plugin-macros");
const prettier = require("prettier");

const testConfig = {
  plugin,
  babelOptions: {
    filename: __filename,
  },
  formatResult(result) {
    return prettier.format(result, { trailingComma: "es5", parser: "babel" });
  },
};

pluginTester({
  ...testConfig,
  snapshot: true,
  tests: {
    "no usage": `import raw from '../macro'`,
    "correct usage": `
      import raw from '../macro';

      const macro = raw('raw.macro');
      const md = raw('./fixtures/markdown.md');
      const js = raw('./fixtures/javascript.js');
    `,
    "static template literal": `
      import raw from '../macro';

      const macro = raw('raw.macro');
      const md = raw(\`./fixtures/markdown.md\`);
      const js = raw(\`./fixtures/javascript.js\`);
    `,
    "static template literal using interpolation": `
      import raw from '../macro';

      const fileName = 'markdown';
      const md = raw(\`./fixtures/\${fileName}.md\`);
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

      const data = dynamic('markdown')
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
    "dynamic import file name with space": `
      import raw from '../macro';

      const a0 = raw(\`./fixtures/en/\${file}\`);
    `,
  },
});

pluginTester({
  ...testConfig,
  error: true,
  tests: {
    "invalid file in dynamic directory": `
      import raw from '../macro';

      const a1 = raw(\`./\${fixtureDir}/index.js\`);
    `,
    "invalid dynamic value at the start of template literal": `
      import raw from '../macro';

      const a1 = raw(\`\${fixtureDir}/javascript.js\`);
    `,
    "invalid dynamic values exceed limit": `
      import raw from '../macro';

      const a1 = raw(\`./\${anotherDir}/\${fixtureDir}/\${fileName}.md\`);
    `,
  },
});
