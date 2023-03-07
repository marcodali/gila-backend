import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import * as uuid from "uuid";
import middyfy from "../../core/middyfy";
import { formatJSONResponse } from "../../core/response";
import { userService } from "../../database/services";
import { CreateUser } from "../../dtos/UserDto";
import schema from "../../../_schemas"
import User from "../../models/User";

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & CreateUser,
  ): Promise<APIGatewayProxyResult> => {

    try {
      const id: string = uuid.v4();
      const user = await userService
        .createUser({id, ...(event.body as User)});

      return formatJSONResponse(201, user);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.CreateUser
);
