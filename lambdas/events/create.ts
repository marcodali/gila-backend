import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

//const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`;
const DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

export const handler = async (event: any = {}): Promise<any> => {

  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  item[PRIMARY_KEY] = uuidv4();
  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await db.put(params).promise();
    return { statusCode: 201, body: '' };
  } catch (dbError) {
    const errorResponse = DYNAMODB_EXECUTION_ERROR;
    return { statusCode: 500, body: errorResponse };
  }
};
