import { GameEvents } from "../GameConst";
import BaseView from "../base/BaseView";
import { gameData } from "../data/GameData";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";
import HttpMgr from "../network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NodeInfoPanel extends BaseView {
    @property(cc.Label)
    infoLab: cc.Label = null;

    protected onLoad(): void {
        super.onLoad();
    }

    public onEnable() {
        super.onEnable();
        if (gameData.curNodeInfo) {
            this.infoLab.string = gameData.curNodeInfo.info;
        }
    }

    async onSaoYiSaoBtnClick() {
        let self = this;
        gameData.onlyGlod = false
        gameData.isLoginRight = true
        // 只允许从相机扫码
        if (gameData.userKey.indexOf("FromServer") < 0) {
            wx.scanQRCode({
                needResult: 1,
                scanType: ['qrCode'],
                success: async function (res) {
                    // http://qihuoyouxi.singlesense.net?p={"nodeType":1,"timestamp":1700186087,"skip":false,"userID":"klnlptrp2vr4qgn"}
                    // Toast.showToast(res.resultStr)
                    console.log("scanCode success", res);
                    // charSet: "utf-8"
                    // codeVersion: 2
                    // errMsg: "scanCode:ok"
                    // rawData: "eyJub2RlVHlwZSI6MSwidGltZXN0YW1wIjoyfQ=="
                    // result: "{"nodeType":1,"timestamp":2,"skip":false}"
                    // scanType: "QR_CODE"
                    let r = {}
                    try {
                        r = JSON.parse(res.resultStr.split("state=")[1])
                    } catch (e) {

                    }
                    self.doQRCode(r)
                }, fail(res) {
                    console.log("scanCode fail", res);
                    // EVT.emit(GameEvents.SHOW_QUESITION_PANEL);
                }
            })
        } else {
            var r = { "nodeType": 2, "timestamp": 2912286078, "skip": false, "userID": "", "newScore": "" }
            self.doQRCode(r)
        }
    }
    async doQRCode(r) {
        if ((new Date().getTime() - (+r.timestamp) * 1000) > 120000 && gameData.isRelease) {
            Toast.showToast("二维码已失效")
            this.node.active = false;
            return
        }
        if (!!r.newScore && r.newScore > 0) {
            if (gameData.userInfo.Done.indexOf(",888,") < 0) {

                HttpMgr.instance.answerQuestion("7", "", 0, r.newScore, r.timestamp).then((data) => {
                    if (data.data != "") {
                        Toast.showToast(data.data)
                    } else {
                        gameData.userInfo.NewScore = (+gameData.userInfo.NewScore + +r.newScore) + ""
                        if (+r.newScore >= 50) {
                            gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + 1) + ""
                        }

                        gameData.userInfo.Score1 = (+gameData.userInfo.Score1 + +r.newScore) + ""
                        gameData.userInfo.Done += "888,"
                        if (gameData.userInfo.Visited.indexOf(",888,") < 0) {
                            gameData.userInfo.Visited += "888,"
                        }
                        HttpMgr.instance.editUserInfo({})
                        EVT.emit(GameEvents.REFRESH_SCORE);
                    }
                })
            } else {
                Toast.showToast("拾贝亭积分重复获取")
            }
            this.node.active = false;
        } else if (r.userID != null && r.userID != "") {
            await HttpMgr.instance.setClientKey(r.userID)
            this.node.active = false;
        } else {
            if (r.nodeType + "" != gameData.curNodeInfo.id + "") {
                gameData.isLoginRight = false
                this.node.active = false;
                gameData.isScanLogin = false
                EVT.emit(GameEvents.SHOW_QUESITION_PANEL);
            } else {
                if (r.skip) {
                    gameData.onlyGlod = true
                }
                this.node.active = false;
                gameData.isScanLogin = false
                EVT.emit(GameEvents.SHOW_QUESITION_PANEL);
                gameData.userInfo.Done += gameData.curNodeInfo.id + ","
                if (gameData.userInfo.Visited.indexOf("," + gameData.curNodeInfo.id + ",") < 0) {
                    gameData.userInfo.Visited += gameData.curNodeInfo.id + ","
                }
                HttpMgr.instance.editUserInfo({ Done: gameData.userInfo.Done, DoneDate: new Date().getTime() + "" })
            }
        }
    }
    onCloseBtnClick() {
        this.node.active = false;
    }
}
