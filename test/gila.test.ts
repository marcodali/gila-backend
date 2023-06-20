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
jest.setTimeout(10000);

beforeEach(() => {
  return Promise.all([
    initializeUsersDatabase(),
    initializeCategoriesDatabase(),
    initializeNotificationsDatabase(),
  ]);
});

afterEach(() => {
  return Promise.all([
    clearUsersDatabase(),
    clearCategoriesDatabase(),
    clearNotificationsDatabase(),
    clearMessagesDatabase(),
    clearEventsDatabase(),
  ]);
});

/* 
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
 */

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

describe('Very complex case', () => {
  test('Category "Films" has 3 users subscribed; "Mirna" has 3 channels, "Romina" has 2, "Miruca" only 1', async() => {
    // retrieve all collections
    const [u, c, n] = await Promise.all([
      fetch(`${GILA_API}users`),
      fetch(`${GILA_API}categories`),
      fetch(`${GILA_API}notifications`),
    ]);
    const [users, categories, notifications] = await Promise.all([
      u.json(), c.json(), n.json(),
    ]);
    
    // Choose the targets from the catalogs
    const mirna = users.find((user: any) => user.name == 'Mirna');
    const romina= users.find((user: any) => user.name == 'Romina');
    const miruca= users.find((user: any) => user.name == 'Miruca');
    const filmsCategory = categories.find((category: any) => category.name == 'Films');
    const pushNotification= notifications.find((notification: any) => notification.type == 'Push Notification');
    const mailNotification= notifications.find((notification: any) => notification.type == 'E-mail');
    const smsNotification = notifications.find((notification: any) => notification.type == 'SMS');
    /**
     * Subscribe the 3 users to Films category
     * with the following setup for channels:
     * 
     * Mirna => [Push, Mail, SMS]
     * Romina => [Mail, SMS]
     * Miruca => [SMS]
     */
    const mirnaPromise = fetch(`${GILA_API}users/${mirna.usersId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed: [filmsCategory.categoriesId],
        channels: [
          pushNotification.notificationsId,
          mailNotification.notificationsId,
          smsNotification.notificationsId,
        ]
      }),
    });
    const rominaPromise = fetch(`${GILA_API}users/${romina.usersId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed: [filmsCategory.categoriesId],
        channels: [
          mailNotification.notificationsId,
          smsNotification.notificationsId,
        ]
      }),
    });
    const mirucaPromise = fetch(`${GILA_API}users/${miruca.usersId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribed: [filmsCategory.categoriesId],
        channels: [smsNotification.notificationsId]
      }),
    });
    /**
     * append the usersId to the subscribedUsers of the category
     */
    const categoryPromise = fetch(`${GILA_API}categories/${filmsCategory.categoriesId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribedUsers: [mirna.usersId, romina.usersId, miruca.usersId],
      }),
    });
    /**
     * append the usersId to the subscribedUsers of the notifications
     */
    const pushNotificationPromise = fetch(`${GILA_API}notifications/${pushNotification.notificationsId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribedUsers: [mirna.usersId],
      }),
    });
    const mailNotificationPromise = fetch(`${GILA_API}notifications/${mailNotification.notificationsId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribedUsers: [mirna.usersId, romina.usersId],
      }),
    });
    const smsNotificationPromise = fetch(`${GILA_API}notifications/${smsNotification.notificationsId}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscribedUsers: [mirna.usersId, romina.usersId, miruca.usersId],
      }),
    });

    /**
     * Execute the Promises and verify the result
     */
    await Promise.all([
      mirnaPromise,
      rominaPromise,
      mirucaPromise,
      categoryPromise,
      pushNotificationPromise,
      mailNotificationPromise,
      smsNotificationPromise,
    ]);
    const [u1, u2, u3, c1, n1, n2, n3] = await Promise.all([
      fetch(`${GILA_API}users/${mirna.usersId}`),
      fetch(`${GILA_API}users/${romina.usersId}`),
      fetch(`${GILA_API}users/${miruca.usersId}`),
      fetch(`${GILA_API}categories/${filmsCategory.categoriesId}`),
      fetch(`${GILA_API}notifications/${pushNotification.notificationsId}`),
      fetch(`${GILA_API}notifications/${mailNotification.notificationsId}`),
      fetch(`${GILA_API}notifications/${smsNotification.notificationsId}`),
    ]);
    const [
      mirna1, romina1, miruca1,
      category1,
      pushNotification1, mailNotification1, smsNotification1, 
    ] = await Promise.all([
      u1.json(), u2.json(), u3.json(),
      c1.json(),
      n1.json(), n2.json(), n3.json(),
    ]);
    // users verification [Mirna, Romina, Miruca]
    expect(mirna1.subscribed.length).toBe(1);
    expect(mirna1.subscribed[0]).toEqual(category1.categoriesId);
    expect(mirna1.channels.length).toBe(3);
    expect(mirna1.channels).toEqual(expect.arrayContaining([
      pushNotification1.notificationsId,
      mailNotification1.notificationsId,
      smsNotification1.notificationsId,
    ]));
    expect(romina1.subscribed.length).toBe(1);
    expect(romina1.subscribed[0]).toEqual(category1.categoriesId);
    expect(romina1.channels.length).toBe(2);
    expect(romina1.channels).toEqual(expect.arrayContaining([
      mailNotification1.notificationsId,
      smsNotification1.notificationsId,
    ]));
    expect(miruca1.subscribed.length).toBe(1);
    expect(miruca1.subscribed[0]).toEqual(category1.categoriesId);
    expect(miruca1.channels.length).toBe(1);
    expect(miruca1.channels).toEqual(expect.arrayContaining([
      smsNotification1.notificationsId,
    ]));
    // category verification [Films]
    expect(category1.subscribedUsers.length).toBe(3);
    expect(category1.subscribedUsers).toEqual(expect.arrayContaining([
      mirna1.usersId,
      romina1.usersId,
      miruca1.usersId,
    ]));
    // notification verification [push, mail, sms]
    expect(pushNotification1.subscribedUsers.length).toBe(1);
    expect(pushNotification1.subscribedUsers[0]).toEqual(mirna.usersId);
    expect(mailNotification1.subscribedUsers.length).toBe(2);
    expect(mailNotification1.subscribedUsers).toEqual(expect.arrayContaining([
      mirna1.usersId,
      romina1.usersId,
    ]));
    expect(smsNotification1.subscribedUsers.length).toBe(3);
    expect(smsNotification1.subscribedUsers).toEqual(expect.arrayContaining([
      mirna1.usersId,
      romina1.usersId,
      miruca1.usersId,
    ]));

    /**
     * Generate the event with category and message
     * and verify the result
     */
    const message = "Mario Bros gana el Oscar gracias a Peaches";
    const myEvent = await (await fetch(`${GILA_API}events`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: "Films",
        message,
      }),
    })).text();
    
    expect(myEvent).toContain('6 total users have been notified');
    expect(myEvent).toContain('through 3 notification channels');
    expect(myEvent).toContain('Push Notification');
    expect(myEvent).toContain('E-mail');
    expect(myEvent).toContain('SMS');

    const events = await (await fetch(`${GILA_API}events`)).json();
    const pushEvent = events.find((event: any) => event.channelType == 'Push Notification');
    const mailEvent = events.find((event: any) => event.channelType == 'E-mail');
    const smsEvent  = events.find((event: any) => event.channelType == 'SMS');
    
    expect(events.length).toBe(3);
    
    expect(pushEvent.messageContent).toEqual(message);
    expect(pushEvent.channelType).toEqual("Push Notification");
    expect(pushEvent.category).toEqual("Films");
    expect(pushEvent.usersNotified.length).toBe(1);
    expect(pushEvent.usersNotified[0]).toEqual(mirna.usersId);
    
    expect(mailEvent.messageContent).toEqual(message);
    expect(mailEvent.channelType).toEqual("E-mail");
    expect(mailEvent.category).toEqual("Films");
    expect(mailEvent.usersNotified.length).toBe(2);
    expect(mailEvent.usersNotified).toEqual(expect.arrayContaining([
      mirna1.usersId,
      romina1.usersId,
    ]));
    
    expect(smsEvent.messageContent).toEqual(message);
    expect(smsEvent.channelType).toEqual("SMS");
    expect(smsEvent.category).toEqual("Films");
    expect(smsEvent.usersNotified.length).toBe(3);
    expect(smsEvent.usersNotified).toEqual(expect.arrayContaining([
      mirna1.usersId,
      romina1.usersId,
      miruca1.usersId,
    ]));
  });
});
