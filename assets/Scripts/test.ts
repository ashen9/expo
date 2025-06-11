const { ccclass, property } = cc._decorator;

@ccclass
export default class test extends cc.Component {

    @property(cc.Node)
    player: cc.Node = null;

    @property(cc.Node)
    content: cc.Node = null;
    @property(cc.Float)
    curPlayerNum: number = 0.0

    @property(cc.Label)
    showLab: cc.Label = null;

    // @property([cc.Node])
    nodeArr: cc.Node[] = []

    _curDir: number = 1;
    set curDir(v: number) {
        this._curDir = v;
        // this.player.scaleX = -v;

        this.showLab.string = `当前方向:${v}`
    }
    get curDir() {
        return this._curDir;
    }

    tarNum: number = 0;
    midNum: number = 0;

    shipDir: number = 1;

    isMoveing: boolean = false

    protected onLoad(): void {
        this.nodeArr = this.content.children;
        this.init();
    }


    init() {
        for (let i = 1; i < this.nodeArr.length + 1; i++) {
            let t_btn = this.nodeArr[i - 1];
            if (this.curPlayerNum == i) {
                this.player.position = t_btn.position;
            }
            t_btn.on(cc.Node.EventType.TOUCH_END, () => {
                if (this.isMoveing)
                    return
                this.tarNum = i;
                console.log("目标:", this.tarNum);
                if (this.curPlayerNum != this.tarNum) {
                    this.isMoveing = true;
                    this.testMove();
                }
            }, this)
        }

        // for (let i = 0; i < this.nodeArr.length; i++) {
        //     let t_btn = this.nodeArr[i];
        //     if (this.curPlayerNum == i) {
        //         this.player.position = t_btn.position;
        //     }
        //     t_btn.on(cc.Node.EventType.TOUCH_END, () => {
        //         console.log(i);
        //         this.tarNum = i;
        //         if (this.curPlayerNum != this.tarNum) {
        //             this.testMove();
        //         }
        //     }, this)
        // }

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
    move() {
        let nextNum = this.curPlayerNum + this.curDir * 1;
        console.log("move~", nextNum)

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
        this.player.scaleX = this.shipDir;
        let pos = nextNode.position
        cc.tween(this.player).to(1, { x: pos.x, y: pos.y }).call(() => {
            this.curPlayerNum = nextNum;
            if (nextNum == this.tarNum) {
                this.curPlayerNum = this.tarNum;
                console.log("到达目标:", this.curPlayerNum);
                this.isMoveing = false;
                return
            } else {
                this.move();
            }
        }).start();
    }
}
