import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { eventService } from "../../database/services"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const events = await eventService.getAllEvents();
      return formatJSONResponse(200, events);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);
