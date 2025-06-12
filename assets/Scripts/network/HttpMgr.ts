import { gameData } from "../data/GameData";
// 假设 ErrorPanel 节点在场景中唯一
import ErrorPanel from "../Views/ErrorPanel";

export default class HttpMgr {
    private static _instance: HttpMgr;
    static get instance(): HttpMgr {
        if (this._instance == null) this._instance = new HttpMgr()
        return this._instance
    }
    async getSign() {
        return new Promise<object>((resolve, reject) => {
            HttpMgr.instance.request("get_sign", { data: window.location.href }).then((res) => {
                resolve(res)
            })
        })
    }
    async getQuestionRank() {
        return new Promise<object>((resolve, reject) => {
            let result = { Act: "find", Data: { UserId: gameData.userID } }
            HttpMgr.instance.request("user_question", result).then((res) => {
                resolve(res)
            })
        })
    }

    async getUserTicket() {
        let dat = JSON.parse(JSON.stringify(gameData.userInfo))
        return new Promise<object>((resolve, reject) => {
            let result = { Act: "find", Data: dat }
            HttpMgr.instance.request("get_user_ticket_all", result).then((res) => {
                resolve(res)
            })
        })
    }
    async setClientKey(key) {
        let dat = JSON.parse(JSON.stringify(gameData.userInfo))
        dat.ClientKey = key
        return new Promise<object>((resolve, reject) => {
            let result = { Act: "find", data: dat }
            HttpMgr.instance.request("set_client_key", result).then((res) => {
                resolve(res)
            })
        })
    }
    async answerQuestion(questionType, questionResult, score, newScore = 0, timeMark = 0) {
        let result = { Act: "add", Data: { UserId: gameData.userID, QuestionType: questionType, QuestionResult: JSON.stringify(questionResult), score: score, newScore: newScore, questionDate: timeMark } }
        let r = await HttpMgr.instance.request("user_question", result);
        return r
    }
    async delQuestion() {
        let result = { Act: "del", Data: { UserId: gameData.userID } }
        let r = await HttpMgr.instance.request("user_question", result);
        return r
    }
    async getUserInfo(key) {
        let r = await HttpMgr.instance.request("user", { Act: "find", Data: { userKey: key } });
        return r;
    }

    async editUserInfo(obj) {
        let dat = JSON.parse(JSON.stringify(gameData.userInfo))
        for (let k in obj) {
            dat[k] = obj[k]
            gameData.userInfo[k] = obj[k]
        }
        let r = await HttpMgr.instance.request("user", { Act: "edit", Data: dat });
        return r;
    }

    async editUserTick(id, userKey, type, use) {
        var obj = {
            Id: id,
            UserKey: userKey,
            TicketType: type,
            Used: use
        }
        let r = await HttpMgr.instance.request("add_user_ticket", { Act: "edit", Data: obj });
        return r;
    }

    async delUserTick(userKey) {
        var obj = {
            UserKey: userKey,
        }
        let r = await HttpMgr.instance.request("del_user_ticket", { Act: "edit", Data: obj });
        return r;
    }

    async getTitle(titleType) {
        let dat = JSON.parse(JSON.stringify(gameData.userInfo))
        dat.Title = titleType
        let r = await HttpMgr.instance.request("user", { Act: "edit", Data: dat });
        return r;
    }

    async getAchieveInfo() {
        let r = await HttpMgr.instance.request("achieve_info", {});
        return r;
    }

    async getNodeInfo() {
        let r = await HttpMgr.instance.request("node_info", {});
        return r;
    }

    async getQuestionInfo() {
        let r = await HttpMgr.instance.request("question_info", {});
        return r;
    }

    async getCheckCode() {
        let r = await HttpMgr.instance.request("user_check_code", {});
        return r;
    }

