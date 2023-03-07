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
    const id: string = event.pathParameters.id;
    try {
      const event = await eventService.getEvent(id);
      await eventService.deleteEvent(event.id);

      return formatJSONResponse(204);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);
