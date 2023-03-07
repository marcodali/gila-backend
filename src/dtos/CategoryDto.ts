import Category from "../models/Category";

export interface CreateCategory {
  body: Category;
}

export interface UpdateCategory {
  body: Partial<Category>;
}
