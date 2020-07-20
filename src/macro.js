const path = require("path");
const fs = require("fs");
const { createMacro } = require("babel-plugin-macros");

module.exports = createMacro(rawMacros);

const RAW_DYNAMIC_VARIABLE_NAME_PREFIX = "__raw_dynamic__";

function rawMacros({ references, state, babel }) {
  // we define counter here so it always starts from 0 for different file
  // we use object so we can mutate inside requireRaw
  let usageCounter = {
    value: 0,
  };

  references.default.forEach(referencePath => {
    if (referencePath.parentPath.type === "CallExpression") {
      requireRaw({ referencePath, state, babel, usageCounter });
    } else {
      throw new Error(
        `This is not supported: \`${referencePath
          .findParent(babel.types.isExpression)
          .getSource()}\`. Please see the raw.macro documentation`,
      );
    }
  });
}

function requireRaw({ referencePath, state, babel, usageCounter }) {
  const filename = state.file.opts.filename;
  const t = babel.types;
  const callExpressionPath = referencePath.parentPath;
  const dirname = path.dirname(filename);
  let rawPath;

  const arg = callExpressionPath.get("arguments")[0];

  switch (arg.node.type) {
    case "TemplateLiteral": {
      const { expressions, quasis } = arg.node;

      const isInvalidTemplateLiteral = quasis[0].value.raw === "";
      if (isInvalidTemplateLiteral) {
        throw new Error(
          "Invalid value, variable interpolation can't be at the start of template literal",
        );
      }

      if (expressions.length > 2) {
        throw new Error(
          "Invalid value. You can only have 2 dynamic values max. 1 for directory name, 1 for file name.",
        );
      }

      const dynamicVariableName =
        RAW_DYNAMIC_VARIABLE_NAME_PREFIX + usageCounter.value;
      usageCounter.value++;

      const variables = expressions.map((node, idx) => {
        const isDirectory =
          idx === quasis.length - 1
            ? false
            : arg.node.quasis[idx + 1].value.raw.startsWith("/");
        return {
          name: node.name,
          isDirectory,
        };
      });

      const rootDir = path.join(dirname, quasis[0].value.raw);
      const pathEntries = fs
        .readdirSync(rootDir)
        .filter(p => {
          try {
            return (
              fs.lstatSync(path.join(rootDir, p)).isDirectory() ===
              variables[0].isDirectory
            );
          } catch (err) {
            return false;
          }
        })
        .flatMap(p => {
          if (!variables[0].isDirectory) {
            if (p.endsWith(quasis[1].value.raw)) {
              return p.replace(quasis[1].value.raw, "");
            } else {
              return [];
            }
          }

          return p;
        });

      // start from index 1 because index 0 is always base directory
      quasis.slice(1).forEach((quasi, i) => {
        const pathFragment = quasi.value.raw;
        const variable = variables[i];

        if (variable.isDirectory) {
          pathEntries.forEach((traversedPath, j) => {
            if (!quasi.tail) {
              const traversedDirname = path.join(rootDir, traversedPath);
              const paths = fs.readdirSync(traversedDirname).filter(p => {
                // quasi loop happen after .slice(1) call which means next quasi is
                // i+2 instead of i+1
                return p.endsWith(quasis[i + 2].value.raw);
              });

              pathEntries[j] = [traversedPath, paths];
            }
          });
        }
      });

      const programPath = getProgramPath(referencePath);
      programPath.unshiftContainer(
        "body",
        t.variableDeclaration("var", [
          t.variableDeclarator(
            t.identifier(dynamicVariableName),
            createObjectASTFromPathEntries(
              t,
              pathEntries,
              rootDir,
              quasis[quasis.length - 1].value.raw,
            ),
          ),
        ]),
      );

      callExpressionPath.replaceWith(
        t.expressionStatement(
          variables.reduce((acc, variable) => {
            return t.memberExpression(acc, t.identifier(variable.name), true);
          }, t.identifier(dynamicVariableName)),
        ),
      );
      return;
    }
    case "StringLiteral":
      rawPath = arg.node.value;
      break;
  }

  if (rawPath === undefined) {
    throw new Error(
      `There was a problem evaluating the value of the argument for the code: ${callExpressionPath.getSource()}. ` +
      `If the value is dynamic, please make sure that its value is statically deterministic.`,
    );
  }

  const fullPath = require.resolve(rawPath, { paths: [dirname] });
  const fileContent = fs.readFileSync(fullPath, { encoding: "utf-8" });

  callExpressionPath.replaceWith(
    t.expressionStatement(t.stringLiteral(fileContent)),
  );
}

function createObjectASTFromPathEntries(
  t,
  pathEntries,
  rootDir,
  fileName = "",
) {
  return t.objectExpression(
    pathEntries
      .map(entry => {
        if (Array.isArray(entry)) {
          return t.objectProperty(
            t.stringLiteral(entry[0]),
            createObjectASTFromPathEntries(
              t,
              entry[1],
              path.join(rootDir, entry[0]),
            ),
          );
        }

        try {
          const rawPath = entry + fileName;
          const fullPath = require.resolve(rawPath, {
            paths: [rootDir],
          });
          return t.objectProperty(
            t.stringLiteral(entry),
            t.stringLiteral(fs.readFileSync(fullPath, "utf-8")),
          );
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean),
  );
}

function getProgramPath(path) {
  if (path.parentPath) {
    return getProgramPath(path.parentPath);
  }

  return path;
}
