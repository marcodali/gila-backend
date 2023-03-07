import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { eventService } from "../../database/services"
import { UpdateEvent } from "../../dtos/EventDto"
import schema from "../../../_schemas"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & UpdateEvent,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    const { body } = event;
    try {
      const event = await eventService.getEvent(id);
      const updatedEvent = await eventService.updateEvent(event.id, body);

      return formatJSONResponse(200, updatedEvent);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.UpdateEvent
);
