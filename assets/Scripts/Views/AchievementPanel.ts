import BaseView from "../base/BaseView";
import { gameData } from "../data/GameData";
import { EVT } from "../event/EventCenter";
import { GameEvents } from "../GameConst";
import { RES } from "../manager/ResourceManager";
import HttpMgr from "../network/HttpMgr";
import AchieveStyle from "./AchieveStyle";
import RecordStyle from "./RecordStyle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AchievementPanel extends BaseView {
    @property(cc.ScrollView)
    recordSV: cc.ScrollView = null;

    @property(cc.Label)
    beike: cc.Label = null;
    @property(cc.Label)
    jinbi: cc.Label = null;
    @property(cc.Label)
    zhenzhu: cc.Label = null;

    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;

    @property(cc.Node)
    titleImg: cc.Node = null;
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.Label)
    desc: cc.Label = null

    private _curSV: cc.ScrollView = null;

    private _isRecord: boolean = false;

    protected onEnable(): void {
        this._isRecord = false;
        this.node.scale = 0.8;
        cc.tween(this.node).to(0.1, { scale: 1 }).start();
        this.onRecordBtnClick();
        this.beike.string = "0"
        this.jinbi.string = "0"
        this.zhenzhu.string = "0"
        // gameData.getUserInfo().then((info) => {
        // this.beike.string = gameData.userInfo["Score1"]
        // this.jinbi.string = gameData.userInfo["Score2"]
        // this.zhenzhu.string = gameData.userInfo["Score3"]
        // })
        gameData.getUserInfo()
    }

    async onRecordBtnClick() {
        if (this._isRecord) {
            return
        }
        this._isRecord = true;
        this.recordSV.node.active = true;
        this._curSV = this.recordSV;
        let r = await gameData.getScoreLV()
        this.initSV(r[0]);

        this.title.string = r[1]
        this.bar.progress = r[2]
        // this.beike.string = (+gameData.userInfo.Score1 + +gameData.userInfo.NewScore) + ""
        this.beike.string = gameData.userInfo.Score1 + ""
        this.jinbi.string = gameData.userInfo.Score2 + ""
        this.zhenzhu.string = gameData.userInfo.Score3 + ""

        let visited = gameData.userInfo.Visited.split(",")

        RES.loadTexture2DRes("Textures/海-成就兑换/" + this.title.string, (sp: cc.SpriteFrame) => {
            let t_frame = sp;
            this.titleImg.getComponent(cc.Sprite).spriteFrame = t_frame;
        });
        var num = visited.length
        if (num > 1) {
            num -= 2
        }
        this.desc.string = "你已经探索" + num + "个岛屿,获得" + r[5] + "积分,\n恭喜获得" + this.title.string + "称号!"
        if (+r[4] > 0) {
            this.desc.string += r[2] >= 1 ? "" : "\n距离" + r[3] + "还差" + r[4] + "积分!"
        }

        EVT.emit(GameEvents.SHOW_SJ_PANEL);
    }

    onAchievementBtnClick() {
        if (!this._isRecord) {
            return
        }
        this._isRecord = false;
        this.recordSV.node.active = false;
        HttpMgr.instance.getQuestionRank().then((res) => {
            this.initSV(res["data"]);
        })
    }

    initSV(data: Array<any> = null) {
        this.clearSV();
        let t_style = this._curSV.content.children[0];
        if (t_style.getComponent(RecordStyle)) {
            if (!data) return
            let t_count = data ? data.length : 10;
            for (let i = 0; i < t_count; i++) {
                var nd = new Date()
                var td = new Date(+data[i].QuestionDate * 1000)
                if (td.getDate() - nd.getDate() == 0 && td.getMonth() - nd.getMonth() == 0) {
                    let t_item = cc.instantiate(t_style);
                    //TODO 生成对应的item
                    t_item.setParent(this._curSV.content);
                    t_item.active = true;
                    t_item.getComponent(RecordStyle).initData(data[i])
                }
            }
        } else {
            for (let i = 0; i < gameData.achieveInfoData.length; i++) {
                let t_item = cc.instantiate(t_style);
                //TODO 生成对应的item
                t_item.setParent(this._curSV.content);
                t_item.active = true;
                t_item.getComponent(AchieveStyle).initData(gameData.achieveInfoData[i])
            }
        }
    }

    clearSV() {
        for (let i = 1; i < this._curSV.content.childrenCount; i++) {
            let t_item = this._curSV.content.children[i];
            t_item.destroy();
        }
    }


    onCloseBtnClick() {
        this.node.active = false;
    }
}
