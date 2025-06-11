import { gameData } from "../data/GameData";
import { RES } from "../manager/ResourceManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SJPanel extends cc.Component {
    @property(cc.Label)
    nodeNumber: cc.Label = null;

    @property(cc.Node)
    lvimg: cc.Node = null;

    @property(cc.Label)
    lvstring: cc.Label = null;

    @property(cc.Label)
    bk: cc.Label = null;

    @property(cc.Label)
    zz: cc.Label = null;

    // onLoad() {
    //     this.bk.string = gameData.userInfo.Score1 + ""
    //     this.zz.string = gameData.userInfo.Score3 + ""
    // }

    init(dat) {
        var t = 3
        this.nodeNumber.string = t + ""
        var ti = setInterval(() => {
            t--
            if (t < 0) {
                clearInterval(ti)
                this.onClose()
            } else {
                this.nodeNumber.string = t + ""
            }
        }, 1000)

        this.lvstring.string = dat[1]

        RES.loadTexture2DRes("Textures/海-成就兑换/" + dat[1], (sp: cc.SpriteFrame) => {
            let t_frame = sp;
            this.lvimg.getComponent(cc.Sprite).spriteFrame = t_frame;
        });

        // this.bk.string = dat[5] + ""
        // this.zz.string = dat[7] + ""
        this.bk.string = gameData.userInfo.Score1 + ""
        this.zz.string = gameData.userInfo.Score3 + ""
    }
    onClose() {
        this.node.active = false
    }
}
