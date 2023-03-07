interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  categoriesSubscribed: string[];
  channelsSubscribed: string[];
}

export default User;
