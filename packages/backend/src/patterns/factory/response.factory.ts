import { V1Response } from "../../responses/v1-response";

export class ResponseFactory {
  static createV1Response(): V1Response {
    return V1Response.getInstance();
  }
}
