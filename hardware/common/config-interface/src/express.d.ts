export {};

declare global {
  namespace Express {
    export interface Request {
      language: string;
      authorized: boolean;
    }
  }
}
