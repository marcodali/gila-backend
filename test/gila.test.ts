import * as cdkOutputs from '../cdk-outputs.json';
import {
  initializeUsersDatabase,
  initializeCategoriesDatabase,
  initializeNotificationsDatabase,
  clearUsersDatabase,
  clearCategoriesDatabase,
  clearNotificationsDatabase,
  clearMessagesDatabase,
  clearEventsDatabase
} from './database'

const GILA_API = cdkOutputs.GilaStack.apiUrl;
jest.setTimeout(9000);

beforeAll(() => {
  return Promise.all([
    initializeUsersDatabase(),
    initializeCategoriesDatabase(),
    initializeNotificationsDatabase(),
  ]);
});

afterAll(() => {
  return Promise.all([
    clearUsersDatabase(),
    clearCategoriesDatabase(),
    clearNotificationsDatabase(),
    clearMessagesDatabase(),
    clearEventsDatabase(),
  ]);
});

describe('DynamoDB users table', () => {
  test('should have 3 items', async () => {
    const users = await (await fetch(`${GILA_API}users`)).json();
    
    expect(users.length).toBe(3);
  });

  test('Romina, Mirna and Miruca should be the names', async () => {
    const users = await (await fetch(`${GILA_API}users`)).json();
    const names = users.map((user: any) => user.name);
    
    expect(names).toContain('Romina');
    expect(names).toContain('Mirna');
    expect(names).toContain('Miruca');
  });
});

describe('DynamoDB categories table', () => {
  test('Films, Sports and Finance should be present', async () => {
    const categories = await (await fetch(`${GILA_API}categories`)).json();
    const names = categories.map((category: any) => category.name);
    
    expect(categories.length).toBe(3);
    expect(names).toEqual(expect.arrayContaining(["Films", "Sports", "Finance"]));
  });
});

describe('DynamoDB notifications table', () => {
  test('3 types of notifications should exists', async () => {
    const notifications = await (await fetch(`${GILA_API}notifications`)).json();
    const namesTogether = notifications
      .map((notification: any) => notification.type)
      .join('').toLowerCase();
    
    expect(notifications.length).toBe(3);
    expect(namesTogether).toContain("sms");
    expect(namesTogether).toContain("push");
    expect(namesTogether).toContain("mail");
  });
});

describe('First basic simple case', () => {
  test('The category "Sports" will have only 1 subscribed user "Mirna" with 1 notification channel "SMS"', async () => {
    // retrieve all collections
    const [u, c, n] = await Promise.all([
      fetch(`${GILA_API}users`),
      fetch(`${GILA_API}categories`),
      fetch(`${GILA_API}notifications`),
    ]);
    const [users, categories, notifications] = await Promise.all([
      u.json(), c.json(), n.json(),
    ]);
    
    // randomly choose one per catalog
    const myTestUser = users.find((user: any) => user.name == 'Mirna');
    const myTestCategory = categories.find((category: any) => category.name == 'Sports');
    const myTestNotification = notifications.find((notification: any) => notification.type == 'SMS');
    /**
     * subscribe the user to random category
     * with random notification channel also
     */
    const userPromise = fetch(`${GILA_API}users/${myTestUser.usersId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed: [myTestCategory.categoriesId],
        channels: [myTestNotification.notificationsId]
      }),
    });
    /**
     * append the usersId to the subscribedUsers of the category
     */
    const categoryPromise = fetch(`${GILA_API}categories/${myTestCategory.categoriesId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribedUsers: [myTestUser.usersId],
      }),
    });
    /**
     * append the usersId to the subscribedUsers of the notification
     */
    const notificationPromise = fetch(`${GILA_API}notifications/${myTestNotification.notificationsId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribedUsers: [myTestUser.usersId],
      }),
    });

    /**
     * Execute the Promises and verify the result
     */
    await Promise.all([userPromise, categoryPromise, notificationPromise]);
    const [u1, c1, n1] = await Promise.all([
      fetch(`${GILA_API}users/${myTestUser.usersId}`),
      fetch(`${GILA_API}categories/${myTestCategory.categoriesId}`),
      fetch(`${GILA_API}notifications/${myTestNotification.notificationsId}`),
    ]);
    const [user1, category1, notification1] = await Promise.all([
      u1.json(), c1.json(), n1.json(),
    ]);
    // user verification
    expect(user1.subscribed.length).toBe(1);
    expect(user1.subscribed[0]).toEqual(category1.categoriesId);
    expect(user1.channels.length).toBe(1);
    expect(user1.channels[0]).toEqual(notification1.notificationsId);
    // category verification
    expect(category1.subscribedUsers.length).toBe(1);
    expect(category1.subscribedUsers[0]).toEqual(user1.usersId);
    // notification verification
    expect(notification1.subscribedUsers.length).toBe(1);
    expect(notification1.subscribedUsers[0]).toEqual(user1.usersId);

    /**
     * Generate the event with category and message
     * and verify the result
     */
    const message = "Manchester City va por el sextete";
    const myEvent = await (await fetch(`${GILA_API}events`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: "Sports",
        message,
      }),
    })).text();
    
    expect(myEvent).toContain('1 total users have been notified');
    expect(myEvent).toContain('through 1 notification channels');
    expect(myEvent).toContain('(SMS)');

    const events = await (await fetch(`${GILA_API}events`)).json();
    const [lastEvent] = events;
    
    expect(events.length).toBe(1);
    expect(lastEvent.messageContent).toEqual(message);
    expect(lastEvent.channelType).toEqual("SMS");
    expect(lastEvent.category).toEqual("Sports");
    expect(lastEvent.usersNotified.length).toBe(1);
    expect(lastEvent.usersNotified[0]).toEqual(myTestUser.usersId);
  });
});
