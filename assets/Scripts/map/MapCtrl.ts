import { GameEvents } from "../GameConst";
import { gameData } from "../data/GameData";
import { NodeInfo } from "../data/GameInterface";
import { EVT } from "../event/EventCenter";
import { Toast } from "../gui/Toast";
import HttpMgr from "../network/HttpMgr";
import NodeInfoPanel from "./NodeInfoPanel";
import NodeStyle from "./NodeStyle";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapCtrl extends cc.Component {

    @property(cc.Node)
    nodeInfoPanel: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;


    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Node)
    path_node: cc.Node = null;

    @property(cc.Float)
    curPlayerNum: number = 0.0

    // @property(cc.Label)
    // showLab: cc.Label = null;


    // @property([cc.Node])
    nodeArr: cc.Node[] = []

    _curDir: number = 1;
    set curDir(v: number) {
        this._curDir = v;
    }
    get curDir() {
        return this._curDir;
    }

    tarNum: number = 0;
    readyNum: number = null;
    midNum: number = 0;

    shipDir: number = 1;
    isMoveing: boolean = false

    // nodeInfoComp: NodeInfoPanel = null
    path_sort: number[] = [1, 2, 3, 8, 9, 4, 7, 5, 15, 14, 6, 10, 13, 11, 12]

    protected onLoad(): void {
        EVT.on(GameEvents.SHOW_NODE_INFO_PANEL, this.showNodeInfoPanel, this);
        this.nodeArr = [];
        for (let i = 0; i < 15; i++) {
            // this.nodeArr.push(this.content.getChildByName((i + 1) + ""))
            this.nodeArr.push(this.content.getChildByName(this.path_sort[i] + ""))
        }

        // this.init();
    }

    private showNodeInfoPanel() {
        if (gameData.userInfo.Done.indexOf("," + gameData.curNodeInfo.id + ",") < 0) {
            this.nodeInfoPanel.active = true;
        } else {
            gameData.isScanLogin = false
            EVT.emit(GameEvents.SHOW_QUESITION_PANEL);
        }
    }

    private _curNS: NodeStyle = null;
    private _lastNS: NodeStyle = null;
    async init() {
        console.log(gameData.nodeInfoData)
        for (let i = 0; i < this.content.childrenCount; i++) {
            // console.log("===========MapCtrl===========>>>>", t_data);
            let t_item = this.content.getChildByName((i + 1) + "");
            if (!t_item) continue
            let t_data = gameData.nodeInfoData[i];
            let t_ns = t_item.getComponent(NodeStyle);
            let t_lab1 = t_item.children[0].getComponentInChildren(cc.Label);
            let t_lab2 = t_item.children[1].getComponentInChildren(cc.Label);
            t_lab1.fontSize = 26;
            t_lab2.fontSize = 26;
            t_lab1.lineHeight = 30;
            t_lab2.lineHeight = 30;
            if (t_data) {
                t_lab1.string = t_data.name;
                t_lab2.string = t_data.name;

                t_ns.init(t_data);
            }
        }

        for (let i = 1; i < this.nodeArr.length + 1; i++) {
            let t_btn = this.nodeArr[i - 1];
            if (this.curPlayerNum == i) {
                this.player.x = t_btn.position.x
                this.player.y = t_btn.position.y
            }

            let t_ns = t_btn.getComponent(NodeStyle);
            t_btn.on(cc.Node.EventType.TOUCH_END, () => {
                this._lastNS = this._curNS;
                this._curNS = t_ns;
                if (this._lastNS) {
                    this._lastNS.checkNode.active = false;
                }
                t_ns.onBtnClick();
                if (this.isMoveing) {
                    // return
                    this.readyNum = i;
                } else {
                    this.tarNum = i;
                    console.log("目标:", this.tarNum);
                    if (this.curPlayerNum != this.tarNum) {
                        this.isMoveing = true;
                        this.testMove();
                    }
                }
            });
        }
    }

    testMove() {
        //1.对比当前点到目标点的位置关系
        //2.选择从上走还是从下走
        //3.设置角色方向
        let midNum = this.nodeArr.length / 2
        let curValue = this.tarNum - this.curPlayerNum;
        console.log(curValue);

        if (curValue < 0) {
            this.curDir = Math.abs(curValue) < midNum ? -1 : 1;
        } else {
            this.curDir = Math.abs(curValue) > midNum ? -1 : 1;
        }
        if (this.curDir > 0) {
            console.log("顺时针")
        } else {
            console.log("逆时针")
        }
        this.move();
    }
    getDistance(p1: cc.Vec3, p2: cc.Vec3) {
        let len = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y))
        return len
    }
    getNextPoint(nextNum) {
        if (nextNum < 1) {
            nextNum = this.nodeArr.length
        }
        if (nextNum > this.nodeArr.length) {
            nextNum = 1
        }
        let nextNode = this.nodeArr[nextNum - 1];
        let curNode = this.nodeArr[this.curPlayerNum - 1];
        if (nextNode.x > curNode.x) {
            this.shipDir = -1;
        } else {
            this.shipDir = 1;
        }
        let result = [nextNum, nextNode]
        if (nextNum != this.tarNum) {
            let nextDoubleNum = nextNum + this.curDir * 1;
            if (nextDoubleNum < 1) {
                nextDoubleNum = this.nodeArr.length
            }
            if (nextDoubleNum > this.nodeArr.length) {
                nextDoubleNum = 1
            }
            let nextDoubleNode = this.nodeArr[nextDoubleNum - 1];

            let nx = curNode.x - nextNode.x
            let ny = curNode.y - nextNode.y
            let nnx = curNode.x - nextDoubleNode.x
            let nny = curNode.y - nextDoubleNode.y

            let lenNext = this.getDistance(nextNode.position, curNode.position)
            let lebNextDouble = this.getDistance(nextDoubleNode.position, curNode.position)
            // if (nx > 0 && nnx < 0 || nx < 0 && nnx > 0 || ny > 0 && nny < 0 || ny < 0 && nny > 0 || this.getDistance(nextNode.position, curNode.position) > this.getDistance(nextDoubleNode.position, curNode.position)) {
            if (this.getDistance(nextNode.position, curNode.position) > this.getDistance(nextDoubleNode.position, curNode.position)) {
                result = this.getNextPoint(nextDoubleNum)
            }
        }
        return result
    }
    move() {
        let nextNum = this.curPlayerNum + this.curDir * 1;
        console.log("move~", nextNum)
        // if (nextNum < 1) {
        //     nextNum = this.nodeArr.length
        // }
        // if (nextNum > this.nodeArr.length) {
        //     nextNum = 1
        // }
        // let nextNode = this.nodeArr[nextNum - 1];
        let curNode = this.nodeArr[this.curPlayerNum - 1];
        // if (nextNode.x > curNode.x) {
        //     this.shipDir = -1;
        // } else {
        //     this.shipDir = 1;
        // }
        let result = this.getNextPoint(nextNum)
        nextNum = result[0]
        let nextNode = result[1]

        if (nextNode.y - curNode.y > 100) {
            this.player.getChildByName("boat").getComponent(sp.Skeleton).setAnimation(0, "02_1", true)
        } else if (nextNode.y - curNode.y < -100) {
            this.player.getChildByName("boat").getComponent(sp.Skeleton).setAnimation(0, "03_1", true)
        } else {
            this.player.getChildByName("boat").getComponent(sp.Skeleton).setAnimation(0, "01_1", true)
        }

        this.player.scaleX = -this.shipDir;
        let pos = nextNode.position
        let speed = 0.5;
        let distance = curNode.position.sub(nextNode.position).mag();
        speed = distance / 200
        console.log("距离--->", distance)
        cc.tween(this.player).to(speed, { x: pos.x, y: pos.y }).call(() => {
            this.curPlayerNum = nextNum;
            if (nextNum == this.tarNum) {
                this.curPlayerNum = this.tarNum;
                console.log("到达目标:", this.curPlayerNum);
                let mark = this.player.getChildByName("boat").getComponent(sp.Skeleton).defaultAnimation
                // this.player.getChildByName("boat").getComponent(sp.Skeleton).setAnimation(0, mark.replace("_1", "_2"), true)
                this.player.getChildByName("boat").getComponent(sp.Skeleton).setAnimation(0, "01_1", true)
                this.isMoveing = false;
                if (this.readyNum != null) {
                    this.tarNum = this.readyNum;
                    this.readyNum = null;
                    this.isMoveing = true;
                    this.testMove();
                }
                return
            } else {
                this.move();
            }
        }).start();
    }

}
