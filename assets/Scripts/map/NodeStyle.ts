import { GameEvents } from "../GameConst";
import { gameData } from "../data/GameData";
import { NodeInfo } from "../data/GameInterface";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeStyle extends cc.Component {
    // @property(cc.Node)
    checkNode: cc.Node = null;

    @property(Number)
    public nodeType: number = 1

    public info: NodeInfo = null;



    protected onLoad(): void {
        this.checkNode = this.node.getChildByName("check")
    }

    public init(info: NodeInfo) {
        this.info = info;
    }

    onBtnClick() {
        if (this.info) {
            this.checkNode.active = true;
            gameData.curNodeInfo = this.info;
            EVT.emit(GameEvents.SHOW_NODE_INFO_PANEL);
            console.log(this.info.id, this.info);
            return
        }
        Toast.showToast("node info is fail");
    }
}
