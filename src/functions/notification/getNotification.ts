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
    const id: string = event.pathParameters.id;
    try {
      const notification = await notificationService.getNotification(id);

      return formatJSONResponse(200, notification);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  }
);
