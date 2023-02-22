declare module 'passwd-linux' {
  function checkPassword(username: string, password: string, callback: (err: Error, response: boolean) => void): void;
}
