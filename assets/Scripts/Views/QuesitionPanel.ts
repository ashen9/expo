import { GameEvents } from "../GameConst";
import BaseView from "../base/BaseView";
import { gameData } from "../data/GameData";
import { QuesitionInfo } from "../data/GameInterface";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";
import HttpMgr from "../network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuesitionPanel extends BaseView {
    @property(cc.Node)
    quesitionContent: cc.Node = null;
    @property(cc.Label)
    quesitionLab: cc.Label = null;
    @property(cc.Label)
    progressLab: cc.Label = null;

    @property(cc.Node)
    faileContent: cc.Node = null;
    @property(cc.Node)
    successContent: cc.Node = null;
    @property(cc.Node)
    onceContent: cc.Node = null;
    @property(cc.Node)
    resultContent: cc.Node = null;
    @property(cc.Node)
    answerContent: cc.Node = null;

    @property(cc.Label)
    right: cc.Label = null;
    @property(cc.Label)
    wrong: cc.Label = null;
    @property(cc.Label)
    bk: cc.Label = null;
    @property(cc.Label)
    jb: cc.Label = null;
    @property(cc.Label)
    zz: cc.Label = null;
    @property(cc.Label)
    getJB: cc.Label = null;
    @property(cc.Node)
    mainClose: cc.Node = null;

    private _quesArr: string[] = [];
    private _quesArrResult: string[] = [];

    private _curNum: number = 0;
    private _answer: string = "";
    private _answerScore: number = 0;

    protected onEnable(): void {
        super.onEnable();
    }

    async init() {
        this._curNum = 0;
        this._quesArr = gameData.curNodeInfo.quesition.split(`|`);
        this._quesArrResult = gameData.curNodeInfo.quesition.split(`|`);
        this.updateProgress();
        this.createQues();

        // if (gameData.isSBT) {
        //     this.hidePanel(this.resultContent)
        // } else 
        if (gameData.userInfo.Done.indexOf("," + gameData.curNodeInfo.id + ",") >= 0) {
            this.hidePanel(this.onceContent)
        } else if (!gameData.isLoginRight) {
            this.hidePanel(this.faileContent)
        } else if (gameData.onlyGlod) {
            var question_result = []
            let arr = gameData.curNodeInfo.quesition.split("|")
            let num = 0;
            for (let i = 0; i < arr.length; i++) {
                question_result.push(arr[i] + "_1")
                for (let key in gameData.quesitionInfoData) {
                    if (gameData.quesitionInfoData[key].id == arr[i]) {
                        num += +gameData.quesitionInfoData[key].coin1
                        break
                    }
                }
            }

            let jbcount = 0
            var quesitionInfo = await HttpMgr.instance.getQuestionRank()
            for (let i = 0; i < quesitionInfo.length; i++) {
                if (quesitionInfo[i].QuestionType == gameData.curNodeInfo.id) {
                    jbcount = quesitionInfo[i].Score
                    break
                }
            }
            if (!gameData.isScanLogin) {
                if (jbcount == 0) {
                    if (Math.random() < 0.5) {
                        jbcount += 1
                    }
                } else {
                    if (Math.random() < 0.25) {
                        jbcount += 2
                    }
                }
            }
            gameData.userInfo.Done += gameData.curNodeInfo.id + ","
            HttpMgr.instance.answerQuestion(gameData.curNodeInfo.id, question_result, jbcount)
            gameData.userInfo.Score1 = (+gameData.userInfo.Score1 + num) + ""
            // gameData.userInfo.Score2 = (+gameData.userInfo.Score2 + jbcount) + ""
            gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + 1 + jbcount) + ""
            HttpMgr.instance.editUserInfo({})

            this.getJB.string = num + ""
            this.hidePanel(this.successContent)

            EVT.emit(GameEvents.REFRESH_SCORE);
            gameData.onlyGlod = false
        } else {
            this.hidePanel(this.answerContent)
            this.mainClose.active = false
        }
    }

    hidePanel(node) {
        this.mainClose.active = true
        this.faileContent.active = false
        this.successContent.active = false
        this.onceContent.active = false
        this.resultContent.active = false
        this.answerContent.active = false

        node.active = true
    }
    private isEnd = false
    /**创建问题 */
    async createQues() {
        this.clear();
        let t_quesiton: QuesitionInfo = gameData.quesitionInfoData[this._quesArr[this._curNum]];
        if (!t_quesiton) return
        // this.quesitionLab.string = `${this._curNum + 1}.${t_quesiton.info}`;
        this.quesitionLab.string = `${t_quesiton.info}`;
        let t_optionsArr: string[] = t_quesiton.options.split(`|`);
        let t_style: cc.Node = this.quesitionContent.children[0];
        this._answer = t_quesiton.answer;

        this._answerScore = 0
        var quesitionInfo = await HttpMgr.instance.getQuestionRank()
        for (let i = 0; i < quesitionInfo.length; i++) {
            if (quesitionInfo[i].QuestionType == gameData.curNodeInfo.id) {
                this._answerScore = quesitionInfo[i].Score
                break
            }
        }
        if (this._answerScore == 0) {
            if (Math.random() < 0.5) {
                this._answerScore += 1
            }
        } else {
            if (Math.random() < 0.25) {
                this._answerScore += 2
            }
        }

        for (let i = 0; i < t_optionsArr.length; i++) {
            let t_str = t_optionsArr[i];
            let t_item = cc.instantiate(t_style);
            t_item.getChildByName("dui").active = false
            t_item.getChildByName("cuo").active = false
            t_item.getChildByName("g").active = false
            t_item.getChildByName("r").active = false
            t_item.getComponent(cc.Label).string = this.codeConver(i) + t_str;
            t_item.setParent(this.quesitionContent);
            t_item.active = true;
            t_item.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isEnd) return
                this.isEnd = true
                if (t_str == this._answer) {
                    // console.log("回答正确")
                    this._quesArrResult[this._curNum] += "_1"
                    Toast.showToast("回答正确");
                    // this._answerScore++
                    t_item.getChildByName("g").active = true
                    t_item.getChildByName("dui").active = true
                } else {
                    // console.log("回答错误")
                    this._quesArrResult[this._curNum] += "_0"
                    Toast.showToast("回答错误");
                    t_item.getChildByName("r").active = true
                    t_item.getChildByName("cuo").active = true
                }
                this._curNum++;

                setTimeout(() => {
                    this.isEnd = false
                    if (this._curNum > this._quesArr.length - 1) {
                        // console.log("回答完毕")
                        Toast.showToast("回答完毕");
                        // this.node.active = false;
                        HttpMgr.instance.answerQuestion(gameData.curNodeInfo.id, this._quesArrResult, this._answerScore)
                        this.hidePanel(this.resultContent)

                        let c1 = 0
                        let c2 = 0
                        let c3 = 0
                        let rNUm = 0
                        let wNUm = 0

                        for (let k in this._quesArrResult) {
                            let arr = this._quesArrResult[k].split("_")
                            if (arr[1] == "1") {
                                rNUm++
                            } else {
                                wNUm++
                            }

                            for (let key in gameData.quesitionInfoData) {
                                if (gameData.quesitionInfoData[key].id == arr[0]) {
                                    if (arr[1] == "1") {
                                        c1 += +gameData.quesitionInfoData[key].coin1//贝壳
                                        // c2 += +gameData.quesitionInfoData[key].coin2//金币
                                        // c3 += +gameData.quesitionInfoData[key].coin3//珍珠
                                    }
                                    break
                                }
                            }
                        }
                        this.right.string = rNUm + ""
                        this.wrong.string = wNUm + ""

                        var zzNum = (wNUm > 0 ? 0 : 1)
                        zzNum += +this._answerScore

                        this.bk.string = c1 + ""
                        this.jb.string = this._answerScore + ""
                        this.zz.string = zzNum + ""

                        gameData.userInfo.Score1 = (+gameData.userInfo.Score1 + c1) + ""
                        // gameData.userInfo.Score2 = (+gameData.userInfo.Score2 + +this._answerScore) + ""
                        gameData.userInfo.Score3 = (+gameData.userInfo.Score3 + zzNum) + ""

                        // if (gameData.QuestionStat.indexOf(gameData.curNodeInfo.id + ",") < 0) {
                        //     gameData.QuestionStat += gameData.curNodeInfo.id + "," + c1 + "," + c2 + "," + c3 + "|"
                        // }
                        HttpMgr.instance.editUserInfo({})
                        EVT.emit(GameEvents.REFRESH_SCORE);
                    } else {
                        this.updateProgress();
                        this.createQues();
                    }
                }, 2000);
            })
        }
    }

    clear() {
        for (let i = 1; i < this.quesitionContent.childrenCount; i++) {
            let t_item = this.quesitionContent.children[i];
            t_item.destroy();
        }
    }

    codeConver(id: number) {
        let t_v = "";
        switch (id) {
            case 0:
                t_v = "A"
                break;
            case 1:
                t_v = "B"
                break;
            case 2:
                t_v = "C"
                break;
            case 3:
                t_v = "D"
                break;
            case 4:
                t_v = "E"
                break;
            case 5:
                t_v = "F"
                break;
            default:
                break;
        }
        return t_v + "   ";
    }

    updateProgress() {
        this.progressLab.string = `${this._curNum + 1}/${this._quesArr.length}`
    }



    onCloseBtnClick() {
        EVT.emit(GameEvents.SHOW_SJ_PANEL);
        this.node.active = false;
    }
}
