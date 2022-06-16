import { Log } from "systems/log/Log";
import { TextRenderer } from "./TextRenderer";

export interface TextRendererFactoryConfig {
    colors: Record<string, string>,
    keywords: Record<string, string | number>,
}

export class TextRendererFactory {

    static instance: TextRendererFactory;
    
    private colors: Record<string, string>;
    private keywords: Record<string, string | number>;

    constructor(
        config: TextRendererFactoryConfig
    ) {
        this.colors = config.colors;
        this.keywords = config.keywords; 
    }

    static Initialize(
        config: TextRendererFactoryConfig
    ) {
        this.instance = new TextRendererFactory(config);
    }

    static Create(): TextRenderer {
        if (!this.instance) {
            Log.Error("Must initialize TextRendererFactory in startup.");
            throw new Error("Cannot create an instance of TextRenderer");
        }

        return this.instance.Create();
    }

    public Create(): TextRenderer {
        return new TextRenderer(this.keywords, this.colors);
    }
}