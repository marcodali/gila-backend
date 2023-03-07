import { DocumentClient } from "aws-sdk/clients/dynamodb";
import User from "../../models/User";
import schema from "../../../_schemas"

interface QueryOptions {
  populate: boolean;
}

class UserService {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string,
  ) {}

  async getAllUser(options: QueryOptions = { populate: false }): Promise<User[]> {
    const results = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return results.Items as User[];
  }

  async getUser(id: string, options: QueryOptions = { populate: false }): Promise<User> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    if (!result.Item) {
      throw new Error('User Not Found');
    }

    return result.Item as User;
  }

  async createUser(user: User): Promise<User> {
    for (const key in user) {
      if (!(key in schema.User.properties)) {
        throw new Error(`Property ${key} not compatible with User schema`);
      }
    }
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: user,
      })
      .promise();

    return user;
  }

  async updateUser(id: string, partialUser: Partial<User>): Promise<User> {
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
    for (const key in partialUser) {
      if (!(key in schema.User.properties)) {
        throw new Error(`Property ${key} not compatible with User schema`);
      }
      params.UpdateExpression += `${propertiesCount > 0 ? ', ' : ''}#${key} = :${key}`;
      params.ExpressionAttributeNames[`#${key}`] = key;
      params.ExpressionAttributeValues[`:${key}`] = partialUser[key];
      propertiesCount += 1;
    }
    if (propertiesCount === 0) {
      throw new Error("No properties found to update");
    }
    const updated = await this.docClient
      .update(params)
      .promise();

    return updated.Attributes as User;
  }

  async deleteUser(id: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
  }
}

export default UserService;