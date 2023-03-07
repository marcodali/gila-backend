import Notification from "../models/Notification";

export interface CreateNotification {
  body: Notification;
}

export interface UpdateNotification {
  body: Partial<Notification>;
}
