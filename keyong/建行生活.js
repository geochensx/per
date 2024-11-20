/**
 * �ű����ƣ���������
 * ���ڣ���������APP -> ��ҳ -> ��Ա���� -> ǩ��
 * �ű�˵��������ǩ�����Ż�ȯ������򳵡������Ż�ȯ����������д�ֶ�ǩ��һ�μ��ɻ�ȡǩ�����ݣ�Ĭ����ȡ����ȯ������ BoxJS ���ý�Ʒ������ Node.js �������������� JHSH_BODY��JHSH_GIFT��JHSH_LOGIN_INFO�����˺ŷָ�� "|"��
 * �ֿ��ַ��https://github.com/FoKit/Scripts
 * ����ʱ�䣺2023-10-31  �޸����˺� Set-Cookie �����Ĵ�������
 * ����ʱ�䣺2023-10-30  �޸� Cokie ʧЧ���⣬��������ȯ���Ͳ�������л Sliverkiss��??????���Ծ��һ� �����ṩ������
 * ����ʱ�䣺2024-01-30  �޸� Stash �������޷���ȡ mbc-user-agent ��������
 * ����ʱ�䣺2024-01-31  ���ӽ�ǿ��û��Զ���ǩ���ܣ��ǽ������ÿ��û�����ǩ�� 7 ���Ż����Ƚϵ�(��39Ԫ��10Ԫ)
 * ����ʱ�䣺2024-02-18  �޸�Ĭ�϶�ǩ����
 * ����ʱ�䣺2024-02-21  �޸��������������޷��Զ���ȡǩ����������
 * ����ʱ�䣺2024-03-27  ֧�� Node.js ������ȡ�ű�ͬĿ¼ box.dat �� JHSH_SKIPDAY ���棬���ݸ�ʽ��{"JHSH_SKIPDAY": "3"}
/*

https://raw.githubusercontent.com/FoKit/Scripts/main/boxjs/fokit.boxjs.json
https://raw.githubusercontent.com/FoKit/Scripts/main/rewrite/get_jhsh_cookie.sgmodule

------------------ Surge ���� -----------------

[MITM]
hostname = yunbusiness.ccb.com

[Script]
�������� = type=http-request,pattern=^https:\/\/yunbusiness\.ccb\.com\/(clp_coupon|clp_service)\/txCtrl\?txcode=(A3341A038|autoLogin),requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js

�������� = type=cron,cronexp=17 7 * * *,timeout=60,script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js,script-update-interval=0

------------------ Loon ���� ------------------

[MITM]
hostname = yunbusiness.ccb.com

[Script]
http-request ^https:\/\/yunbusiness\.ccb\.com\/(clp_coupon|clp_service)\/txCtrl\?txcode=(A3341A038|autoLogin) tag=��������, script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js,requires-body=1

cron "17 7 * * *" script-path=https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js,tag = ��������,enable=true

-------------- Quantumult X ���� --------------

[MITM]
hostname = yunbusiness.ccb.com

[rewrite_local]
^https:\/\/yunbusiness\.ccb\.com\/(clp_coupon|clp_service)\/txCtrl\?txcode=(A3341A038|autoLogin) url script-request-body https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js

[task_local]
17 7 * * * https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js, tag=��������, enabled=true

------------------ Stash ���� -----------------

cron:
  script:
    - name: ��������
      cron: '17 7 * * *'
      timeout: 10

http:
  mitm:
    - "yunbusiness.ccb.com"
  script:
    - match: ^https:\/\/yunbusiness\.ccb\.com\/(clp_coupon|clp_service)\/txCtrl\?txcode=(A3341A038|autoLogin)
      name: ��������
      type: request
      require-body: true

script-providers:
  ��������:
    url: https://raw.githubusercontent.com/FoKit/Scripts/main/scripts/jhsh_checkIn.js
    interval: 86400

*/

