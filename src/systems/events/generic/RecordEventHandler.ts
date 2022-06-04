export class RecordEventHandler<EventCallback> {

    public readonly Subscriptions: Record<number, EventCallback> = {};

    public Subscribe(id: number, callback: EventCallback): void {
        this.Subscriptions[id] = callback;
    }
}

export type GenericEventCallback = () => void;