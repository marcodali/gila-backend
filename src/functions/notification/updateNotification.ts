import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { notificationService } from "../../database/services"
import { UpdateNotification } from "../../dtos/NotificationDto"
import schema from "../../../_schemas"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & UpdateNotification,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    const { body } = event;
    try {
      const notification = await notificationService.getNotification(id);
      const updatedNotification = await notificationService.updateNotification(notification.id, body);

      return formatJSONResponse(200, updatedNotification);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.UpdateNotification
);
