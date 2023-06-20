import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = process.env.TABLE_NAME || '';
const TABLE_CATEGORIES = process.env.TABLE_CATEGORIES || '';
const TABLE_MESSAGES = process.env.TABLE_MESSAGES || '';
const TABLE_NOTIFICATIONS = process.env.TABLE_NOTIFICATIONS || '';
const TABLE_USERS = process.env.TABLE_USERS || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';

const db = new AWS.DynamoDB.DocumentClient();

const RESERVED_RESPONSE = `Error: You're using AWS reserved keywords as attributes`,
  DYNAMODB_EXECUTION_ERROR = `Error: Execution update, caused a Dynamodb error, please take a look at your CloudWatch Logs.`;

type usersMap = {
  [key: string]: string[];
};

export const handler = async (event: any = {}): Promise<any> => {

  /**
   * Step [1]
   * Item received should have two properties;
   * category: string
   * message: not empty string
   * 
   * Step [2]
   * Once checked that the categories are valid,
   * we should query the database to find all the users
   * subscribed in the category.
   * 
   * Step [3]
   * Every user has a list of channels which represent
   * the notification types they wanted to be aware of.
   * In this time we must create a list of users to be
   * notified for every channel with a certain category and message.
   * 
   * Step [4]
   * By the end we must throttle the notification messages
   * so we can be sure not to saturate the channel send capacity.
   */

  // Step [1]
  if (!event.body) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter body' };
  }
  const item = typeof event.body == 'object' ? event.body : JSON.parse(event.body);
  if (!item.category) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter category' };
  }
  if (!item.message) {
    return { statusCode: 400, body: 'invalid request, you are missing the parameter message' };
  }

  /**
   * save the message for future references
   */
  const myMessage = { messagesId: uuidv4(), content: item.message };
  try {
    await db.put({
      TableName: TABLE_MESSAGES,
      Item: myMessage,
    }).promise();
  } catch (dbError: any) {
    console.error(dbError);
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
      RESERVED_RESPONSE: DYNAMODB_EXECUTION_ERROR;
    return { statusCode: 500, body: errorResponse };
  }

  // Step [2]
  const responseCategories = await db.scan({ TableName: TABLE_CATEGORIES }).promise();
  const categoryFound = responseCategories.Items?.find((category => category.name == item.category));
  if (!categoryFound) {
    return {
      statusCode: 400, body: `invalid request, invalid category ${item.category
        }, should be one of ${responseCategories.Items?.map(c => c.name)}`
    };
  }
  const categoryUsersIds = new Set(categoryFound.subscribedUsers);

  /**
   * Looking for users subscribed in the category inside the DB
   */
  const myAvailableUsers = new Map<string, any>();
  const responseUsers = await db.scan({ TableName: TABLE_USERS }).promise();
  const categoryUsers = responseUsers.Items?.filter(user => categoryUsersIds.has(user.usersId));
  categoryUsers?.map(user => myAvailableUsers.set(user.usersId, user));
  console.log('filtered users by category', myAvailableUsers.keys(), myAvailableUsers.values());

  // Step [3]
  const responseNotifications = await db.scan({ TableName: TABLE_NOTIFICATIONS }).promise();
  const myChannels: usersMap = {};
  responseNotifications.Items?.forEach(channel => {
    myChannels[channel.notificationsId] = [];
  });
  for (const [usersId, user] of myAvailableUsers) {
    user.channels.forEach((channelId: string) => myChannels[channelId].push(usersId));
  }
  
  // Step [4]
  const counterChannels: string[] = [];
  let counterUsers = 0;
  const eventsCreatePromises = [];
  for (const key of Object.keys(myChannels)) {
    const channel = responseNotifications.Items?.find(
      notification => notification.notificationsId == key
    );
    counterUsers += myChannels[key].length
    if (channel && myChannels[key].length > 0) {
      counterChannels.push(channel.type);
      console.log(
        myChannels[key].length,
        'users are waiting to recive the message from',
        channel.type,
        'channel',
      );
      const eventParams = {
        TableName: TABLE_NAME,
        Item: {
          [PRIMARY_KEY]: uuidv4(),
          createdAt: (new Date()).toLocaleString(),
          messagesId: myMessage.messagesId,
          messageContent: myMessage.content,
          channelType: channel.type,
          notificationsId: channel.notificationsId,
          categoriesId: categoryFound.categoriesId,
          category: categoryFound.name,
          usersNotified: myChannels[key],
        },
      };
      eventsCreatePromises.push(db.put(eventParams).promise())
    }
  }

  try {
    await Promise.all(eventsCreatePromises);
  } catch (dbError: any) {
    console.error(dbError);
    const errorResponse = dbError.code === 'ValidationException' && dbError.message.includes('reserved keyword') ?
      RESERVED_RESPONSE: DYNAMODB_EXECUTION_ERROR;
    return { statusCode: 500, body: errorResponse };
  }

  // final operational report
  return {
    statusCode: 201,
    body: `${counterUsers} total users have been notified through ${
      counterChannels.length
    } notification channels (${counterChannels})`
  };
};
