import * as crypto from "crypto";
import * as cdkOutputs from '../cdk-outputs.json';

const GILA_API = cdkOutputs.GilaStack.apiUrl;

export const initializeUsersDatabase = async () => {
    const bodys = ["Romina", "Mirna", "Miruca"].map(name => JSON.stringify({
      name,
      email: `${name}@hotmail.com`,
      phone: "123 456 789",
      channels: [],
      subscribed: [],
    }));
    await Promise.all(bodys.map(body => fetch(`${GILA_API}users`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })));
};
  
export const initializeCategoriesDatabase = async () => {
    const bodys = ["Sports", "Finance", "Films"].map(name => JSON.stringify({
      name,
      subscribedUsers: [],
    }));
    await Promise.all(bodys.map(body => fetch(`${GILA_API}categories`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })));
};
  
export const initializeNotificationsDatabase = async () => {
    const bodys = ["SMS", "E-mail", "Push Notification"].map(name => JSON.stringify({
      name,
      subscribedUsers: [],
      endpoint: `https://api.${name.replace(/[^a-zA-Z]/g, "").toLowerCase()}.com`,
      apiKey: crypto.randomBytes(15).toString('hex'),
      rateLimitPerSecond: 100,
    }));
    await Promise.all(bodys.map(body => fetch(`${GILA_API}notifications`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body,
    })));
};
  
export const clearUsersDatabase = async () => {
    const users = await (await fetch(`${GILA_API}users`)).json();
    await Promise.all(users.map((user: any) => fetch(`${
      GILA_API
    }users/${user.usersId}`, {
      method: 'DELETE',
    })));
};
  
export const clearCategoriesDatabase = async () => {
    const categories = await (await fetch(`${GILA_API}categories`)).json();
    await Promise.all(categories.map((category: any) => fetch(`${
      GILA_API
    }categories/${category.categoriesId}`, {
      method: 'DELETE',
    })));
};
  
export const clearNotificationsDatabase = async () => {
    const notifications = await (await fetch(`${GILA_API}notifications`)).json();
    await Promise.all(notifications.map((notification: any) => fetch(`${
      GILA_API
    }notifications/${notification.notificationsId}`, {
      method: 'DELETE',
    })));
};
