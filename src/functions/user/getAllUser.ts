import {
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import middyfy from "../../core/middyfy";
import { formatJSONResponse } from "../../core/response";
import { userService } from "../../database/services";

export const handler: Handler = middyfy(
  async (): Promise<APIGatewayProxyResult> => {
    try {
      const users = await userService.getAllUser({ populate: true });
      console.log('encontre', users.length, 'users');
      return formatJSONResponse(200, users);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);