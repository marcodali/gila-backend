import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import middyfy from "../../core/middyfy";
import { formatJSONResponse } from "../../core/response";
import { userService } from "../../database/services";

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    try {
      const user = await userService.getUser(id, { populate: true });

      return formatJSONResponse(200, user);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);