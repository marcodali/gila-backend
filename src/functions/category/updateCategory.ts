import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { categoryService } from "../../database/services"
import { UpdateCategory } from "../../dtos/CategoryDto"
import schema from "../../../_schemas"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & UpdateCategory,
  ): Promise<APIGatewayProxyResult> => {
    const id: string = event.pathParameters.id;
    const { body } = event;
    try {
      const category = await categoryService.getCategory(id);
      const updatedCategory = await categoryService.updateCategory(category.id, body);

      return formatJSONResponse(200, updatedCategory);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.UpdateCategory
);
