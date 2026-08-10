export class StrictJsonError extends Error {
  constructor(message, position) {
    super(`${message} at byte ${position}`);
    this.name = "StrictJsonError";
    this.position = position;
  }
}

export function parseStrictJson(source) {
  if (typeof source !== "string") throw new TypeError("JSON source must be a string");
  let index = 0;

  const fail = (message) => {
    throw new StrictJsonError(message, index);
  };

  const whitespace = () => {
    while (index < source.length && /[\t\n\r ]/.test(source[index])) index += 1;
  };

  const parseString = () => {
    if (source[index] !== '"') fail("expected string");
    index += 1;
    let out = "";
    while (index < source.length) {
      const char = source[index++];
      if (char === '"') return out;
      if (char === "\\") {
        if (index >= source.length) fail("unterminated escape");
        const escape = source[index++];
        const simple = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
        if (escape in simple) {
          out += simple[escape];
          continue;
        }
        if (escape === "u") {
          const hex = source.slice(index, index + 4);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("invalid unicode escape");
          out += String.fromCharCode(Number.parseInt(hex, 16));
          index += 4;
          continue;
        }
        fail("invalid escape");
      }
      if (char.charCodeAt(0) < 0x20) fail("control character in string");
      out += char;
    }
    fail("unterminated string");
  };

  const parseNumber = () => {
    const tail = source.slice(index);
    const match = tail.match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) fail("invalid number");
    index += match[0].length;
    const value = Number(match[0]);
    if (!Number.isFinite(value)) fail("non-finite number is not admitted");
    return value;
  };

  const parseArray = () => {
    index += 1;
    whitespace();
    const out = [];
    if (source[index] === "]") {
      index += 1;
      return out;
    }
    while (true) {
      out.push(parseValue());
      whitespace();
      if (source[index] === "]") {
        index += 1;
        return out;
      }
      if (source[index] !== ",") fail("expected comma in array");
      index += 1;
      whitespace();
    }
  };

  const parseObject = () => {
    index += 1;
    whitespace();
    const out = {};
    const keys = new Set();
    if (source[index] === "}") {
      index += 1;
      return out;
    }
    while (true) {
      if (source[index] !== '"') fail("expected object key");
      const key = parseString();
      if (keys.has(key)) fail(`duplicate object key ${JSON.stringify(key)}`);
      keys.add(key);
      whitespace();
      if (source[index] !== ":") fail("expected colon after object key");
      index += 1;
      whitespace();
      out[key] = parseValue();
      whitespace();
      if (source[index] === "}") {
        index += 1;
        return out;
      }
      if (source[index] !== ",") fail("expected comma in object");
      index += 1;
      whitespace();
    }
  };

  const parseValue = () => {
    whitespace();
    const char = source[index];
    if (char === '"') return parseString();
    if (char === "{") return parseObject();
    if (char === "[") return parseArray();
    if (char === "-" || /\d/.test(char || "")) return parseNumber();
    if (source.startsWith("true", index)) {
      index += 4;
      return true;
    }
    if (source.startsWith("false", index)) {
      index += 5;
      return false;
    }
    if (source.startsWith("null", index)) {
      index += 4;
      return null;
    }
    fail("unexpected token");
  };

  const value = parseValue();
  whitespace();
  if (index !== source.length) fail("trailing content");
  return value;
}
