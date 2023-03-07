import User from "../models/User";

export interface CreateUser {
  body: User;
}

export interface UpdateUser {
  body: Partial<User>;
}
