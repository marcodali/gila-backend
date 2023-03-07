import createDynamoDBClient from "../db";

// do not edit, import services
import EventService from "./eventService";
import NotificationService from "./notificationService";
import CategoryService from "./categoryService";
import UserService from "./userService";

// do not edit, managed by @durazno-technologies/create-dzn package
const {
  USERS_TABLE,
  CATEGORIES_TABLE,
  NOTIFICATIONS_TABLE,
  EVENTS_TABLE,
} = process.env;

// do not edit, export services
export const eventService = new EventService(createDynamoDBClient(), EVENTS_TABLE);
export const notificationService = new NotificationService(createDynamoDBClient(), NOTIFICATIONS_TABLE);
export const categoryService = new CategoryService(createDynamoDBClient(), CATEGORIES_TABLE);
export const userService = new UserService(createDynamoDBClient(), USERS_TABLE);
