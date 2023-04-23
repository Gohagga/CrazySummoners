export class RecordEventBusHandler<EventCallback> {

    public readonly Subscriptions: Record<number, EventCallback[]> = {};

    public Subscribe(id: number, callback: EventCallback): void {
        (this.Subscriptions[id] ||= []).push(callback);
    }
}

export type GenericEventCallback = () => void;