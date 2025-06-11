import SingleBase from "../base/SingleBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ResourceManager extends SingleBase {

    public loadTexture2DRes(url, callback?: Function) {
        cc.resources.load(url, cc.SpriteFrame, (error: Error, sp: cc.SpriteFrame) => {
            // cc.log(texture)
            if (error || !(sp instanceof cc.SpriteFrame)) {
                cc.log(`loadUrlImage failed:[${error}]`)
            } else {
                callback && callback(sp);
            }
        })
    }

    public loadJson(path: string, cb: Function) {
        cc.resources.load(`json/${path}`, (error: Error, res: cc.JsonAsset) => {
            if (error) {
                cc.log(`loadJson failed:[${error}]`)
            } else {
                cb && cb(res);
            }
        });
    }


    public loadAllJson() {
        cc.resources.loadDir("json", function (err, objects) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            cc.log(objects)
            // 对加载的对象数组进行遍历，获取每个JSON对象的数据
            objects.forEach(function (obj, index) {
                var jsonData = obj;
                cc.log(jsonData)
                // 对JSON数据进行处理
            });
        });
    }
}
export var RES: ResourceManager = ResourceManager.getInstance();
