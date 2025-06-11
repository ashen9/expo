
export default class SingleBase extends cc.EventTarget  {

    private static instance: SingleBase;

    public static getInstance<T extends SingleBase>(this: new () => T): T {
        if (!(<any>this).instance) {
            (<any>this).instance = new this();
            (<any>this).instance.init();
        }
        return (<any>this).instance as T;
    }

    public static deleteInstance(): void {
        if (this.instance) {
            this.instance.clear();
            delete this.instance;
        }
    }

    public init(...args: any[]): void {
        // 初始化代码
    }

    public clear(): void {
        // 清理代码
    }
}
