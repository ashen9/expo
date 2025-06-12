import { GameEvents } from "../GameConst";
import DHPanel from "../Views/DHPanel";
import QuesitionPanel from "../Views/QuesitionPanel";
import SJPanel from "../Views/SJPanel";
import { gameData } from "../data/GameData";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";
import { RES } from "../manager/ResourceManager";
import MapCtrl from "../map/MapCtrl";
import HttpMgr from "../network/HttpMgr";
import ErrorPanel from "../Views/ErrorPanel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    @property(MapCtrl)
    mapCtrl: MapCtrl = null;
    @property(cc.Node)
    achievePanel: cc.Node = null;
    @property(cc.Node)
    quesitionPanel: cc.Node = null;
    @property(cc.Node)
    dhPanel: cc.Node = null;
    @property(cc.Node)
    sjPanel: cc.Node = null;
    @property(cc.Node)
    exchangePanel: cc.Node = null;
    @property(cc.Node)
    topNode: cc.Node = null;
    @property(cc.Node)
    yunqun1: cc.Node = null;
    @property(cc.Node)
    yunqun2: cc.Node = null;
    @property(cc.Node)
    yunqun3: cc.Node = null;
    @property(cc.Node)
    jnPanel: cc.Node = null;

    @property(cc.Node)
    smbxPanel: cc.Node = null;

    @property(cc.Node)
    btnJN: cc.Node = null;

    @property(cc.Node)
    bx1: cc.Node = null;
    @property(cc.Node)
    bx2: cc.Node = null;
    @property(cc.Node)
    bx3: cc.Node = null;

    protected onLoad(): void {
        var logTime = localStorage.getItem("logtime")

        if (!logTime || (new Date().getDate()) - +logTime > 0) {
            this.jnPanel.active = true
            localStorage.setItem("logtime", (new Date().getDate() + ""))
        }
        var bx1 = localStorage.getItem("bx1")
        var bx2 = localStorage.getItem("bx2")
        var bx3 = localStorage.getItem("bx3")

        this.bx1.active = !bx1
        this.bx2.active = !bx2
        this.bx3.active = !bx3

        this.btnJN.on(cc.Node.EventType.TOUCH_END, () => { this.jnPanel.active = true })
        this.bx1.on(cc.Node.EventType.TOUCH_END, () => {
            if(localStorage.getItem("network_error") === "true"){
                this.smbxPanel.active = true;
                this.bx1.active = false
                localStorage.setItem("bx1", "1")
            }else{
                _this.showError("网络异常，请稍后再试");
            }
            // gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + 1) + ""
            // HttpMgr.instance.editUserInfo({})
        })
        this.bx2.on(cc.Node.EventType.TOUCH_END, () => {
            if(localStorage.getItem("network_error") === "true"){
                this.smbxPanel.active = true;
                this.bx2.active = false
                localStorage.setItem("bx2", "1")
            }else{
                _this.showError("网络异常，请稍后再试");
            }

            // gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + 1) + ""
            // HttpMgr.instance.editUserInfo({})
        })
        this.bx3.on(cc.Node.EventType.TOUCH_END, () => {
            if(localStorage.getItem("network_error") === "true") {
                this.smbxPanel.active = true;
                this.bx3.active = false
                localStorage.setItem("bx3", "1")
            }else{
                _this.showError("网络异常，请稍后再试");
            }
            // gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + 1) + ""
            // HttpMgr.instance.editUserInfo({})
        })
        var _this = this;
        HttpMgr.instance.getSign().then(async (res) => {
            console.log(res)
            var dat = res["data"]
            if (!gameData.isRelease) {
                _this.gameStart()
            } else {
                if (window.wx == null) {
                    _this.gameStart()
                } else {
                    var str = encodeURIComponent(window.location.href)
                    // Toast.showToast(window.location.href)
                    wx.config({
                        url: str,
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: dat.AppId, // 必填，公众号的唯一标识
                        timestamp: dat.Timestamp, // 必填，生成签名的时间戳
                        nonceStr: dat.NonceStr, // 必填，生成签名的随机串
                        signature: dat.Signature,// 必填，签名
                        jsApiList: ["scanQRCode"] // 必填，需要使用的JS接口列表
                    });

                    wx.ready(function () {
                        console.log("ready")
                        // Toast.showToast("ready")
                        _this.gameStart()
                    });

                    wx.error(function (res) {
                        console.log(res)
                        // Toast.showToast("error")
                    });
                }
            }
        })
    }

    showError(msg: string) {
        // 获取 ErrorPanel 节点（根据你的实际节点路径调整）
        const errorPanelNode = cc.find("Canvas/errorPanel");
        if (errorPanelNode) {
            const errorPanel = errorPanelNode.getComponent(ErrorPanel);
            if (errorPanel) {
                errorPanel.showError(msg);
                errorPanelNode.active = true;
            }
        }
        localStorage.setItem("network_error", "false");
    }

    async gameStart() {
        var str = decodeURIComponent(window.location.href)
        str = str.split("&state=")[0]
        str = str.split("code=")[1]
        gameData.userKey = str

        //o7NiN6Na9I7qsqGoAaZJC7nMb67w  蒙版
        // gameData.userKey = "FromServer<@@@>o7nin6ghekn8dyvmbkqro8jvmxls"
        // gameData.userKey = "FromServer<@@@>o7NiN6J_4Z_5FzaWDEz8QamAWOO0"//lszz
        // gameData.userKey = "FromServer<@@@>o7NiN6C2LjVTS7gyLMHd0BzMXzsk"//我的
        // gameData.userKey = "FromServer<@@@>oC2LjVTS7gyLMHd0BzMXzsk"

        await gameData.getUserInfo()

        var self = this
        this.refreshScore()
        EVT.on(GameEvents.SHOW_QUESITION_PANEL, this.initQuesition, this);
        EVT.on(GameEvents.SHOW_DH_PANEL, this.initDHPanel, this);
        EVT.on(GameEvents.SHOW_SJ_PANEL, this.initSJPanel, this);
        EVT.on(GameEvents.REFRESH_SCORE, this.refreshScore, this);
        if (!this.mapCtrl) {
            this.mapCtrl = this.node.getChildByName("MapScrollView").getComponent(MapCtrl);
        }
        console.log("main ===>> onLoad")

        // RES.loadJson("nodeInfo", (res: cc.JsonAsset) => {
        //     gameData.nodeInfoData = res.json;
        //     gameData.curNodeInfo = gameData.nodeInfoData[0];
        //     this.mapCtrl.init();
        // })
        HttpMgr.instance.getNodeInfo().then(async (res) => {
            gameData.nodeInfoData = res["data"];
            gameData.curNodeInfo = gameData.nodeInfoData[0];

            HttpMgr.instance.getQuestionInfo().then(async (res) => {
                gameData.quesitionInfoData = res["data"];

                HttpMgr.instance.getQuestionRank().then(async (res) => {
                    let data = res["data"]
                    let t_count = data ? data.length : 0;
                    let c1 = 0
                    for (let i = 0; i < t_count; i++) {
                        let r = data[i]
                        let qr = JSON.parse(r.QuestionResult)
                        for (let k in qr) {
                            let arr = qr[k].split("_")
                            for (let key in gameData.quesitionInfoData) {
                                if (gameData.quesitionInfoData[key].id == arr[0]) {
                                    if (arr[1] == "1") {
                                        c1 += +gameData.quesitionInfoData[key].coin1
                                    }
                                    break
                                }
                            }
                        }

                    }
                    // gameData.userInfo["Score1"] = c1 + ""
                    this.refreshScore()

                    let max = +gameData.achieveInfoData[4].score
                    let prog = c1 / max
                    if (prog > 1) {
                    } else {
                        if (prog < +gameData.achieveInfoData[0].score / max) {
                            gameData.userInfo.Title = 0
                        } else if (prog < +gameData.achieveInfoData[1].score / max) {
                            gameData.userInfo.Title = 1
                        } else if (prog < +gameData.achieveInfoData[2].score / max) {
                            gameData.userInfo.Title = 2
                        } else if (prog < +gameData.achieveInfoData[3].score / max) {
                            gameData.userInfo.Title = 3
                        } else {
                            gameData.userInfo.Title = 4
                        }
                    }


                    var str = decodeURIComponent(window.location.href)
                    let r = {}
                    try {
                        r = JSON.parse(str.split("state=")[1])
                    } catch (e) {

                    }
                    self.doQRCode(r)
                })
            })
            this.mapCtrl.init();
        })

        HttpMgr.instance.getAchieveInfo().then((res) => {
            gameData.achieveInfoData = res["data"];
        })

        RES.loadJson("goods", (res: cc.JsonAsset) => {
            gameData.goodsInfoData = res.json;
        })

        // this.yunqun1.getComponent(sp.Skeleton).setAnimation(0, "none", true)
        this.yunqun2.getComponent(sp.Skeleton).setAnimation(0, "none", true)
        this.yunqun3.getComponent(sp.Skeleton).setAnimation(0, "none", true)
        gameData.ms = this
        // this.yunqun1.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
        setTimeout(() => {
            gameData.ms.yunqun2.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
        }, 17000);
        setTimeout(() => {
            gameData.ms.yunqun3.getComponent(sp.Skeleton).setAnimation(0, "animation", true)
        }, 34000);
    }

    async onSaoYiSaoBtnClick() {
        let self = this;
        // 只允许从相机扫码
        if(localStorage.getItem("network_error") === "true"){
            if (gameData.userKey.indexOf("FromServer") < 0) {
                wx.scanQRCode({
                    needResult: 1,
                    scanType: ['qrCode'],
                    success: async function (res) {
                        console.log("scanCode success", res);
                        let r = {}
                        try {
                            r = JSON.parse(res.resultStr.split("state=")[1])
                        } catch (e) {

                        }
                        self.doQRCode(r)
                    }, fail(res) {
                        console.log("scanCode fail", res);
                    }
                })
            } else {
                var r = { "nodeType": 1, "timestamp": 1714504103, "skip": false, "userID": "", "newScore": 50 }
                self.doQRCode(r)
            }
        } else{
            self.showError("网络异常，请稍后再试");
        }
    }

    async doQRCode(r) {
        if ((new Date().getTime() - (+r.timestamp * 1000)) > 120000 && gameData.isRelease) {
            Toast.showToast("二维码已失效")
            return
        }

        let self = this
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
                        self.refreshScore()
                        Toast.showToast("恭喜获得 " + r.newScore + " 积分")
                    }
                })
            } else {
                Toast.showToast("拾贝亭积分重复获取")
            }
        } else if (r.userID != null && r.userID != "") {
            await HttpMgr.instance.setClientKey(r.userID)
        } else if (r.nodeType) {
            for (var i = 0; i < gameData.nodeInfoData.length; i++) {
                if (gameData.nodeInfoData[i].id == r.nodeType) {
                    gameData.curNodeInfo = gameData.nodeInfoData[i]
                    break
                }
            }

            if (r.skip) {
                gameData.onlyGlod = true
            }
            gameData.isScanLogin = true
            EVT.emit(GameEvents.SHOW_QUESITION_PANEL);
            gameData.userInfo.Done += gameData.curNodeInfo.id + ","
            if (gameData.userInfo.Visited.indexOf("," + gameData.curNodeInfo.id + ",") < 0) {
                gameData.userInfo.Visited += gameData.curNodeInfo.id + ","
            }
            if (!gameData.onlyGlod) {
                HttpMgr.instance.editUserInfo({ Done: gameData.userInfo.Done, DoneDate: new Date().getTime() + "" })
            }
        }
    }

    initQuesition() {
        this.quesitionPanel.getComponent(QuesitionPanel).init();
        this.quesitionPanel.active = true;
    }

    initDHPanel(dat) {
        this.dhPanel.getComponent(DHPanel).init(dat);
        this.dhPanel.active = true;
    }

    async initSJPanel() {
        let r = await gameData.getScoreLV()
        if (r[6]) {
            this.sjPanel.getComponent(SJPanel).init(r);
            // this.sjPanel.active = true;
        }
    }

    refreshScore() {
        // this.topNode.getChildByName("lab_beike").getComponent(cc.Label).string = (+gameData.userInfo["Score1"] + +gameData.userInfo.NewScore) + ""
        this.topNode.getChildByName("lab_beike").getComponent(cc.Label).string = gameData.userInfo["Score1"] + ""
        this.topNode.getChildByName("lab_jinbi").getComponent(cc.Label).string = gameData.userInfo["Score2"]
        this.topNode.getChildByName("lab_zhenzhu").getComponent(cc.Label).string = gameData.userInfo["Score3"]

        if (this.topNode.getChildByName("lab_beike").getComponent(cc.Label).string == "") {
            this.topNode.getChildByName("lab_beike").getComponent(cc.Label).string = "0"
        }
        if (this.topNode.getChildByName("lab_jinbi").getComponent(cc.Label).string == "") {
            this.topNode.getChildByName("lab_jinbi").getComponent(cc.Label).string = "0"
        }
        if (this.topNode.getChildByName("lab_zhenzhu").getComponent(cc.Label).string == "") {
            this.topNode.getChildByName("lab_zhenzhu").getComponent(cc.Label).string = "0"
        }
    }

    onRankBtnClick() {
        this.achievePanel.active = true;
        // Toast.showToast("123123132");
        // EVT.emit(GameEvents.SHOW_QUESITION_PANEL)
        // this.quesitionPanel.active = true;
    }

    onExchangeClick() {
        this.exchangePanel.active = true;
    }

    onLandingClick() {
        gameData.isScanLogin = false
        EVT.emit(GameEvents.SHOW_QUESITION_PANEL);
    }

    onTestInit() {

        cc.resources.load("common/toast", (error: Error, texture) => {
            // cc.log(texture)
            if (error || !(texture instanceof cc.Texture2D)) {
                cc.log(`loadUrlImage failed:[${error}]`)
            } else {
                let t_frame = new cc.SpriteFrame(texture);
                let spriteNode = new cc.Node("Sprite");
                cc.log("生成节点~")
                let sprite = spriteNode.addComponent(cc.Sprite);
                sprite.spriteFrame = t_frame;
                spriteNode.parent = this.node;
                spriteNode.setPosition(cc.v2(0, 0));
                spriteNode.zIndex = 100
            }
        })
    }


}
