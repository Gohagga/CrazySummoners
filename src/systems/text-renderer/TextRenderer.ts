import { Log } from "systems/log/Log";

export class TextRenderer {

    constructor(
        protected readonly keywords: Record<string, string | number>,
        protected readonly colors: Record<string, string>,
    ) {        
    }

    Render(text: string, data?: Record<string, string | number>) {

        let keys = Object.assign({}, this.keywords);
        keys = Object.assign(keys, data);
        
        try {
            let result = this.Sub(text, keys);
            return result;
        } catch (e: any) {
            Log.Error(e);
            return e;
        }
    }

    private Sub(text: string, keys?: Record<string, string | number>) {
        
        let t: string = text;
        let count: number;

        if (keys) {
            [t, count] = string.gsub(t, '{[-%w]*}', (a) => {
                let arg = a.substring(1, a.length - 1);
                return keys[arg].toString();
            });
        }

        [t, count] = string.gsub(t, '#[-%w]*:', (a) => {
            let arg = a.substring(1, a.length - 1);
            return this.colors[arg];
        });

        [t, count] = string.gsub(t, ':#', '|r');
        return t;
    }
}