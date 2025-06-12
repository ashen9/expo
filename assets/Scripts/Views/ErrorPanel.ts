// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ErrorPanel extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Node)
    btnClose: cc.Node = null;

    @property(cc.Node)
    btnSure: cc.Node = null;

    @property
    text: string = '错误日志';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onLoad() {
        this.btnClose.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
        });
        this.btnSure.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.label.string === '网络错误,请刷新后重试') {
                window.location.reload();
            } else {
                this.node.active = false;
            }
        });
    }

    showError(msg: string) {
        this.label.string = msg;
    }

    // update (dt) {}
}
