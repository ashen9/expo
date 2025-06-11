import { gameData } from "../data/GameData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecordStyle extends cc.Component {
    @property(cc.Label)
    time: cc.Label = null;
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.Label)
    score1: cc.Label = null;//贝壳
    @property(cc.Label)
    score2: cc.Label = null;//珍珠
    @property(cc.Label)
    score3: cc.Label = null;


    initData(dat) {
        if (!dat) return
        if (dat.QuestionType == "7") {
            this.title.string = "拾贝亭"
            this.score1.string = dat.NewScore
            // this.score3.string = "0"
            // this.score2.string = dat.NewScore >= 50 ? "1" : "0"
            this.score2.string = "0"
        } else {
            for (let k in gameData.nodeInfoData) {
                let data = gameData.nodeInfoData[k]
                if (dat.QuestionType == data.id) {
                    this.title.string = data.name + ""
                    break
                }
            }
            let c1 = 0
            let c2 = 0
            let c3 = 1
            let qr = JSON.parse(dat.QuestionResult)
            for (let k in qr) {
                let arr = qr[k].split("_")
                for (let key in gameData.quesitionInfoData) {
                    if (gameData.quesitionInfoData[key].id == arr[0]) {
                        if (arr[1] == "1") {
                            c1 += +gameData.quesitionInfoData[key].coin1//贝壳
                            // c2 += +gameData.quesitionInfoData[key].coin2//金币
                            // c3 += +gameData.quesitionInfoData[key].coin3//珍珠
                        } else {
                            c3 = 0
                        }
                        break
                    }
                }
            }
            this.score1.string = c1 + ""
            // this.score3.string = (+dat.Score + +c3) + ""
            this.score2.string = (+dat.Score + +c3) + ""
        }
        let t = new Date(dat.QuestionDate * 1000)
        this.time.string = "登岛时间:" + t.getFullYear() + "年" + (t.getMonth() + 1) + "月" + t.getDate() + "日 " + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds()
    }
}
