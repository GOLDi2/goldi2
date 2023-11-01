export function parse_and_compile_eqation(equation: string) {
  equation = equation.replace(/ /g, "");
  const equation_parts = equation.split("=");
  if (equation_parts.length != 2)
    throw new Error("Equation must have exactly one = sign");
  const left = equation_parts[0];
  let right = equation_parts[1];
  right = right.replace(/&/g, "&&");
  right = right.replace(/\+/g, "||");
  right = right.replace(/([^a-zA-Z])([a-zA-Z])/g, "$1!!input.$2");
  right = right.replace(/^([a-zA-Z])/g, "!!input.$1");
  const code = "(input)=>{return " + right + "}";
  return { variable: left, fun: eval(code) };
}
