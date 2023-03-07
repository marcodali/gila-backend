import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import middyfy from "../../core/middyfy";
import { formatJSONResponse } from "../../core/response";
import { userService } from "../../database/services";
import { UpdateUser } from "../../dtos/UserDto";
import schema from "../../../_schemas"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & UpdateUser,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    const { body } = event;
    try {
      const user = await userService.getUser(id);
      const updatedUser = await userService.updateUser(user.id, body);

      return formatJSONResponse(200, updatedUser);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.UpdateUser
);