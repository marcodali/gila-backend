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
      const user = await userService.getUser(id);
      await userService.deleteUser(user.id);

      return formatJSONResponse(204);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);