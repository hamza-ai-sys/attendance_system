const functionNodeTypes = new Set([
  "ArrowFunctionExpression",
  "FunctionDeclaration",
  "FunctionExpression"
]);

function getFunctionName(node) {
  if (node.id?.name) return node.id.name;

  const parent = node.parent;
  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier") {
    return parent.id.name;
  }
  if ((parent?.type === "Property" || parent?.type === "MethodDefinition") && parent.key.type === "Identifier") {
    return parent.key.name;
  }
  return null;
}

function isComponent(node) {
  const name = getFunctionName(node);
  return name !== null && /^[A-Z]/u.test(name);
}

function effectiveLines(sourceCode, node) {
  const lines = sourceCode.lines.slice(node.loc.start.line - 1, node.loc.end.line);
  let inBlockComment = false;

  return lines.reduce((count, line) => {
    const trimmed = line.trim();
    if (!trimmed) return count;
    if (inBlockComment) {
      if (trimmed.includes("*/")) inBlockComment = false;
      return count;
    }
    if (trimmed.startsWith("//")) return count;
    if (trimmed.startsWith("/*")) {
      inBlockComment = !trimmed.includes("*/");
      return count;
    }
    return count + 1;
  }, 0);
}

export const functionSizeRule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Limit ordinary functions and React components independently"
    },
    schema: [
      {
        type: "object",
        properties: {
          functionMax: { type: "integer", minimum: 1 },
          componentMax: { type: "integer", minimum: 1 }
        },
        additionalProperties: false
      }
    ],
    messages: {
      tooLarge:
        "{{kind}} '{{name}}' has {{actual}} effective lines. The project standard is {{maximum}}; extract a focused helper or component."
    }
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const options = context.options[0] ?? {};
    const functionMax = options.functionMax ?? 50;
    const componentMax = options.componentMax ?? 100;

    const check = (node) => {
      const component = isComponent(node);
      const maximum = component ? componentMax : functionMax;
      const actual = effectiveLines(sourceCode, node);
      if (actual <= maximum) return;

      context.report({
        node,
        messageId: "tooLarge",
        data: {
          kind: component ? "Component" : "Function",
          name: getFunctionName(node) ?? "anonymous",
          actual,
          maximum
        }
      });
    };

    return Object.fromEntries([...functionNodeTypes].map((type) => [type, check]));
  }
};