const $ = new Env('��������');
const notify = $.isNode() ? require('./sendNotify') : '';
let AppId = '1472477795', giftMap = { "1": "��", "2": "����", "3": "����" }, message = '';
let giftType = getEnv('JHSH_GIFT') || '2';  // �������ͣ�Ĭ����ȡ'����'ȯ
let bodyStr = getEnv('JHSH_BODY') || '';  // ǩ������� body
let autoLoginInfo = getEnv('JHSH_LOGIN_INFO') || '';  // ˢ�� session ���������
let AppVersion = getEnv('JHSH_VERSION') || '2.1.5.002';  // ���°汾�ţ���ȡʧ��ʱʹ��
let skipDay = getEnv('JHSH_SKIPDAY') || '';  // �¸���ǩ�� (�����ڽ�ǿ��û�)
let bodyArr = bodyStr ? bodyStr.split("|") : [];
let bodyArr2 = autoLoginInfo ? autoLoginInfo.split("|") : [];
$.is_debug = getEnv('is_debug') || 'false';

if (isGetCookie = typeof $request !== `undefined`) {
    GetCookie();
    $.done();
} else {
    !(async () => {
        if (!autoLoginInfo || !bodyStr) {
            $.msg($.name, '? ���Ȼ�ȡ��������Cookie��');
            return;
        }
        const date = new Date();
        $.whichDay = date.getDay();
        $.weekMap = {
            0: "������",
            1: "����һ",
            2: "���ڶ�",
            3: "������",
            4: "������",
            5: "������",
            6: "������",
        };
        if ($.whichDay === parseInt(skipDay)) {
            let text = `�����Ƕ�ǩ��[${$.weekMap[$.whichDay]}], ����ǩ������`
            console.log(text);
            message += text;
            return;
        }
        console.log(`\n����[${bodyArr.length}]�����������˺�\n`);
        await getLatestVersion();  // ��ȡ�汾��Ϣ
        for (let i = 0; i < bodyArr.length; i++) {
            if (bodyArr[i]) {
                $.index = i + 1;
                $.token = '';
                $.info = JSON.parse(bodyArr[i]);
                $.info2 = JSON.parse(bodyArr2[i]);
                $.giftList = [];
                $.giftList2 = [];
                $.getGiftMsg = "";
                $.isGetGift = false;
                $.DeviceId = $.info2['DeviceId'];
                $.MBCUserAgent = $.info2['MBCUserAgent'];
                $.ALBody = $.info2['Body'];
                console.log(`\n===== �˺�[${$.info?.USR_TEL || $.index}]��ʼǩ�� =====\n`);
                if (!$.info?.MID || !$.DeviceId || !$.MBCUserAgent || !$.ALBody) {
                    message += `? �˺� [${$.info?.USR_TEL ? hideSensitiveData($.info?.USR_TEL, 3, 4) : $.index}] ȱ�ٲ����������»�ȡCookie��\n`;
                    continue;
                }
                await autoLogin();  // ˢ�� session
                if (!$.token) continue;
                await main();  // ǩ��������
                if ($.giftList.length > 0) {
                    for (let j = 0; j < $.giftList.length; j++) {
                        if ($.isGetGift) break;
                        let item = $.giftList[j]
                        $.couponId = item?.couponId;
                        $.nodeDay = item?.nodeDay;
                        $.couponType = item?.couponType;
                        $.dccpBscInfSn = item?.dccpBscInfSn;
                        $.continue = false;
                        console.log(`������ȡ[${giftMap[giftType]}]ȯ`);
                        for (let k = 1; k <= 3; k++) {
                            if (!$.continue) {
                                if (k >= 2) console.log(`��ȡʧ�ܣ�����һ��`);
                                await $.wait(1000 * 5);
                                await getGift();  // ��ȡ����
                                if ($.isGetGift) break;
                            }
                        }
                    };
                    if (!$.isGetGift) {
                        $.getGiftMsg = `���app�鿴�Ż�ȯ���������\n`;
                    }
                    message += "��" + $.getGiftMsg;
                }
                await $.wait(1000 * 3);
            }
        }
    })()
        .catch((e) => {
            $.log('', `? ${$.name}, ʧ��! ԭ��: ${e}!`, '')
        })
        .finally(async () => {
            if (message) {
                message = message.replace(/\n+$/, '');
                if ($.isNode()) {
                    await notify.sendNotify($.name, message);
                } else {
                    $.msg($.name, '', message);
                }
            }
            $.done();
        })
}


