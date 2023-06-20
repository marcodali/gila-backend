import * as cdkOutputs from '../cdk-outputs.json';
import {
  initializeUsersDatabase,
  initializeCategoriesDatabase,
  initializeNotificationsDatabase,
  clearUsersDatabase,
  clearCategoriesDatabase,
  clearNotificationsDatabase,
} from './database'

const GILA_API = cdkOutputs.GilaStack.apiUrl;

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
      .map((category: any) => category.name)
      .join('').toLowerCase();
    
    expect(notifications.length).toBe(3);
    expect(namesTogether).toContain("sms");
    expect(namesTogether).toContain("push");
    expect(namesTogether).toContain("mail");
  });
});
