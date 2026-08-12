import path from "node:path";

const KEBAB_CASE_TYPESCRIPT_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.(?:test|spec))?\.(?:ts|tsx)$/u;

export const filenameCaseRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Require kebab-case filenames for dashboard TypeScript source files"
    },
    schema: [],
    messages: {
      invalid: "Filename '{{filename}}' must use kebab-case."
    }
  },
  create(context) {
    return {
      Program(node) {
        const filename = path.basename(context.filename);
        if (KEBAB_CASE_TYPESCRIPT_FILE.test(filename)) return;
        context.report({ node, messageId: "invalid", data: { filename } });
      }
    };
  }
};