// ��ȡǩ������
function GetCookie() {
    debug($request.headers);
    debug($request.body);
    const headers = ObjectKeys2LowerCase($request.headers);  // �� headers ������ key ת��ΪСд�Լ��ݸ������� App
    if (/A3341A038/.test($request.url)) {
        $.body = JSON.parse($request.body);
        $.body['MID'] = headers['mid'];
        $.body = JSON.stringify($.body);
        console.log(`��ʼ�����û����� ${$.body}`);
        $.setdata($.body, 'JHSH_BODY');
        $.msg($.name, ``, `? ��������ǩ�����ݻ�ȡ�ɹ���`);
    } else if (/autoLogin/.test($request.url)) {
        $.DeviceId = headers['deviceid'];
        $.MBCUserAgent = headers['mbc-user-agent'];
        if ($.DeviceId && $.MBCUserAgent && $request.body) {
            autoLoginInfo = {
                "DeviceId": $.DeviceId,
                "MBCUserAgent": $.MBCUserAgent,
                "Body": $request.body
            }
            $.setdata(JSON.stringify(autoLoginInfo), 'JHSH_LOGIN_INFO');
            console.log(JSON.stringify(autoLoginInfo) + "д��ɹ�");
        } else {
            console.log("? autoLogin ���ݻ�ȡʧ��");
        }
    }
}


// ˢ�� session
async function autoLogin() {
    let opt = {
        url: `https://yunbusiness.ccb.com/clp_service/txCtrl?txcode=autoLogin`,
        headers: {
            'AppVersion': AppVersion,
            'Content-Type': `application/json`,
            'DeviceId': $.DeviceId,
            'Accept': `application/json`,
            'MBC-User-Agent': $.MBCUserAgent,
            'Cookie': ''
        },
        body: $.ALBody
    }
    debug(opt)
    return new Promise(resolve => {
        $.post(opt, async (error, response, data) => {
            try {
                let result = $.toObj(data) || response.body;
                // �������δ���ܣ��� session δ����
                if (result?.errCode) {
                    // {"newErrMsg":"δ�ܴ������������������ʣ�����ѯ���߿ͷ����µ�95533","data":"","reqFlowNo":"","errCode":"0","errMsg":"sessionδʧЧ,���ظ���¼"}
                    // $.token = $.getdata('JHSH_TOKEN');
                    console.log(`${result?.errMsg}`);
                } else {
                    const set_cookie = response.headers['set-cookie'] || response.headers['Set-cookie'] || response.headers['Set-Cookie'];
                    // !$.isNode() ? $.setdata($.token, 'JHSH_TOKEN') : '';  // ���ݳ־û�
                    let new_cookie = $.toStr(set_cookie).match(/SESSION=([a-f0-9-]+);/);
                    if (new_cookie) {
                        $.token = new_cookie[0];
                        console.log(`? ˢ�� session �ɹ�!`);
                        debug(new_cookie);
                    } else {
                        message += `? �˺� [${$.info?.USR_TEL ? hideSensitiveData($.info?.USR_TEL, 3, 4) : $.index}] ˢ�� session ʧ�ܣ������»�ȡCookie��\n`;
                        console.log(`?? ˢ�� session ʧ��`);
                        debug(set_cookie);
                    }
                }
            } catch (error) {
                $.log(error);
            } finally {
                resolve()
            }
        });
    })
}


