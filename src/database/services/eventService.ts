import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Event from "../../models/Event";
import schema from "../../../_schemas"

interface QueryOptions {
  populate: boolean;
}

class EventService {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string,
  ) {}

  async getAllEvents(options: QueryOptions = { populate: false }): Promise<Event[]> {
    const results = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return results.Items as Event[];
  }

  async getEvent(id: string, options: QueryOptions = { populate: false }): Promise<Event> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
    if (!result.Item) {
      throw new Error('Event Not Found');
    }

    return result.Item as Event;
  }

  async createEvent(event: Event): Promise<Event> {
    for (const key in event) {
      if (!(key in schema.Event.properties)) {
        throw new Error(`Property ${key} not compatible with Event schema`);
      }
    }
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: event,
      })
      .promise();

    return event;
  }

  async updateEvent(id: string, partialEvent: Partial<Event>): Promise<Event> {
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
    for (const key in partialEvent) {
      if (!(key in schema.Event.properties)) {
        throw new Error(`Property ${key} not compatible with Event schema`);
      }
      params.UpdateExpression += `${propertiesCount > 0 ? ', ' : ''}#${key} = :${key}`;
      params.ExpressionAttributeNames[`#${key}`] = key;
      params.ExpressionAttributeValues[`:${key}`] = partialEvent[key];
      propertiesCount += 1;
    }
    if (propertiesCount === 0) {
      throw new Error("No properties found to update");
    }
    const updated = await this.docClient
      .update(params)
      .promise();

    return updated.Attributes as Event;
  }

  async deleteEvent(id: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { id },
      })
      .promise();
  }
}

export default EventService;
