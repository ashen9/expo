import { GameEvents } from "../GameConst";
import BaseView from "../base/BaseView";
import { gameData } from "../data/GameData";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";
import HttpMgr from "../network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ExchangePanel extends BaseView {
    @property(cc.ScrollView)
    duiHuanSV: cc.ScrollView = null;
    @property(cc.ScrollView)
    duiHuanJiLuSV: cc.ScrollView = null;

    @property(cc.Node)
    duHuanBtn: cc.Node = null;
    @property(cc.Node)
    duiHuanJiLuBtn: cc.Node = null;
    @property(cc.Label)
    beike: cc.Label = null
    @property(cc.Label)
    jinbe: cc.Label = null
    @property(cc.Label)
    zz: cc.Label = null

    protected onLoad(): void {
        // HttpMgr.instance.editUserTick(0, "o7NiN6C2LjVTS7gyLMHd0BzMXzsk", "1", 1)
        EVT.on(GameEvents.REFRESH_TICK, this.duHuanJiLuBtnClick, this)
    }

    _curSV: cc.ScrollView = null;
    protected onEnable(): void {
        this.node.scale = 0.8;
        cc.tween(this.node).to(0.1, { scale: 1 }).start();
        // this.duHuanBtnClick()
        gameData.getUserInfo()
        this.duHuanJiLuBtnClick()
    }

    duHuanBtnClick() {
        return
        if (this._curSV != this.duiHuanSV) {
            if (this._curSV) this._curSV.node.active = false
            this.duHuanBtn.active = true
            this.duiHuanJiLuBtn.active = false
            this._curSV = this.duiHuanSV
            this._curSV.node.active = true
            this.initSV()
        }
    }
    private cjDat
    async duHuanJiLuBtnClick() {
        // this.beike.string = (+gameData.userInfo.Score1 + +gameData.userInfo.NewScore) + ""
        this.beike.string = gameData.userInfo.Score1 + ""
        this.jinbe.string = gameData.userInfo.Score2 + ""
        this.zz.string = gameData.userInfo.Score3 + ""
        var data = await HttpMgr.instance.getUserTicket()
        console.log(data)
        this.cjDat = data.data == "无相关数据" ? [] : data.data
        // if (this._curSV != this.duiHuanJiLuSV) {
        if (this._curSV) this._curSV.node.active = false
        this.duHuanBtn.active = false
        this.duiHuanJiLuBtn.active = true
        this._curSV = this.duiHuanJiLuSV
        this._curSV.node.active = true
        this.initSV(this.cjDat)
        // }
    }
    onCloseBtnClick() {
        this.node.active = false;
    }

    initSV(data: Array<any> = null) {
        this.clearSV();
        let t_style = this._curSV.content.children[0];
        let t_count = data ? data.length : 0;
        this.node.getChildByName("tips").active = t_count < 1

        // this.node.getChildByName("tips").on(cc.Node.EventType.TOUCH_END, (evt) => {
        //     var d = { TicketType: 2, Used: false }
        //     EVT.emit(GameEvents.SHOW_DH_PANEL, d);
        // })

        for (let i = 0; i < t_count; i++) {
            var _dat = data[i]
            let t_item = cc.instantiate(t_style);
            //TODO 生成对应的item
            t_item.setParent(this._curSV.content);
            t_item.active = true;
            for (var n = 1; n < 6; n++) {
                t_item.getChildByName("cj" + n).active = false
            }
            t_item.getChildByName("use").active = false
            var mc = t_item.getChildByName("cj" + _dat.TicketType)
            if (mc) {
                mc.active = true
                t_item.getChildByName("use").active = _dat.Used > 0
            }
            if (_dat.Used == 1) {
                t_item.getChildByName("btn").active = false
            } else {
                t_item.getChildByName("btn").active = true
                t_item.getChildByName("btn").dat = _dat
                t_item.getChildByName("btn").on(cc.Node.EventType.TOUCH_END, (evt) => {
                    var d = evt.currentTarget.dat
                    if (d.Used == 1) {
                        Toast.showToast("奖券已使用")
                    } else {
                        EVT.emit(GameEvents.SHOW_DH_PANEL, d);
                    }
                })
            }
        }
    }

    clearSV() {
        for (let i = 1; i < this._curSV.content.childrenCount; i++) {
            let t_item = this._curSV.content.children[i];
            t_item.destroy();
        }
    }
}