// ǩ��������
async function main() {
    let opt = {
        url: `https://yunbusiness.ccb.com/clp_coupon/txCtrl?txcode=A3341A115`,
        headers: {
            "Mid": $.info?.MID,
            "Content-Type": "application/json",
            "User-Agent": "%E5%BB%BA%E8%A1%8C%E7%94%9F%E6%B4%BB/2024110401 CFNetwork/1568.100.1 Darwin/24.0.0",
            //   "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/CloudMercWebView/UnionPay/1.0 CCBLoongPay",
            "Accept": "application/json,text/javascript,*/*",
            "Cookie": $.token
        },
        body: `{"ACT_ID":"${$.info.ACT_ID}","REGION_CODE":"${$.info.REGION_CODE}","chnlType":"${$.info.chnlType}","regionCode":"${$.info.regionCode}"}`
    }
    debug(opt)
    return new Promise(resolve => {
        $.post(opt, async (err, resp, data) => {
            try {
                err && $.log(err);
                if (data) {
                    debug(data);
                    data = JSON.parse(data);
                    let text = '';
                    if (data.errCode == 0) {
                        text = `? �˺� [${$.info?.USR_TEL ? hideSensitiveData($.info?.USR_TEL, 3, 4) : $.index}] ǩ���ɹ�`;
                        console.log(text);
                        message += text;
                        if (data?.data?.IS_AWARD == 1) {
                            // �����Զ���ǩ��
                            if (skipDay >= 0) {
                                // �� $.whichDay ���� 6 ʱ����һ��ǩ������Ϊ 0������ $.whichDay + 1
                                $.whichDay = $.whichDay == 6 ? 0 : $.whichDay + 1;
                                $.setdata(String($.whichDay), 'JHSH_SKIPDAY');
                                console.log(`?? �Ѹ��¶�ǩ���ã�����(${$.weekMap[$.whichDay]})�����ǩ`);
                            }
                            $.GIFT_BAG = data?.data?.GIFT_BAG;
                            $.GIFT_BAG.forEach(item => {
                                let body = { "couponId": item.couponId, "nodeDay": item.nodeDay, "couponType": item.couponType, "dccpBscInfSn": item.dccpBscInfSn };
                                if (new RegExp(`${giftMap[giftType]}`).test(item?.couponName)) {
                                    if (/���ÿ�/.test(item?.couponName)) {
                                        $.giftList.unshift(body);
                                    } else {
                                        $.giftList.push(body);
                                    }
                                } else {
                                    $.giftList2.push(body);
                                }
                            })
                            $.giftList = [...$.giftList, ...$.giftList2];
                        } else if (data?.data?.NEST_AWARD_DAY >= 1) {
                            text = `����ǩ��${data.data.NEST_AWARD_DAY}�����ȡ${giftMap[giftType]}ȯ`;
                            message += `��${text}\n`;
                            console.log(text);
                        } else {
                            console.log(`���޿���ȡ�Ľ���`);
                            message += "\n";
                        }
                    } else {
                        console.log(JSON.stringify(data));
                        text = `? �˺� [${$.info?.USR_TEL ? hideSensitiveData($.info?.USR_TEL, 3, 4) : $.index}] ǩ��ʧ�ܣ�${data.errMsg}\n`;
                        console.log(text);
                        message += text;
                    }
                } else {
                    $.log("�����������˿�����");
                }
            } catch (error) {
                $.log(error);
            } finally {
                resolve();
            }
        })
    })
}


