const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseView extends cc.Component {
    protected onLoad(): void {

    }

    protected onEnable(): void {
        this.node.scale = 0.8;
        cc.tween(this.node).to(0.1, { scale: 1.2 }).call(() => {
            cc.tween(this.node).to(0.1, { scale: 1 }).start();
        }).start();
    }
}