    async request(cgi: string, data: Object): Promise<Object> {
        let result = {}
        data["Key"] = gameData.userKey
        console.log("request:" + cgi + "," + JSON.stringify(data))
        let host = "https://qihuoyouxi.singlesense.net:8090/"
        if (!gameData.isRelease) {
            host = "http://127.0.0.1:8090/"
        }

        result = await this.requestPost(host + cgi, data)
        return new Promise<Object>((resolve, reject) => {
            resolve(result);
        })
        // if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        //     return new Promise<Object>((resolve, reject) => {
        //         wx.request({
        //             url: host + cgi,
        //             data: data,
        //             method: "POST",
        //             header: {
        //                 'content-type': 'application/json' // 默认值
        //             },
        //             success(res) {
        //                 console.log("request success", res)
        //                 result["data"] = res.data
        //                 resolve(result);
        //             }, fail(res) {
        //                 console.log("request fail", res)
        //             }
        //         })
        //     })
        // } else {
        //     let xhr = new XMLHttpRequest();
        //     xhr.open("POST", host + cgi, true);
        //     xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
        //     return new Promise<Object>((resolve, reject) => {
        //         xhr.onreadystatechange = function () {
        //             if (xhr.readyState == 4) {
        //                 let data = xhr.responseText
        //                 try {
        //                     data = JSON.parse(data)
        //                 } catch (error) {

        //                 }
        //                 console.log("request success", data)
        //                 result["data"] = data
        //                 resolve(result);
        //             }
        //         };
        //         xhr.onerror = function (err) {
        //             console.log("request onerror", err)
        //             result["error"] = "Network error"
        //             resolve(result);
        //         };
        //         xhr.send(JSON.stringify(data));
        //     });
        // }
    }

    static showError(msg: string) {
        // 获取 ErrorPanel 节点（根据你的实际节点路径调整）
        const errorPanelNode = cc.find("Canvas/errorPanel");
        if (errorPanelNode) {
            const errorPanel = errorPanelNode.getComponent(ErrorPanel);
            if (errorPanel) {
                errorPanel.showError(msg);
                errorPanelNode.active = true;
            }
        }
        localStorage.setItem("network_error", "false");
    }

    async requestGet(url: string, data: Object): Promise<Object> {
        let result = {}
        console.log("requestURL:" + url + "," + JSON.stringify(data))
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            return new Promise<Object>((resolve, reject) => {
                wx.request({
                    url: url,
                    data: data,
                    method: "GET",
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                        console.log("request success", res)
                        result["data"] = res.data
                        resolve(result);
                    }, fail(res) {
                        console.log("request fail", res)
                        result["error"] = "WX request fail"
                        HttpMgr.showError(result["error"]);
                        resolve(result);
                    }
                })
            })
        } else {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
            return new Promise<Object>((resolve, reject) => {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status !== 200) {
                            result["error"] = "请求失败: " + xhr.status;
                            HttpMgr.showError(result["error"]);
                            resolve(result);
                            return;
                        }
                        let data = xhr.responseText
                        try {
                            data = JSON.parse(data)
                        } catch (error) {

                        }
                        console.log("request success", data)
                        result["data"] = data
                        localStorage.setItem("network_error", "true");
                        resolve(result);
                    }
                };
                xhr.onerror = function (err) {
                    console.log("request onerror", err)
                    result["error"] = "网络错误,请刷新后重试"
                    HttpMgr.showError(result["error"]);
                    resolve(result);
                };
                xhr.send(JSON.stringify(data));
            });
        }
    }

    async requestPost(url: string, data: Object): Promise<Object> {
        let result = {}
        console.log("requestPost:" + url + "," + JSON.stringify(data))
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            return new Promise<Object>((resolve, reject) => {
                wx.request({
                    url: url,
                    data: data,
                    method: "POST",
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                        console.log("request success", res)
                        result["data"] = res.data
                        resolve(result);
                    }, fail(res) {
                        console.log("request fail", res)
                        result["error"] = "WX request fail"
                        HttpMgr.showError(result["error"]);
                        resolve(result);
                    }
                })
            })
        } else {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
            return new Promise<Object>((resolve, reject) => {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status !== 200) {
                            result["error"] = "请求失败: " + xhr.status;
                            HttpMgr.showError(result["error"]);
                            localStorage.setItem("network_error", "true");
                            resolve(result);
                            return;
                        }
                        let data = xhr.responseText
                        try {
                            data = JSON.parse(data)
                        } catch (error) {

                        }
                        console.log("request success", data)
                        result["data"] = data
                        resolve(result);
                    }
                };
                xhr.onerror = function (err) {
                    console.log("request onerror", err)
                    result["error"] = "网络错误,请刷新后重试"
                    HttpMgr.showError(result["error"]);
                    resolve(result);
                };
                xhr.send(JSON.stringify(data));
            });
        }
    }
}
