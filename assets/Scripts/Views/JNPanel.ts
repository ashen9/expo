import { gameData } from "../data/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JNPanel extends cc.Component {
    @property(cc.Node)
    btnClose: cc.Node = null;

    onLoad() {
        this.btnClose.on(cc.Node.EventType.TOUCH_END, () => { this.node.active = false })
    }
}
