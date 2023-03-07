import {
  APIGatewayEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda"
import * as uuid from "uuid"
import middyfy from "../../core/middyfy"
import { formatJSONResponse } from "../../core/response"
import { categoryService } from "../../database/services"
import { CreateCategory } from "../../dtos/CategoryDto"
import schema from "../../../_schemas"
import Category from "../../models/Category"

export const handler: Handler = middyfy(
  async (
    event: APIGatewayEvent & CreateCategory,
  ): Promise<APIGatewayProxyResult> => {
    try {
      const id: string = uuid.v4();
      // the latter assignments always win
      const category = await categoryService
        .createCategory({ id, ...(event.body as Category) });

      return formatJSONResponse(201, category);
    } catch (err) {
      console.error(err);
      return formatJSONResponse(400, err.message);
    }
  },
  schema.CreateCategory
);
