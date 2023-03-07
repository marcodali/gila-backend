import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Category from "../../models/Category";
import schema from "../../../_schemas"

interface QueryOptions {
  populate: boolean;
}

class CategoryService {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string,
  ) {}

  async getAllCategories(options: QueryOptions = { populate: false }): Promise<Category[]> {
    const results = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return results.Items as Category[];
  }

  async getCategory(id: string, options: QueryOptions = { populate: false }): Promise<Category> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    if (!result.Item) {
      throw new Error('Category Not Found');
    }

    return result.Item as Category;
  }

  async createCategory(category: Category): Promise<Category> {
    for (const key in category) {
      if (!(key in schema.Category.properties)) {
        throw new Error(`Property ${key} not compatible with Category schema`);
      }
    }
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: category,
      })
      .promise();

    return category;
  }

  async updateCategory(id: string, partialCategory: Partial<Category>): Promise<Category> {
    const params = {
      TableName: this.tableName,
      Key: { id },
      UpdateExpression:
        "set",
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
      ReturnValues: "ALL_NEW",
    };
    let propertiesCount = 0;
    for (const key in partialCategory) {
      if (!(key in schema.Category.properties)) {
        throw new Error(`Property ${key} not compatible with Category schema`);
      }
      params.UpdateExpression += `${propertiesCount > 0 ? ', ' : ''}#${key} = :${key}`;
      params.ExpressionAttributeNames[`#${key}`] = key;
      params.ExpressionAttributeValues[`:${key}`] = partialCategory[key];
      propertiesCount += 1;
    }
    if (propertiesCount === 0) {
      throw new Error("No properties found to update");
    }
    const updated = await this.docClient
      .update(params)
      .promise();

    return updated.Attributes as Category;
  }

  async deleteCategory(id: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
  }
}

export default CategoryService;