// ��ȡ����
async function getGift() {
    let opt = {
        url: `https://yunbusiness.ccb.com/clp_coupon/txCtrl?txcode=A3341C082`,
        headers: {
            "Mid": $.info?.MID,
            "Content-Type": "application/json;charset=utf-8",
            "User-Agent": "%E5%BB%BA%E8%A1%8C%E7%94%9F%E6%B4%BB/2024110401 CFNetwork/1568.100.1 Darwin/24.0.0",
            //   "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/CloudMercWebView/UnionPay/1.0 CCBLoongPay",
            "Accept": "application/json,text/javascript,*/*"
        },
        body: `{"mebId":"${$.info.MEB_ID}","actId":"${$.info.ACT_ID}","nodeDay":${$.nodeDay},"couponType":${$.couponType},"nodeCouponId":"${$.couponId}","dccpBscInfSn":"${$.dccpBscInfSn}","chnlType":"${$.info.chnlType}","regionCode":"${$.info.regionCode}"}`
    }
    debug(opt);
    return new Promise(resolve => {
        $.post(opt, async (err, resp, data) => {
            try {
                err && $.log(err);
                if (data) {
                    debug(data);
                    data = JSON.parse(data);
                    if (data.errCode == 0) {
                        $.isGetGift = true;
                        $.getGiftMsg = `���ǩ��������${data?.data?.title}��${data?.data?.subTitle}��\n`;
                        console.log($.getGiftMsg);
                    } else {
                        $.continue = true;
                        console.log(JSON.stringify(data));
                    }
                } else {
                    $.log("�����������˿�����");
                }
            } catch (error) {
                $.log(error);
            } finally {
                resolve();
            }
        })
    })
}


// ��ȡ���°汾
async function getLatestVersion() {
    let opt = {
        url: `https://itunes.apple.com/cn/lookup?id=${AppId}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
    return new Promise(resolve => {
        $.get(opt, async (err, resp, data) => {
            try {
                err && $.log(err);
                if (data) {
                    try {
                        let result = JSON.parse(data);
                        const { trackName, bundleId, version, currentVersionReleaseDate, } = result.results[0];
                        AppVersion = version;
                        !$.isNode() ? $.setdata(AppVersion, 'JHSH_VERSION') : '';  // ���ݳ־û�
                        console.log(`�汾��Ϣ: ${trackName} ${version}\nBundleId: ${bundleId} \n����ʱ��: ${currentVersionReleaseDate}`);
                    } catch (e) {
                        $.log(e);
                    };
                } else {
                    console.log(`�汾��Ϣ��ȡʧ��\n`);
                }
            } catch (error) {
                $.log(error);
            } finally {
                resolve();
            }
        })
    })
}


// ��ȡ��������
function getEnv(...keys) {
    for (let key of keys) {
        var value = $.isNode() ? process.env[key] || process.env[key.toUpperCase()] || process.env[key.toLowerCase()] || $.getdata(key) : $.getdata(key);
        if (value) return value;
    }
}


/**
 * ��������תСд
 * @param {object} obj - ���� $request.headers
 * @returns {object} ����ת����Ķ���
 */
function ObjectKeys2LowerCase(obj) {
    const _lower = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]))
    return new Proxy(_lower, {
        get: function (target, propKey, receiver) {
            return Reflect.get(target, propKey.toLowerCase(), receiver)
        },
        set: function (target, propKey, value, receiver) {
            return Reflect.set(target, propKey.toLowerCase(), value, receiver)
        }
    })
}


// ��������
function hideSensitiveData(string, head_length = 2, foot_length = 2) {
    let star = '';
    try {
        for (var i = 0; i < string.length - head_length - foot_length; i++) {
            star += '*';
        }
        return string.substring(0, head_length) + star + string.substring(string.length - foot_length);
    } catch (e) {
        console.log(e);
        return string;
    }
}


// DEBUG
function debug(content, title = "debug") {
    let start = `\n----- ${title} -----\n`;
    let end = `\n----- ${$.time('HH:mm:ss')} -----\n`;
    if ($.is_debug === 'true') {
        if (typeof content == "string") {
            console.log(start + content + end);
        } else if (typeof content == "object") {
            console.log(start + $.toStr(content) + end);
        }
    }
}


// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }