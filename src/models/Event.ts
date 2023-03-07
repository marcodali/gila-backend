// do not edit, properties managed by @durazno-technologies/create-dzn package
interface Event {
  id?: string;
  datetime: number;
  categoryList: string[];
  channelList: string[];
  userList: string[];
}

export default Event;
