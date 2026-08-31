// eval() nahi use kiya - koi bhi "process.exit(1)" bhej ke server gira sakta tha

function tokenize(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    if (ch === " ") { i++; continue; }
    if ("+-*/()".includes(ch)) { tokens.push({ type: "op", value: ch }); i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let num = "";
      while (i < input.length && /[0-9.]/.test(input[i])) { num += input[i]; i++; }
      if ((num.match(/\./g) || []).length > 1) throw new Error("Invalid number: " + num);
      tokens.push({ type: "num", value: parseFloat(num) });
      continue;
    }
    throw new Error("Unexpected character: " + ch);
  }
  return tokens;
}

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];

  function expression() {
    let left = term();
    while (peek() && (peek().value === "+" || peek().value === "-")) {
      const op = tokens[pos++].value;
      const right = term();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function term() {
    let left = factor();
    while (peek() && (peek().value === "*" || peek().value === "/")) {
      const op = tokens[pos++].value;
      const right = factor();
      if (op === "/" && right === 0) throw new Error("Cannot divide by zero");
      left = op === "/" ? left / right : left * right;
    }
    return left;
  }

  function factor() {
    const t = peek();
    if (!t) throw new Error("Unexpected end of expression");
    if (t.value === "-") { pos++; return -factor(); }
    if (t.value === "(") {
      pos++;
      const v = expression();
      if (!peek() || peek().value !== ")") throw new Error("Expected )");
      pos++;
      return v;
    }
    if (t.type === "num") { pos++; return t.value; }
    throw new Error("Unexpected token: " + t.value);
  }

  const result = expression();
  if (pos < tokens.length) throw new Error("Unexpected token: " + tokens[pos].value);
  return result;
}

export function calculate(input) {
  if (typeof input !== "string" || input.trim() === "") throw new Error("Expression is empty");
  if (input.length > 100) throw new Error("Expression is too long");
  const result = parse(tokenize(input));
  if (!Number.isFinite(result)) throw new Error("Result is not a finite number");
  return result;
}
