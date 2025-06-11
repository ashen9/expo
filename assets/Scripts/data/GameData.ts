import { GameEvents } from "../GameConst";
import SingleBase from "../base/SingleBase";
import { EVT } from "../event/EventCenter";
import HttpMgr from "../network/HttpMgr";
import { NodeInfo } from "./GameInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameData extends SingleBase {

    public nodeInfoData = [];
    public quesitionInfoData = [];
    public achieveInfoData = [];
    public goodsInfoData = [];

    public wxUserInfo = {};

    public curNodeInfo: NodeInfo = null;
    public isScanLogin = false

    private _userKey: string;
    public set userKey(key: string) {
        this._userKey = key
        // this.getUserInfo()
    }

    public get userKey(): string {
        return this._userKey
    }

    public userID = "-1"
    public userInfo = {}
    public onlyGlod = false
    public isLoginRight = true

    public isRelease = true

    getUserInfo() {
        let self = this
        return new Promise<{}>((resolve, reject) => {
            if (self.userID == "-1") {
                HttpMgr.instance.getUserInfo(self.userKey).then((res) => {
                    self.userInfo = res["data"][0]
                    self.userID = self.userInfo["Id"] + ""
                    console.log("USERID:", self.userID)
                    if (!self.userInfo.Score1) {
                        self.userInfo.Score1 = 0
                    }
                    if (!self.userInfo.Score2) {
                        self.userInfo.Score2 = 0
                    }
                    if (!self.userInfo.Score3) {
                        self.userInfo.Score3 = 0
                    }
                    if (!self.userInfo.NewScore) {
                        self.userInfo.NewScore = 0
                    }
                    if (!self.userInfo.Visited) {
                        self.userInfo.Visited = ","
                    }
                    self.userInfo.Done = self.userInfo.Done + ""
                    if (self.checkDate(self.userInfo.DoneDate)) {
                        self.userInfo.Score1 = 0
                        self.userInfo.Score2 = 0
                        self.userInfo.Score3 = 0
                        self.userInfo.Done = ","
                        self.userInfo.Visited = ","
                        HttpMgr.instance.editUserInfo({})
                        HttpMgr.instance.delUserTick(gameData.userKey)
                        HttpMgr.instance.delQuestion()
                    }
                    // if (!gameData.isRelease) {
                    //     self.userInfo.Score1 = 0
                    //     self.userInfo.Score2 = 0
                    //     self.userInfo.Score3 = 0
                    //     self.userInfo.Done = ","
                    //     self.userInfo.Visited = ","
                    //     HttpMgr.instance.editUserInfo({})
                    //     // HttpMgr.instance.delUserTick("o7NiN6C2LjVTS7gyLMHd0BzMXzsk")
                    //     HttpMgr.instance.delQuestion()
                    // }

                    EVT.emit(GameEvents.REFRESH_SCORE);
                    resolve(self.userInfo)
                })
            } else {
                HttpMgr.instance.getUserInfo(self.userKey).then((res) => {
                    self.userInfo.Score1 = res["data"][0].Score1
                    self.userInfo.Score2 = res["data"][0].Score2
                    self.userInfo.Score3 = res["data"][0].Score3
                    self.userInfo.NewScore = res["data"][0].NewScore

                    if (self.userInfo.Score1 == undefined) {
                        self.userInfo.Score1 = 0
                    }
                    if (self.userInfo.Score2 == undefined) {
                        self.userInfo.Score2 = 0
                    }
                    if (self.userInfo.Score3 == undefined) {
                        self.userInfo.Score3 = 0
                    }
                    if (self.userInfo.NewScore == undefined) {
                        self.userInfo.NewScore = 0
                    }
                    if (self.checkDate(self.userInfo.DoneDate)) {
                        self.userInfo.Score1 = 0
                        self.userInfo.Score2 = 0
                        self.userInfo.Score3 = 0
                        self.userInfo.Done = ","
                        HttpMgr.instance.editUserInfo({})
                        HttpMgr.instance.delUserTick(gameData.userKey)
                        HttpMgr.instance.delQuestion()
                    }
                    // if (!gameData.isRelease) {
                    //     self.userInfo.Score1 = 0
                    //     self.userInfo.Score2 = 0
                    //     self.userInfo.Score3 = 0
                    //     self.userInfo.Done = ","
                    //     HttpMgr.instance.editUserInfo({})
                    //     HttpMgr.instance.delUserTick("o7NiN6C2LjVTS7gyLMHd0BzMXzsk")
                    //     HttpMgr.instance.delQuestion()
                    // }
                    EVT.emit(GameEvents.REFRESH_SCORE);
                    resolve(self.userInfo)
                })
            }
        })
    }

    checkDate(mill: any): boolean {
        var nowDate = new Date()
        var millDate = new Date(+mill)
        if (nowDate.getFullYear() - millDate.getFullYear() > 0 ||
            nowDate.getMonth() - millDate.getMonth() > 0 ||
            nowDate.getDate() - millDate.getDate() > 0) {
            gameData.userInfo.DoneDate = new Date().getTime() + ""
            return true
        }
        return false
    }

    async getScoreLV() {
        var res = await HttpMgr.instance.getQuestionRank()
        let data = res["data"]
        let t_count = data ? data.length : 0;
        let c1 = 0
        let c2 = 0
        let c3 = 0
        for (let i = 0; i < t_count; i++) {
            let r = data[i]
            if (r.QuestionType == 7) {
                c1 += +r.NewScore
            } else {
                let qr = JSON.parse(r.QuestionResult)
                for (let k in qr) {
                    let arr = qr[k].split("_")
                    for (let key in gameData.quesitionInfoData) {
                        if (gameData.quesitionInfoData[key].id == arr[0]) {
                            if (arr[1] == "1") {
                                c1 += +gameData.quesitionInfoData[key].coin1
                                c2 += +gameData.quesitionInfoData[key].coin2
                                c3 += +gameData.quesitionInfoData[key].coin3
                            }
                            break
                        }
                    }
                }
                c3 += r.Score
            }
        }

        // c1 = 340
        let title = "水手"
        let bar = 1
        let nextTitle = ""
        let nextScore = 0
        let currTitle = gameData.userInfo.Title
        let max = +gameData.achieveInfoData[4].score
        let prog = c1 / max
        if (prog > 1) {
            bar = 1
            title = "船长"
        } else {
            if (prog < +gameData.achieveInfoData[0].score / max) {
                gameData.userInfo.Title = 0
                title = "水手"
                nextTitle = "三副"
                nextScore = +gameData.achieveInfoData[0].score - +c1
            } else if (prog < +gameData.achieveInfoData[1].score / max) {
                gameData.userInfo.Title = 1
                title = "三副"
                nextTitle = "二副"
                nextScore = +gameData.achieveInfoData[1].score - +c1
            } else if (prog < +gameData.achieveInfoData[2].score / max) {
                gameData.userInfo.Title = 2
                title = "二副"
                nextTitle = "大副"
                nextScore = +gameData.achieveInfoData[2].score - +c1
            } else if (prog < +gameData.achieveInfoData[3].score / max) {
                gameData.userInfo.Title = 3
                title = "大副"
                nextTitle = "船长"
                nextScore = +gameData.achieveInfoData[3].score - +c1
            } else {
                prog = 1
                gameData.userInfo.Title = 4
                title = "船长"
            }
            bar = prog

            // gameData.userInfo.Score1 = c1
            // gameData.userInfo.Score2 = c2
            // gameData.userInfo.Score3 = c3

            HttpMgr.instance.editUserInfo({})
        }

        return [res["data"], title, bar, nextTitle, nextScore, c1, +currTitle < +gameData.userInfo.Title, c3]
    }
}

export let gameData = GameData.getInstance();
if (CC_DEBUG) {
    let win: any = window;
    win.gameData = gameData
}
