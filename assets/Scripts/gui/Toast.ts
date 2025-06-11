import { RES } from "../manager/ResourceManager";


let winsize = cc.winSize;

let mToastManagerArr = [];

let moveTimer = undefined;

let index = -1;
let currDisplayToastArr = [];
let startPosY = winsize.height / 2 - 10;
let aniTag = -1;
let gstop: boolean = false;
let MAXTOAST = 4;

class ToastView {

    contentStr: string;
    moveTag: any;
    node: cc.Node = null;
    dismissTimer: any;
    tag: any;

    constructor(_str: string) {

        this.contentStr = _str;
        if (!this.node) {
            this.node = new cc.Node("toast");
        }

        this.node.active = false;
        this.node.position = cc.Vec3.ZERO;
        if (!this.contentStr) {
            return;
        }

        // 背景

        let t_img: cc.Sprite = this.node.addComponent(cc.Sprite);

        t_img.type = cc.Sprite.Type.SLICED;

        RES.loadTexture2DRes("common/toast", (sp: cc.SpriteFrame) => {
            let t_frame = sp;
            t_frame.insetBottom = 20;
            t_frame.insetTop = 20;
            t_frame.insetRight = 20;
            t_frame.insetLeft = 20;
            t_img.spriteFrame = t_frame;
        });

        // label
        let t_toastLabelNode: cc.Node = new cc.Node("toastLabel");
        this.node.addChild(t_toastLabelNode);
        let t_toastLabel: cc.RichText = t_toastLabelNode.addComponent(cc.RichText);
        t_toastLabel.fontSize = 30;
        t_toastLabel.lineHeight = 40;
        t_toastLabel.horizontalAlign = cc.macro.TextAlignment.CENTER;
        t_toastLabel.string = this.contentStr;
        // 适应尺寸
        t_toastLabelNode.on("size-changed", () => {
            if (cc.isValid(this.node)) {
                t_toastLabel.node.targetOff(this);
                let t_size = t_toastLabel.node.getContentSize();
                let t_height = Math.max(50, t_size.height + 25);
                t_img.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                this.node.width = t_size.width + 100;
                this.node.height = t_height;
            }
        }, this)

        this.node.position = cc.v3(this.node.position.x, startPosY, 0);
        this.node.zIndex = 20;
        let t_root = cc.director.getScene().getChildByName("UIRoot");
        if (!t_root) t_root = cc.director.getScene().getChildByName("Canvas");
        this.node.setParent(t_root);
    }



    startMoveAni(moveTag: any) {
        if (cc.isValid(this.node)) {
            this.moveTag = moveTag;
            let t_y = this.getPosition().y + currDisplayToastArr[0].getSize().height
            if (isNaN(t_y)) {
                t_y = 0;
            }

            // let t_seq = cc.moveTo(0.4, this.node.x, t_y)
            // t_seq.setTag(moveTag);
            // this.node.runAction(t_seq);
            cc.tween(this.node).to(0.4, { x: this.node.x, y: t_y }).start().tag(moveTag);
        }

    };

    stopMoveAni(_ani: any) {
        this.node.stopActionByTag(_ani);
    };

    show() {
        this.node.active = true;
        this.dismissTimer = setTimeout(this.dismiss.bind(this), 1.5 * 1000);
    };

    setPosition(position) {
        if (position == null)
            return;
        this.node.position = position;
    };

    getPosition() {
        return this.node.position;
    };

    getSize() {
        return cc.size(this.node.width, this.node.height);
    };

    dismiss() {
        this.cancelToast();
        if (currDisplayToastArr.pop() != this) {
            throw new Error("Toast Error");
        }
    };

    cancelToast() {
        this.node.removeFromParent(true);
        clearTimeout(this.dismissTimer);
        this.dismissTimer = undefined;
        if (this.tag == mToastManagerArr.length || gstop) {
            gstop = false;
            mToastManagerArr = [];
            index = -1;
            aniTag = -1;
        }
    };
}


function createToastView() {
    let t_info = mToastManagerArr[index + 1];
    if (mToastManagerArr.length == 0 || !t_info ||
        t_info.length == 0 || t_info == "" ||
        "Null" === t_info || "undefined" === t_info) {
        if (moveTimer) {
            clearInterval(moveTimer);
            moveTimer = undefined;
        }
        return;
    }
    index++;
    let t_lastToast = undefined;
    if (currDisplayToastArr.length > 0) {
        t_lastToast = currDisplayToastArr[0];
    }
    let t_newToast = new ToastView(mToastManagerArr[index]);
    t_newToast.tag = index + 1;
    currDisplayToastArr.unshift(t_newToast);
    let t_newStartPosY = startPosY;

    let t_newPos = cc.v2(t_newToast.getPosition().x, t_newStartPosY)
    t_newToast.setPosition(t_newPos);
    t_newToast.show();
    for (let i = 0; i < currDisplayToastArr.length; i++) {
        aniTag++;
        if (i == 0) {
            t_newToast.startMoveAni("moveAni" + aniTag)
        } else {
            let t_ani = currDisplayToastArr[i].moveTag;
            if (!t_ani) continue;
            currDisplayToastArr[i].stopMoveAni(t_ani);
            currDisplayToastArr[i].startMoveAni("moveAni" + aniTag);
        }
    }
}

function updateToastView() {
    if (index >= mToastManagerArr.length) {
        if (moveTimer) {
            clearInterval(moveTimer);
            moveTimer = undefined;
        }
        return;
    }
    createToastView();
}

function execToast() {
    if (!moveTimer) {
        createToastView();
        moveTimer = setInterval(updateToastView, 0.5 * 1000)
    }
}

function stopToast() {
    if (moveTimer) {
        clearInterval(moveTimer);
        moveTimer = undefined;
    }
    gstop = true;
}

function addToast(str: string) {

    let t_idx = index + 1;
    let t_len = mToastManagerArr.length - t_idx;//将要显示数目
    if (t_len > MAXTOAST) {
        mToastManagerArr.splice(t_idx, 1);
    }
    mToastManagerArr.push(str);
}


export class Toast {
    toastText: string;
    constructor(str: string, extra: any = true) {
        this.toastText = str;
    }

    show() {
        if (this.toastText) {
            addToast(this.toastText);
            execToast();
        }
    }

    stop() {
        stopToast();
    }

    static showToast(str: string, extra: any = true) {
        let t_toast = new Toast(str, extra);
        t_toast.show();
    }

}

