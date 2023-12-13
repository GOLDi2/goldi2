export async function generateSubmissionCode(
  output_matrix: number[],
  identity: string = "goldi"
) {
  const salt = new Uint8Array(
    Uint32Array.from([Math.floor(Date.now() / 1000)]).buffer
  );
  const hashable = new TextEncoder().encode(
    identity + JSON.stringify(output_matrix) + salt.toString()
  );
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", hashable));
  const saltedHash = new Uint8Array([...salt, ...hash]);
  const code = btoa(String.fromCharCode(...saltedHash)).slice(0, 10);
  return code;
}

export async function checkSubmissionCode(
  output_matrix: number[],
  identity: string,
  code: string
) {
  const saltedHash = new Uint8Array(
    atob(code)
      .split("")
      .map((c) => c.charCodeAt(0))
  );
  const salt = saltedHash.slice(0, 4);
  const time = new Date(new Uint32Array(salt.buffer)[0] * 1000);
  const hashable = new TextEncoder().encode(
    identity + JSON.stringify(output_matrix) + salt.toString()
  );
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", hashable));
  const saltedHash2 = new Uint8Array([...salt, ...hash]);
  const code2 = btoa(String.fromCharCode(...saltedHash2)).slice(0, 10);
  return { time, valid: code === code2 };
}
