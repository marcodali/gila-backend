import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import * as uuid from "uuid"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { eventService } from "../../database/services"
import { CreateEvent } from "../../dtos/EventDto"
import schema from "../../../_schemas"
import Event from "../../models/Event"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & CreateEvent,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const id: string = uuid.v4();
      // the latter assignments always win
      const event = await eventService
        .createEvent({ id, ...(event.body as Event) });

      return formatJSONResponse(201, event);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.CreateEvent
);
