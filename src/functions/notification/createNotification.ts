import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import * as uuid from "uuid"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { notificationService } from "../../database/services"
import { CreateNotification } from "../../dtos/NotificationDto"
import schema from "../../../_schemas"
import Notification from "../../models/Notification"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & CreateNotification,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const id: string = uuid.v4();
      // the latter assignments always win
      const notification = await notificationService
        .createNotification({ id, ...(event.body as Notification) });

      return formatJSONResponse(201, notification);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.CreateNotification
);
