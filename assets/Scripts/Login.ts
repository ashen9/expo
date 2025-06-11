import AppLaunch from "./AppLaunch";
import { gameData } from "./data/GameData";
import { Toast } from "./gui/Toast";
import HttpMgr from "./network/HttpMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Login extends AppLaunch {
    protected onLoad(): void {
        // <script src="http://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            this.login();
            this.checkUserInfo();
        } else {
            HttpMgr.instance.getSign().then((res) => {
                console.log(res)
                var dat = res["data"]
                wx.config({
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
                });

                wx.error(function (res) {
                    console.log(res)
                    // Toast.showToast("error")
                });
            })
            this.setUserShow(null)
        }
    }

    /**登录 */
    login() {
        // 微信登录获取用户OpenID和SessionKey
        wx.login({
            success: res => {
                console.log("login success", res)
                gameData.userKey = res.code
                // gameData.getUserInfo()
            },
            fail: err => {
                console.log("login err", err);
            }
        });
    }

    /**检查用户信息 */
    checkUserInfo() {
        let self = this;
        // 通过 wx.getSetting 查询用户是否已授权头像昵称信息
        wx.getSetting({
            success(res) {
                console.log("getSetting success", res)
                self.createLoginBtn()
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.getUserInfo({
                        success: function (res) {
                            console.log("getUserInfo success", res.userInfo)
                            self.setUserShow(res)
                        }, fail: err => {
                            console.log("getUserInfo err", err);
                            self.createLoginBtn()
                        }
                    })
                }
            }, fail: err => {
                console.log("getSetting err", err);
            }
        })
    }

    /**创建授权按钮 */
    createLoginBtn() {
        let self = this
        let screenWidth = wx.getSystemInfoSync().screenWidth;
        let screenHeight = wx.getSystemInfoSync().screenHeight;
        let button = wx.createUserInfoButton({
            type: 'text',
            text: '',
            // type: 'image',
            // image: '1.png',
            style: {
                // left: 0,
                // top: screenHeight / 2 - 20,
                // bottom: screenHeight / 2 + 20,
                width: screenWidth,
                height: screenHeight,
                // lineHeight: 40,
                // backgroundColor: "#808080",
                // color: '#000000',
                // textAlign: 'center',
                // fontSize: 16,
                // borderRadius: 4
            }
        });
        button.onTap((res) => {
            console.log("onTap", res)
            // 用户同意授权后回调，通过回调可获取用户头像昵称信息
            if (res.userInfo) {
                console.log("onTap", res)
                self.setUserShow(res)
                button.destroy();
            } else {
                console.log("用户拒绝授权");
            }
        })
    }
    /**
     * 设置用户显示信息
     * @param res 用户数据
     */
    setUserShow(res: any) {
        // Toast.showToast("获取用户信息成功,", res.nickName)
        if (res && res.userInfo) {
            console.log("setUserShow", res)
            let userInfo = res.userInfo

            // let nickName = userInfo.nickName
            // let avatarUrl = userInfo.avatarUrl
            // let gender = userInfo.gender //性别 0：未知、1：男、2：女
            // let province = userInfo.province
            // let city = userInfo.city
            // let country = userInfo.country
            gameData.wxUserInfo = userInfo
            cc.loader.load({ url: userInfo.avatarUrl, type: 'png' }, (err, texture) => {
                if (!err) {
                    // this.avatarImage.spriteFrame = new cc.SpriteFrame(texture);
                }
            });
        }
        cc.director.loadScene("main");
    }
}
