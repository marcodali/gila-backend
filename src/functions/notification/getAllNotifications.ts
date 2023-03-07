import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { notificationService } from "../../database/services"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const notifications = await notificationService.getAllNotifications();
      return formatJSONResponse(200, notifications);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);
