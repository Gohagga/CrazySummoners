export const enum Level {
    All,
    Debug,
    Info,
    Warning,
    Error,
    Message,
    None
}

export const enum LogColor {
    Info        = '|cfffafaf0',
    Error       = '|cfff05050'

}

export class Log {
    
    public static Level = Level.Info;
    public static ShowOnlyToPlayer: player | null = null;
    
    static Message(...msg: any[]) {
        if (Number(this.Level) > Number(Level.Message)) return;
        print(...msg);
    }

    public static Info(...msg: any[]) {
        if (Number(this.Level) > Number(Level.Info)) return;
        if (this.ShowOnlyToPlayer && GetLocalPlayer() != this.ShowOnlyToPlayer) return;
        print(...msg);
    }

    public static Debug(...msg: any[]) {
        if (Number(this.Level) > Number(Level.Debug)) return;
        if (this.ShowOnlyToPlayer && GetLocalPlayer() != this.ShowOnlyToPlayer) return;
        print(...msg);
    }

    public static Error<Type extends new (...a: any[]) => any>(msgOrType: Type | string | number, ...msg: (string | number)[]) {
        if (Number(this.Level) > Number(Level.Error)) return;
        if (this.ShowOnlyToPlayer && GetLocalPlayer() != this.ShowOnlyToPlayer) return;

        let prefix: string = LogColor.Error;
        if (typeof(msgOrType) == 'object') prefix += '<' + (msgOrType as new () => any).name + '>';
        else prefix += msgOrType;
        
        // print("Type of first is ...", first.name, typeof(first));
        msg.push("|r");
        print(prefix, ...msg);
    }

    private static step = 0;
    public static ResetStep(to: number = 0) {
        this.step = to;
    }

    public static Step(...msg: any[]) {
        print(this.step++, ...msg);
    }
}
