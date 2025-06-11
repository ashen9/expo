const { ccclass, property } = cc._decorator;

@ccclass
export default class test2 extends cc.Component {

    @property(cc.Node)
    nodeA: cc.Node = null;
    @property(cc.Node)
    nodeB: cc.Node = null;
    @property({ type: [cc.Node] })
    obstacles = [];
    @property(cc.Node)
    obstacle: cc.Node = null;
    @property(cc.Node)
    player: cc.Node = null;
    @property(cc.Node)
    map: cc.Node = null;
    @property(cc.Node)
    tarNode: cc.Node = null;

    private _tarPos: cc.Vec2 = new cc.Vec2(0, 0);

    protected onLoad(): void {
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;

        // let line = new cc.Line(p1, p2);
        // let rect = obstacle.getBoundingBoxToWorld();
        // let intersect = cc.Intersection.lineRect(line, rect);
    }

    start() {
        // this.initStyle();
        this.checkCross();
        this.onBtnClick();
    }

    onBtnClick() {
        this.nodeA.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            let pos = new cc.Vec2(event.getLocationX(), event.getLocationY());//转换为节点(局部)空间坐标系
            //pos = this.node.convertToNodeSpaceAR(pos);//将一个点转换到节点 (局部) 空间坐标系，这个坐标系以锚点为原点。//给要移动的物体赋值
            this.nodeA.position = cc.v3(pos);
            this.checkCross();
        })

        this.nodeB.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            let pos = new cc.Vec2(event.getLocationX(), event.getLocationY());//转换为节点(局部)空间坐标系
            //pos = this.node.convertToNodeSpaceAR(pos);//将一个点转换到节点 (局部) 空间坐标系，这个坐标系以锚点为原点。//给要移动的物体赋值
            this.nodeB.position = cc.v3(pos);
            this.checkCross();
        })

        this.map.on(cc.Node.EventType.TOUCH_END, (event) => {
            let pos = new cc.Vec2(event.getLocationX(), event.getLocationY());
            this._tarPos = pos;
            this.tarNode.position = cc.v3(pos);
            this.playerTouchEnd();

        })
        this.map.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            let pos = new cc.Vec2(event.getLocationX(), event.getLocationY());
            this._tarPos = pos;
            this.tarNode.position = cc.v3(pos);
        })

    }

    initStyle() {
        let obstacle: cc.Node = this.obstacle
        let worldPoints = obstacle.getComponent(cc.PolygonCollider).world.points;
        let style = obstacle.children[0];
        for (let i = 0; i < worldPoints.length; i++) {
            let node = cc.instantiate(style);
            node.setParent(obstacle);
            node.position = cc.v3(worldPoints[i]);
            node.active = true;
        }
    }



    hasObstacleBetween(p1: cc.Vec2, p2: cc.Vec2): boolean {
        // cc.log(p1, p2)
        for (let i = 0; i < this.obstacles.length; i++) {
            let obstacle: cc.Node = this.obstacles[i];
            let worldPoints = obstacle.getComponent(cc.PolygonCollider).world.points;
            let intersect = cc.Intersection.linePolygon(p1, p2, worldPoints);
            if (intersect) {
                this.nodeA.color = cc.Color.RED;
                this.nodeB.color = cc.Color.RED;
                return true;
            }
        }
        this.nodeA.color = cc.Color.GREEN;
        this.nodeB.color = cc.Color.GREEN;
        return false;
    }


    checkObstacle(p1: cc.Vec2, p2: cc.Vec2): boolean {
        let worldPoints = this.obstacle.getComponent(cc.PolygonCollider).world.points;
        let intersect = cc.Intersection.linePolygon(p1, p2, worldPoints);
        // let intersect = cc.Intersection.pointInPolygon(p1, worldPoints);
        if (intersect) {
            return true;
        }
        return false;
    }


    checkCross() {
        let p1 = new cc.Vec2(this.nodeA.x, this.nodeA.y);
        let p2 = new cc.Vec2(this.nodeB.x, this.nodeB.y);
        let obstacleDetected = this.hasObstacleBetween(p1, p2);
        console.log("Obstacle detected:", obstacleDetected);
    }

    playerMove() {

    }

    playerTouchEnd() {
        let p1 = cc.v2(this.player.position);
        let p2 = cc.v2(this.tarNode.position)
        let isCross = this.checkObstacle(p1, p2)
        if (!isCross) {
            cc.tween(this.player).to(0.5, { position: this.tarNode.position }).start();
        } else {
            this.check(this._tarPos)
        }
    }


    check(endPos: cc.Vec2) {
        // let endPos: cc.Vec2 = cc.v2(this.nodeB.position);
        let tar_arr: Array<number> = new Array();
        let player_arr: Array<number> = new Array();
        // let worldPoints = this.obstacle.getComponent(cc.PolygonCollider).world.points;
        let worldPoints = this.obstacle.children;
        for (let i = 0; i < worldPoints.length; i++) {
            let pos = cc.v2(this.obstacle.convertToWorldSpaceAR(worldPoints[i].position));
            let isCross = this.checkObstacle(pos, endPos)
            let player_isCross = this.checkObstacle(pos, cc.v2(this.player.position));
            if (!player_isCross) {
                player_arr.push(i);
            }
            // cc.log(isCross)
            if (!isCross) {
                tar_arr.push(i);
            }
        }

        cc.log("用户未穿过->", player_arr, "   目标未穿过->", tar_arr);


        // if (arr.length < 1) {
        //     cc.log("没有重叠");
        //     return
        // }
        // let destance = 0;
        // let endIndex = 0;
        // for (let i = 0; i < arr.length; i++) {
        //     let dis = endPos.sub(cc.v2(worldPoints[arr[i]].position)).mag();
        //     if (destance == 0) {
        //         destance = dis;
        //     } else {
        //         if (dis < destance) {
        //             destance = dis;
        //             endIndex = arr[i];
        //         }
        //     }
        // }
        // cc.log(destance, endIndex)
        // cc.log(arr);
    }

    chaifen() {
        //1、到达tar_arr当前点，当前点顺时针遍历是否穿过并且计算距离
        //2、找到未穿过并且距离最短的节点移动过去，需要保存每个路径节点
        //3、重复上述步骤直到走完，并加上到达player的距离
        //4、然后再逆时针走，然后对比两次路径，选择最短路径，进行保存
        //5、到达tar_arr剩下的点

        let tar_arr = [0, 4];
        let player_arr = [1, 2, 3]
        for (let i = 0; i < tar_arr.length; i++) {
            // let dis = 

        }
    }


}
