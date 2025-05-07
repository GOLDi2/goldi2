import { APIClient, AuthenticationServiceTypes, LTIServiceTypes } from "@cross-lab-project/api-client";


  export { };

  declare global {
    namespace Express {
      export interface Request {
        apiClient: APIClient;
        async initApiClient(token?: string): void;
        user?: AuthenticationServiceTypes.User<"response">;
        lti?: {
          session: LTIServiceTypes.Session<"response">;
          isInstructor: boolean;
          isStudent: boolean;
          token: string;
        };
      }
    }
  }
