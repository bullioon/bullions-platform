import type { EventPayloads } from "./EventTypes";

type Handler<T> = (payload: T) => void | Promise<void>;

class BullionsEventBus {

  private listeners = new Map<string, Handler<any>[]>();

  on<K extends keyof EventPayloads>(
    event: K,
    handler: Handler<EventPayloads[K]>
  ) {

    const list = this.listeners.get(event as string) ?? [];

    list.push(handler);

    this.listeners.set(event as string, list);

  }

  async emit<K extends keyof EventPayloads>(
    event: K,
    payload: EventPayloads[K]
  ) {

    const handlers = this.listeners.get(event as string) ?? [];

    for (const handler of handlers) {

      await handler(payload);

    }

  }

}

export const EventBus = new BullionsEventBus();
