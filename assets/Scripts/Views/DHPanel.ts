import { GameEvents } from "../GameConst";
import { gameData } from "../data/GameData";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";
import HttpMgr from "../network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DHPanel extends cc.Component {
    @property(cc.Label)
    tickName: cc.Label = null;

    @property(cc.EditBox)
    txt1: cc.EditBox = null;

    @property(cc.EditBox)
    txt2: cc.EditBox = null;

    @property(cc.EditBox)
    txt3: cc.EditBox = null;

    @property(cc.EditBox)
    txt4: cc.EditBox = null;

    @property(cc.Node)
    success: cc.Node = null;

    @property(cc.Node)
    fail: cc.Node = null;

    @property(cc.Node)
    warring: cc.Node = null;
    @property(cc.Node)
    mainNode: cc.Node = null;

    private toName = ["浪花之赠", "海风记忆", "期海锦囊", "征途荣光", "神秘礼品"]
    private tinvet = 0
    private code: string = ""
    onLoad() {
        this.success.active = false
        this.fail.active = false
    }
    private tickDat: number = 0;
    async init(clickDat) {
        clearTimeout(this.tinvet)
        this.txt1.string = ""
        this.txt2.string = ""
        this.txt3.string = ""
        this.txt4.string = ""

        this.txt1.node.on('text-changed', this.txt1Input, this)
        this.txt2.node.on('text-changed', this.txt2Input, this)
        this.txt3.node.on('text-changed', this.txt3Input, this)
        this.txt4.node.on('text-changed', this.txt4Input, this)

        this.success.active = false
        this.mainNode.active = true
        this.warring.active = true
        this.fail.active = false
        this.tickDat = clickDat
        this.tickName.string = "\"" + this.toName[+clickDat.TicketType - 1] + "\""

        var r = await HttpMgr.instance.getCheckCode()
        this.code = r.data[0].Code
    }
    txt1Input() {
        if (this.txt1.string == "") {
        } else if (this.txt2.string == "") {
            this.txt2.focus()
        } else if (this.txt3.string == "") {
            this.txt3.focus()
        } else if (this.txt4.string == "") {
            this.txt4.focus()
        }
    }
    txt2Input() {
        if (this.txt2.string == "") {
        } else if (this.txt3.string == "") {
            this.txt3.focus()
        } else if (this.txt4.string == "") {
            this.txt4.focus()
        } else if (this.txt1.string == "") {
            this.txt1.focus()
        }
    }
    txt3Input() {
        if (this.txt3.string == "") {
        } else if (this.txt4.string == "") {
            this.txt4.focus()
        } else if (this.txt1.string == "") {
            this.txt1.focus()
        } else if (this.txt2.string == "") {
            this.txt2.focus()
        }
    }
    txt4Input() {
        if (this.txt4.string == "") {
        } else if (this.txt1.string == "") {
            this.txt1.focus()
        } else if (this.txt2.string == "") {
            this.txt2.focus()
        } else if (this.txt3.string == "") {
            this.txt3.focus()
        }
    }

    onClickClose() {
        this.node.active = false
    }

    onClickUse() {
        if (this.code.length < 4) {
            Toast.showToast("验证码不正确")
            this.onClickClose()
            return
        }
        if (this.txt1.string != this.code[0] || this.txt2.string != this.code[1] || this.txt3.string != this.code[2] || this.txt4.string != this.code[3]) {
            this.warring.active = false
            this.fail.active = true

            this.txt1.textLabel.node.color = new cc.Color(183, 52, 44)
            this.txt2.textLabel.node.color = new cc.Color(183, 52, 44)
            this.txt3.textLabel.node.color = new cc.Color(183, 52, 44)
            this.txt4.textLabel.node.color = new cc.Color(183, 52, 44)
        } else {
            this.success.active = true
            this.mainNode.active = false
            HttpMgr.instance.editUserTick(this.tickDat.Id, this.tickDat.UserKey, this.tickDat.TicketType, 1).then(() => {
                EVT.emit(GameEvents.REFRESH_TICK)
            })
        }

        this.tinvet = setTimeout(() => {
            this.onClickClose()
        }, 2000);
    }
}
