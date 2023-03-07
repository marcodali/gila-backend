import Event from "../models/Event";

export interface CreateEvent {
  body: Event;
}

export interface UpdateEvent {
  body: Partial<Event>;
}
