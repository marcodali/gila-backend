import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_NAME || '';
const TABLE_CATEGORIES = process.env.TABLE_CATEGORIES || '';
const TABLE_EVENTS = process.env.TABLE_EVENTS || '';
const TABLE_NOTIFICATIONS = process.env.TABLE_NOTIFICATIONS || '';
const TABLE_USERS = process.env.TABLE_USERS || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {

  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);

  /**
   * scanning other tables
   */
  const responseCategories = await db.scan({ TableName: TABLE_CATEGORIES }).promise();
  const responseNotifications = await db.scan({ TableName: TABLE_NOTIFICATIONS }).promise();
  const responseUsers = await db.scan({ TableName: TABLE_USERS }).promise();

  console.log('responseCategories', responseCategories.Items);
  console.log('responseNotifications', responseNotifications.Items);
  console.log('responseUsers', responseUsers.Items);

  /**
   * Item received should have two properties;
   * category: string
   * message: not empty string
   * 
   * Once checked that the categories are valid,
   * we should query the database to find all the users
   * subscribed in the category.
   * 
   * Every user has a list of channels which represent
   * the notification types they wanted to be aware of.
   * In this time we must create a list of users to be
   * notified for every channel with a certain category and message.
   * 
   * By the end we must throttle the notification messages
   * so we can be sure not to saturate the channel send capacity.
   */

  item[PRIMARY_KEY] = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: '' };
  } catch (dbError: any) {
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
      DYNAMODB_EXECUTION_ERROR : RESERVED_RESPONSE;
    return { statusCode: 500, body: errorResponse };
  }
};
