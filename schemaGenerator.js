const path = require("path");
const fs = require("fs");
const tjs = require("typescript-json-schema");

const settings = {
  required: true,
  ref: false,
};

const compilerOptions = {
  strictNullChecks: true,
};

const program = tjs.getProgramFromFiles(
  fs.readdirSync(path.join('src', 'dtos'))
    .map(file => path.resolve(path.join('src', 'dtos', file))),
  compilerOptions,
  process.cwd(),
);

const schema = tjs.generateSchema(program, "*", settings);
fs.writeFileSync(
  "_schemas.ts",
  "const schema = " +
    JSON.stringify(schema, null, '\t') +
    " as const;\nexport default schema.definitions;"
);
