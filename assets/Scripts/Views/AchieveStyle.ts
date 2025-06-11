import { gameData } from "../data/GameData";
import { Toast } from "../gui/Toast";
import HttpMgr from "../network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AchieveStyle extends cc.Component {
    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;
    @property(cc.Label)
    barDesc: cc.Label = null;
    @property(cc.Label)
    title: cc.Label = null;
    @property(cc.Label)
    score: cc.Label = null;
    @property(cc.Node)
    scoreImgBK: cc.Node = null;
    @property(cc.Node)
    scoreImgJB: cc.Node = null;
    @property(cc.Node)
    scoreImgZZ: cc.Node = null;
    @property(cc.Button)
    btnGet: cc.Button = null;

    private currData;
    initData(dat) {
        if (!dat) return
        this.currData = dat
        this.barDesc.string = "0/" + dat.score
        this.title.string = dat.name
        this.bar.progress = 0
        // this.btnGet.enabled = false
        this.btnGet.node.active = false
        HttpMgr.instance.getQuestionRank().then((res) => {
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
            // c1 = 190
            this.barDesc.string = c1 + "/" + dat.score
            let prog = c1 / dat.score
            if (prog > 1) {
                this.bar.progress = 1
                if (gameData.userInfo.Title !== "" && +this.currData.id > gameData.userInfo.Title) {
                    // this.btnGet.enabled = true
                    this.btnGet.node.active = true
                }
            } else {
                this.bar.progress = prog
            }
        })
    }
    getTitle() {
        HttpMgr.instance.getTitle(+this.currData.id).then((res) => {
            this.btnGet.node.active = false
            gameData.userInfo.Title = res.data
            Toast.showToast("领取成功");
            console.log(res)
        })
    }
}
