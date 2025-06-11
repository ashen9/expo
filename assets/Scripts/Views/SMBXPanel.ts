import { gameData } from "../data/GameData";
import { EVT } from "../event/EventCenter";
import { GameEvents } from "../GameConst";
import HttpMgr from "../network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SMBXPanel extends cc.Component {
    @property(cc.Node)
    btnClose: cc.Node = null;

    @property(cc.Node)
    btn: cc.Node = null;

    @property(cc.Label)
    zz: cc.Label = null;

    onLoad() {
        this.btnClose.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false
            EVT.emit(GameEvents.REFRESH_SCORE);
        })

        this.btn.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false
            EVT.emit(GameEvents.REFRESH_SCORE);
        })
    }

    protected onEnable(): void {
        this.addZZ()
    }

    addZZ() {
        var rd = Math.random()
        var zz = rd < 0.5 ? 1 : rd > 0.75 ? 2 : 1
        zz += 1
        this.zz.string = "珍珠 " + zz + " 个"
        gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + zz) + ""
        HttpMgr.instance.editUserInfo({})
    }
}
