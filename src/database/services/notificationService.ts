import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Notification from "../../models/Notification";
import schema from "../../../_schemas"

interface QueryOptions {
  populate: boolean;
}

class NotificationService {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string,
  ) {}

  async getAllNotifications(options: QueryOptions = { populate: false }): Promise<Notification[]> {
    const results = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return results.Items as Notification[];
  }

  async getNotification(id: string, options: QueryOptions = { populate: false }): Promise<Notification> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    if (!result.Item) {
      throw new Error('Notification Not Found');
    }

    return result.Item as Notification;
  }

  async createNotification(notification: Notification): Promise<Notification> {
    for (const key in notification) {
      if (!(key in schema.Notification.properties)) {
        throw new Error(`Property ${key} not compatible with Notification schema`);
      }
    }
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: notification,
      })
      .promise();

    return notification;
  }

  async updateNotification(id: string, partialNotification: Partial<Notification>): Promise<Notification> {
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
    for (const key in partialNotification) {
      if (!(key in schema.Notification.properties)) {
        throw new Error(`Property ${key} not compatible with Notification schema`);
      }
      params.UpdateExpression += `${propertiesCount > 0 ? ', ' : ''}#${key} = :${key}`;
      params.ExpressionAttributeNames[`#${key}`] = key;
      params.ExpressionAttributeValues[`:${key}`] = partialNotification[key];
      propertiesCount += 1;
    }
    if (propertiesCount === 0) {
      throw new Error("No properties found to update");
    }
    const updated = await this.docClient
      .update(params)
      .promise();

    return updated.Attributes as Notification;
  }

  async deleteNotification(id: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
  }
}

export default NotificationService;
