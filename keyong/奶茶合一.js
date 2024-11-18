/*
------------------------------------------
@Author: Sliverkiss
@Date: 2024.05.08 21:08:18
@Description: �̲���һǩ��
------------------------------------------
- ��������������С����
- �Զ������Ч����Ĭ�Ϲرգ�����boxjs��
- ֧�ְ����輧�����ϰ��̡�����õ�ǩ��, ���������ɲ���https://www.qmai.cn/Case.Html

2024.09.30 �������ߣ����ٷ�ظ���
2024.09.02 ����������Զ�ʩ�ʿ��أ�Ĭ�ϴ򿪣����ʩ��400�Σ�����boxjs�رա�


��д��
1.��С����,��¼С������������token
2.�ֶ����һ��ǩ��,��¼�id

[Script]
http-response ^https:\/\/(webapi|webapi2)\.qmai\.cn\/web\/seller\/(oauth\/flash-sale-login|account\/login-minp) script-path=https://gist.githubusercontent.com/Sliverkiss/8b4f5487e0f28786c7dec9c7484dcd5e/raw/teaMilk.js, requires-body=true, timeout=60, tag=�̲��ȡtoken

http-request ^https:\/\/(webapi|webapi2|qmwebapi)\.qmai\.cn\/web\/(catering\/integral|cmk-center)\/sign\/(signIn|takePartInSign) script-path=https://gist.githubusercontent.com/Sliverkiss/8b4f5487e0f28786c7dec9c7484dcd5e/raw/teaMilk.js, requires-body=true, timeout=60, tag=�̲��ȡtoken

[MITM]
hostname = webapi2.qmai.cn,webapi.qmai.cn,qmwebapi.qmai.cn

??������������
------------------------------------------
1���˽ű�������ѧϰ�о�������֤��Ϸ��ԡ�׼ȷ�ԡ���Ч�ԣ��������������жϣ����˶Դ˲��е��κα�֤���Ρ�
2�����ڴ˽ű�������ѧϰ�о��������������غ� 24 Сʱ�ڽ��������ݴ����ļ�������ֻ����κδ洢�豸����ȫɾ������Υ���涨�����κ��¼����˶Դ˾�������
3�����𽫴˽ű������κ���ҵ��Ƿ�Ŀ�ģ���Υ���涨�����жԴ˸���
4���˽ű��漰Ӧ���뱾���޹أ����˶����������κ���˽й©������������е��κ����Ρ�
5�����˶��κνű�����������Ų����𣬰������������ɽű�����������κ���ʧ���𺦡�
6������κε�λ�������Ϊ�˽ű����������ַ���Ȩ����Ӧ��ʱ֪ͨ���ṩ���֤��������Ȩ֤�������ǽ����յ���֤�ļ�ȷ�Ϻ�ɾ���˽ű���
7������ֱ�ӻ���ʹ�á��鿴�˽ű����˾�Ӧ����ϸ�Ķ������������˱�����ʱ���Ļ򲹳��������Ȩ����һ����ʹ�û����˴˽ű�������Ϊ���ѽ��ܴ�����������
*/
const $ = new Env("TeaMilk");
const ckName = "teaMilk_data";
const userCookie = $.toObj($.isNode() ? process.env[ckName] : $.getdata(ckName)) || {};
//notify
const notify = $.isNode() ? require('./sendNotify') : '';
$.notifyMsg = []
//debug
$.is_debug = ($.isNode() ? process.env.IS_DEDUG : $.getdata('is_debug')) || 'false';
//�Զ������Ч����
$.is_remove = ($.isNode() ? process.env["teaMilk_remove"] : $.getdata("teaMilk_remove")) || 'false';
$.is_water = ($.isNode() ? process.env["yht_water"] : $.getdata("yht_water")) || 'false';
$.doFlag = { "true": "?", "false": "??" };
//�ɹ�����
$.succCount = 0;
//��̬����
$.storeAccount = {
    "49006": {
        id: "49006",
        name: "�����輧",
        appId: "wxafec6f8422cb357b",
        oldActivityId: "100820000000000686",
        newActivityId: "947079313798000641",
        userList: userCookie?.["49006"]?.userList || []
    },
    "201424": {
        id: "201424",
        name: "���ϰ���",
        appId: "wxd92a2d29f8022f40",
        oldActivityId: "702822503017398273",
        newActivityId: "1004435002421583872",
        userList: userCookie?.["201424"]?.userList || []
    },
    "203009": {
        "id": "203009",
        "name": "�����",
        "appId": "wx4080846d0cec2fd5",
        "oldActivityId": "",
        "newActivityId": "992065397145317377",
        userList: userCookie?.["203009"]?.userList || [],
    },
    ...userCookie
}
//------------------------------------------
const baseUrl = "https://webapi2.qmai.cn"
const _headers = {
    'Qm-User-Token': "",
    'Qm-From': 'wechat',
    'Content-Type': 'application/json'
};
const fetch = async (o) => {
    try {
        if (typeof o === 'string') o = { url: o };
        if (o?.url?.startsWith("/") || o?.url?.startsWith(":")) o.url = baseUrl + o.url
        const res = await Request({ ...o, headers: o.headers || _headers, url: o.url })
        debug(res);
        //if (!(res?.code == 0 || res?.code == 400041)) throw new Error(res?.msg || `�û���Ҫȥ��¼`);
        return res;
    } catch (e) {
        $.ckStatus = false;
        $.log(`?? ������ʧ�ܣ�${e}`);
    }
}
//------------------------------------------
async function main() {
    try {
        //����������
        $.removeList = [], $.notifyList = [];
        for (let item in $.storeAccount) {
            let store = $.storeAccount[item];
            store.storeId = item;
            //����Ч����ѹ������������
            if (!store.appId) {
                //�����Զ��Ƴ�����
                $.is_remove != 'false' && $.removeList.push(item);
                $.log(`[ERROR] ��${store.name}�����񲻴��ڻid,��������...\n`);
                continue;
            }
            //������Ч����
            if (!store.userList.length) {
                $.log(`[ERROR] ��${store.name}�����񲻴����˺�,��������...\n`);
                continue;
            }
            //$.log(`\n==============?ִ������?==============\n`)
            //init
            $.notifyMsg = [], $.ckStatus = true, $.succCount = 0
            $.log(`[INFO] ��ʼִ�С�${store.name}������...\n`);
            $.log(`[INFO] ��ǰ����⵽ ${store.userList.length || 0} ���˺�\n`);
            if (item == '203009') {
                await yhtTree(store);
            } else {
                await teaMilkCheckin(store);
            }
        }
        await Promise.allSettled($.notifyList?.map(e => sendMsg(e)));
        //�������������
        $.removeList.map(e => delete $.storeAccount[e]);
        $.setjson($.storeAccount, ckName);
    } catch (e) {
        throw e
    }
}

//�������ֲ����
async function yhtTree(store) {
    for (let user of store.userList) {
        $.log(`[INFO] ��ǰ�û�: ${user.userName}\n`);
        _headers['Qm-User-Token'] = user.token;
        await activityInfo();
        //��ȡ�����ؽ�������
        let inviteUser = await getInviteUser();
        let helpRes = await userHelp(inviteUser?.inviteUserId);
        //��¼��������
        if (!helpRes.match(/ʧ��|������/)) await uploadInviteUser(inviteUser);
        if ($.ckStatus) {
            if ($.is_water == "false") {
                for (let i = 1; i <= 400; i++) {
                    let res = await nutrient();
                    if (res) break;
                }
            }
            await sendReward();
            await takePartInNurture();
            //ÿ�ܶ���ȡ�Ż�ȯ
            //  await takePartInReceive("995087480964071424");
            let result = await stageInfo();
            $.notifyMsg.push(`[${user.userName}] ${result}`);
            $.succCount++;
        } else {
            $.notifyMsg.push(`[${user.userName}] ����ʧ��, �û���Ҫȥ��¼`);
        }
    }
    $.notifyList.push({
        name: `${store.name}����`,
        title: `��${store.userList.length}���˺�,�ɹ�${$.succCount}��,ʧ��${store.userList.length - 0 - $.succCount}��`,
        message: $.notifyMsg.join('\n')
    })
    //ÿ�ܶ����Ż�ȯ
    async function takePartInReceive(activityId) {
        try {
            const opts = {
                url: "/web/cmk-center/receive/takePartInReceive",
                type: "post",
                dataType: "json",
                body: { "activityId": activityId, "timestamp": "", "signature": "", "data": "", "version": 4, "appid": "" }
            }
            let res = await fetch(opts);
            $.info(`ÿ�ܶ���ȡ�Ż�ȯ: ${res?.message}`);
            return res?.message;
        } catch (e) {
            $.ckStatus = false;
            $.error(`${e}`)
        }
    }
    //��ȡ����
    async function activityInfo() {
        try {
            const opts = {
                url: "/web/cmk-center/nurture/activityInfo",
                type: "post",
                dataType: "json",
                body: {
                    "appid": "wx4080846d0cec2fd5",
                    "activityId": "1025694534292430849"
                }
            }
            let res = await fetch(opts);
            if (res?.message.match(/δ��¼/)) throw new Error(res?.message);
            $.info(`������ֲҳ��: ${res?.message}`);
        } catch (e) {
            $.ckStatus = false;
            $.error(`${e}`)
        }
    }
    //ʩ��
    async function nutrient() {
        try {
            const opts = {
                url: "/web/cmk-center/nurture/add/nutrient",
                type: "post",
                dataType: "json",
                body: {
                    "appid": "wx4080846d0cec2fd5",
                    "activityId": "1025694534292430849"
                }
            }
            let res = await fetch(opts);
            $.info(`ʩ��: ${res?.message}`);
            return res?.message.match(/��ǰ�������ϲ���|������/)
        } catch (e) {
            $.ckStatus = false;
            $.error(`${e}`)
        }
    }

    //��������
    async function userHelp(inviteUserId) {
        try {
            const opts = {
                url: "/web/cmk-center/task/userHelp",
                type: "post",
                dataType: "json",
                body: {
                    "appid": "wx4080846d0cec2fd5",
                    "activityId": "1025694534292430849",
                    "inviteUserId": inviteUserId
                }
            }
            let res = await fetch(opts);
            return res?.message;
        } catch (e) {
            $.ckStatus = false;
            $.error(`${e}`)
        }
    }
    //��ѯ��������
    async function stageInfo() {
        try {
            const opts = {
                url: "/web/cmk-center/nurture/stageInfo",
                type: "post",
                dataType: "json",
                body: {
                    "appid": "wx4080846d0cec2fd5",
                    "activityId": "1025694534292430849"
                }
            }
            let res = await fetch(opts);
            let msg = `${res?.data?.name}(${res?.data?.nutrientUsed}/${res?.data?.upgradeThreshold})`
            $.info(`��ֲ����: ${msg}`);
            return msg;
        } catch (e) {
            this.ckStatus = false;
            $.error(`${e}`)
        }
    }
    //��ȡ��Ʒ
    async function sendReward() {
        try {
            const opts = {
                url: "/web/cmk-center/nurture/sendReward",
                type: "post",
                dataType: "json",
                body: {
                    "appid": "wx4080846d0cec2fd5",
                    "activityId": "1025694534292430849"
                }
            }
            let res = await fetch(opts);
            $.info(`��ȡ��Ʒ: ${res?.data?.[0]?.rewardName || res?.message}`);
        } catch (e) {
            this.ckStatus = false;
            $.error(`${e}`)
        }
    }
    //��ֲ����
    async function takePartInNurture() {
        try {
            const opts = {
                url: "/web/cmk-center/nurture/takePartInNurture",
                type: "post",
                dataType: "json",
                body: {
                    "appid": "wx4080846d0cec2fd5",
                    "activityId": "1025694534292430849"
                }
            }
            let res = await fetch(opts);
            $.info(`��ֲ����: ${res?.message}`);
        } catch (e) {
            this.ckStatus = false;
            $.error(`${e}`)
        }
    }
}

//�̲��ճ�ǩ��
async function teaMilkCheckin(store) {
    for (let user of store.userList) {
        $.log(`[INFO] ��ǰ�û�: ${user.userName}\n`);
        _headers['Qm-User-Token'] = user.token;
        let o = { appid: store.appId, oldActivityId: store.oldActivityId, newActivityId: store.newActivityId, storeId: store.storeId }
        if (store?.appId) {
            let pointF = await getPoint(o);
            store?.oldActivityId && await oldSignin(o);
            let userId = await getUserId(o);
            store?.newActivityId && await newSignin(o, userId);
            let pointE = await getPoint(o);
            let signDays = await userSignStatistics(o);
            //�ж�ck״̬
            !$.ckStatus
                ? $.notifyMsg.push(`[${user.userName}] ǩ��ʧ��,��¼�ѹ���`)
                : ($.notifyMsg.push(`[${user.userName}] ����:${pointF}+${pointE - 0 - pointF} ǩ������:${signDays}`), $.succCount++);
        } else {
            $.log(`[INFO] �id������,ִֹͣ�С�${store.name}��ǩ������\n`);
            break;
        }
        //����5��
        await $.wait(5e3);
    }
    $.notifyList.push({
        name: `${store.name}ǩ��`,
        title: `��${store.userList.length}���˺�,�ɹ�${$.succCount}��,ʧ��${store.userList.length - 0 - $.succCount}��`,
        message: $.notifyMsg.join('\n')
    })

    //��ǩ��
    async function oldSignin(o) {
        try {
            const opts = {
                url: "/web/catering/integral/sign/signIn",
                type: "post",
                dataType: "json",
                body: { "activityId": o.oldActivityId, "mobilePhone": "1111", "userName": "΢���û�", "appid": o.appid }
            }
            //post����
            let { code, message, data, status } = await fetch(opts) ?? {};
            if (code == 0 || code == 400041) {
                console.log("[INFO] ��ǩ���ӿ�:" + message + "\n");
            } else {
                $.log(`[ERROR] signInǩ������${message} `);
            }
        } catch (e) {
            $.log(e);
        }
    }
    async function newSignin(o, userId) {
        try {
            const timestamp = ts13();
            const opts = {
                url: "/web/cmk-center/sign/takePartInSign",
                type: "post",
                dataType: "json",
                body: { "appid": o?.appid, "activityId": o?.newActivityId, "storeId": o?.storeId, timestamp: timestamp, "store_id": o?.storeId, "signature": getSign(o?.newActivityId, o?.storeId, userId, timestamp) }
            }
            //post����
            let { code, message, data, status } = await fetch(opts) ?? {};
            if (code == 0 || code == 400041) {
                console.log("[INFO] ��ǩ���ӿ�:" + message + "\n");
            } else {
                $.log(`[ERROR] takePartInSignǩ������${message}`);
            }
        } catch (e) {
            $.log(e);
        }
    }

    //��ѯǩ������
    async function userSignStatistics(o) {
        try {
            const opts = {
                url: "/web/cmk-center/sign/userSignStatistics",
                type: "post",
                dataType: "json",
                body: { "appid": o.appid, "activityId": o.newActivityId }
            }
            //post����
            let { code, message, data, status } = await fetch(opts) ?? {};
            if (code == 0 || code == 400041) {
                console.log("[INFO] ����ǩ������:" + data?.signDays + "\n");
            } else {
                $.log(`[ERROR] ǩ��������ѯ����${message}`);
            }
            return data?.signDays;
        } catch (e) {
            $.log(e);
        }
    }
    //��ȡuserId
    async function getUserId(o) {
        try {
            const opts = {
                url: "/web/mall-apiserver/integral/user/page/customer-points-flow",
                type: "post", dataType: "json",
                body: { appid: o.appid, pageNo: 1, pageSize: 15 }
            }
            let res = await fetch(opts);
            if (!(res?.code == 0 || res?.code == 400041)) throw new Error(res?.msg || `�û���Ҫȥ��¼`);
            return res?.data?.data?.[0]?.customerId;
        } catch (e) {
            $.ckStatus = false;
            $.log(e);
        }
    }

    //��ѯ�û�������Ϣ
    async function getPoint(o) {
        try {
            const opts = {
                url: "/web/catering2-apiserver/crm/points-info",
                type: "post", dataType: "json",
                body: { appid: o.appid }
            }
            let res = await fetch(opts);
            if (!(res?.code == 0 || res?.code == 400041)) throw new Error(res?.msg || `�û���Ҫȥ��¼`);
            return res?.data?.totalPoints;
        } catch (e) {
            $.ckStatus = false;
            $.log(e);
        }
    }
}

//��ѯ������Ϣ
async function getTitle(o) {
    try {
        const opts = {
            url: "/web/catering/design/homePage-Config",
            params: { type: 2, appid: o.appid },
            headers: {
                'Qm-User-Token': o.token,
                'Qm-From': 'wechat',
                'Content-Type': 'application/json'
            }
        }
        let res = await fetch(opts);
        debug(res?.data?.storeId);
        return res?.data?.storeId;
    } catch (e) {
        $.ckStatus = false;
        $.log(e);
    }
}

//��ȡCookie
async function getCookie() {
    try {
        if ($request && $request.method === 'OPTIONS') return;
        //����id
        if ($request.url.match(/sign/)) {
            const { appid, activityId } = $.toObj($request.body);
            const { "qm-user-token": token } = ObjectKeys2LowerCase($request.headers);
            let storeId = await getTitle({ token, appid });
            for (let store in $.storeAccount) {
                if (store == storeId) {
                    $.storeAccount[store] = {
                        ...$.storeAccount[store],
                        appId: appid,
                        oldActivityId: activityId,
                        newActivityId: activityId
                    }
                    $.store = $.storeAccount[store];
                    // �������
                    $.setjson($.storeAccount, ckName);
                    break;
                }
            }
            // ������Ϣ
            const message = $.store?.appId ? `? ��ȡ${$.store.name}�id�ɹ�!` : `? ��ȡ${$.store.name}�idʧ��!`;
            $.msg($.name, message, "");
        } else {
            const body = $.toObj($response?.body) ?? "";
            if (!body) throw new Error("Surge�û�: �ֶ��������л���Cron����");
            const { store: { id: storeId, name }, user: { mobile }, token } = body?.data

            if (!mobile) throw new Error(`��ȡckʧ�ܣ����ȵ�¼�����ֻ���`);

            const newData = {
                "userId": mobile,
                "token": token,
                "userName": phone_num(mobile),
            }
            //����δ֪С����
            if (!$.storeAccount[storeId]) {
                $.storeAccount[storeId] = {
                    "id": storeId,
                    "name": name,
                    userList: [newData]
                }
                $.setjson($.storeAccount, ckName);
                return $.msg($.name, `?��¼${name}С����ɹ�!`, "���ֶ����һ��ǩ������ȡ�id");
            }
            let account = $.storeAccount[storeId];
            let userList = account.userList || [];
            const index = userList.findIndex(e => e.userId == newData.userId);
            index != -1 ? $.storeAccount[storeId].userList[index] = newData : $.storeAccount[storeId].userList.push(newData);

            $.setjson($.storeAccount, ckName);
            $.msg(name, `?${newData.userName}����token�ɹ�!`, ``);
        }
    } catch (e) {
        throw e;
    }
}

//13λʱ���
function ts13() { return Math.round(new Date().getTime()).toString(); }

//��ȡsign
function getSign(activityId, storeId, userId, timestamp) {
    const key = activityId.split('').reverse().join('');
    const stringToEncrypt = `activityId=${activityId}&sellerId=${storeId}&timestamp=${timestamp}&userId=${userId}&key=${key}`;
    // ���� MD5 ����
    const hash = $.CryptoJS.MD5(stringToEncrypt).toString($.CryptoJS.enc.Hex);

    return hash.toUpperCase();
}

//����CryptoJSģ��
async function loadCryptoJS() {
    let code = ($.isNode() ? require('crypto-js') : $.getdata('CryptoJS_code')) || '';
    //node����
    if ($.isNode()) return code;
    //ios����
    if (code && Object.keys(code).length) {
        console.log(`[INFO] �����д���CryptoJS����, ��������`)
        eval(code)
        return createCryptoJS();
    }
    console.log(`[INFO] ��ʼ����CryptoJS����`)
    return new Promise(async (resolve) => {
        $.getScript(
            'https://fastly.jsdelivr.net/gh/Sliverkiss/QuantumultX@main/Utils/CryptoJS.min.js'
        ).then((fn) => {
            $.setdata(fn, 'CryptoJS_code')
            eval(fn)
            const CryptoJS = createCryptoJS();
            console.log(`[INFO] CryptoJS���سɹ�, �����`)
            resolve(CryptoJS)
        })
    })
}

//��ȡ�����û�id
async function getInviteUser() {
    try {
        const BASE_URL = `https://ap-south-1.aws.data.mongodb-api.com/app/data-gkrxjno/endpoint/data/v1/action`;
        const DATA_SOURCE = "Sliverkiss";
        const DATABASE = "yht";
        const COLLECTION = "yht_db"
        const API_KEY = "B0nLTBloCy06IXZ1uTPoBQRNuzGzzVJ0qBWE7gGX1mYNCdRBiKxIK4j8V3RDbkaM"
        const Mong = MongoDB(BASE_URL, DATA_SOURCE, DATABASE, COLLECTION, API_KEY)
        let res = await Mong.find({ type: "yht" });
        let userList = res?.documents || [];
        let user = userList?.find(e => e.count < 3) ?? { "inviteUserId": "904328271441838081" };
        return user;
    } catch (e) {
        $.error(e);
        return { "inviteUserId": "904328271441838081" }
    }
}

//�ϴ�����¼��������
async function uploadInviteUser(inviteUser) {
    if (!inviteUser?.userName) return;
    const BASE_URL = `https://ap-south-1.aws.data.mongodb-api.com/app/data-gkrxjno/endpoint/data/v1/action`;
    const DATA_SOURCE = "Sliverkiss";
    const DATABASE = "yht";
    const COLLECTION = "yht_db"
    const API_KEY = "B0nLTBloCy06IXZ1uTPoBQRNuzGzzVJ0qBWE7gGX1mYNCdRBiKxIK4j8V3RDbkaM"
    const Mong = MongoDB(BASE_URL, DATA_SOURCE, DATABASE, COLLECTION, API_KEY)
    let count = inviteUser?.count + 1;
    delete inviteUser?._id;
    let res = await Mong.updateMany({ type: "yht", userName: inviteUser?.userName, userId: inviteUser?.userId, inviteUserId: inviteUser?.inviteUserId }, { ...inviteUser, count })
    $.info($.toStr(res));
}

function phone_num(phone_num) { if (phone_num.length == 11) { let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"); return data; } else { return phone_num; } }

//������ִ�����
!(async () => {
    try {
        if (typeof $request != "undefined") {
            await getCookie();
        } else {
            $.CryptoJS = await loadCryptoJS();
            await main();
        }
    } catch (e) {
        throw e;
    }
})()
    .catch((e) => { $.logErr(e), $.msg($.name, `?? script run error!`, e.message || e) })
    .finally(async () => {
        $.done({});
    });
/** ---------------------------------�̶���������----------------------------------------- */
//prettier-ignore
async function sendMsg(o) { o && ($.isNode() ? await notify.sendNotify(o.name, o.message) : $.msg(o.name, o.title || "", o.message, { "media-url": $.avatar })) }
function DoubleLog(o) { o && ($.log(`${o}`), $.notifyMsg.push(`${o}`)) };
function debug(o, r) {
    if ("true" === $.is_debug) {
        $.log("")
        $.log($.toStr(o));
        $.log("")
    }
}

//From sliverkiss's MongoDB.js
function MongoDB(t, n, o, e, a) { return new class { constructor(t, n, o, e, a) { this.BASE_URL = t, this.dataSource = n, this.database = o, this.collection = e, this.apiKey = a } async commonPost(t) { const { url: n, headers: o, body: e, method: a = "post" } = t, s = { url: `${this.BASE_URL}${n}`, headers: { "api-key": this.apiKey, "Content-Type": "application/json", Accept: "application/json", ...o }, body: $.toStr({ dataSource: this.dataSource, database: this.database, collection: this.collection, ...e }) }; return new Promise((t => { $[a](s, ((n, o, e) => { let a = $.toObj(e) || e; t(a) })) })) } async findOne(t) { const n = { url: "/findOne", body: { filter: t } }; return await this.commonPost(n) } async find(t) { const n = { url: "/find", body: { filter: t } }; return await this.commonPost(n) } async insertOne(t) { const n = { url: "/insertOne", body: { document: t } }; return await this.commonPost(n) } async insertMany(t) { const n = { url: "/insertMany", body: { documents: t } }; return await this.commonPost(n) } async updateOne(t, n) { const o = { url: "/updateOne", body: { filter: t, update: n } }; return await this.commonPost(o) } async updateMany(t, n) { const o = { url: "/updateMany", body: { filter: t, update: n } }; return await this.commonPost(o) } async deleteOne(t) { const n = { url: "/deleteOne", body: { filter: t } }; return await this.commonPost(n) } async deleteMany(t) { const n = { url: "/deleteMany", body: { filter: t } }; return await this.commonPost(n) } }(t, n, o, e, a) }
//From xream's ObjectKeys2LowerCase
function ObjectKeys2LowerCase(obj) { return !obj ? {} : Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v])) };
//From sliverkiss's Request
async function Request(t) { "string" == typeof t && (t = { url: t }); try { if (!t?.url) throw new Error("[��������] ȱ�� url ����"); let { url: o, type: e, headers: r = {}, body: s, params: a, dataType: n = "form", resultType: u = "data" } = t; const p = e ? e?.toLowerCase() : "body" in t ? "post" : "get", c = o.concat("post" === p ? "?" + $.queryStr(a) : ""), i = t.timeout ? $.isSurge() ? t.timeout / 1e3 : t.timeout : 1e4; "json" === n && (r["Content-Type"] = "application/json;charset=UTF-8"); const y = s && "form" == n ? $.queryStr(s) : $.toStr(s), l = { ...t, ...t?.opts ? t.opts : {}, url: c, headers: r, ..."post" === p && { body: y }, ..."get" === p && a && { params: a }, timeout: i }, m = $.http[p.toLowerCase()](l).then((t => "data" == u ? $.toObj(t.body) || t.body : $.toObj(t) || t)).catch((t => $.log(`?������ʧ�ܣ�ԭ��Ϊ��${t}`))); return Promise.race([new Promise(((t, o) => setTimeout((() => o("��ǰ�����ѳ�ʱ")), i))), m]) } catch (t) { console.log(`?������ʧ�ܣ�ԭ��Ϊ��${t}`) } }
//From chavyleung's Env.js
// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; "POST" === e && (s = this.post); const i = new Promise(((e, i) => { s.call(this, t, ((t, s, o) => { t ? i(t) : e(s) })) })); return t.timeout ? ((t, e = 1e3) => Promise.race([t, new Promise(((t, s) => { setTimeout((() => { s(new Error("����ʱ")) }), e) }))]))(i, t.timeout) : i } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.logLevels = { debug: 0, info: 1, warn: 2, error: 3 }, this.logLevelPrefixs = { debug: "[DEBUG] ", info: "[INFO] ", warn: "[WARN] ", error: "[ERROR] " }, this.logLevel = "info", this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `?${this.name}, ��ʼ!`) } getEnv() { return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge" : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash" : "undefined" != typeof module && module.exports ? "Node.js" : "undefined" != typeof $task ? "Quantumult X" : "undefined" != typeof $loon ? "Loon" : "undefined" != typeof $rocket ? "Shadowrocket" : void 0 } isNode() { return "Node.js" === this.getEnv() } isQuanX() { return "Quantumult X" === this.getEnv() } isSurge() { return "Surge" === this.getEnv() } isLoon() { return "Loon" === this.getEnv() } isShadowrocket() { return "Shadowrocket" === this.getEnv() } isStash() { return "Stash" === this.getEnv() } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null, ...s) { try { return JSON.stringify(t, ...s) } catch { return e } } getjson(t, e) { let s = e; if (this.getdata(t)) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise((e => { this.get({ url: t }, ((t, s, i) => e(i))) })) } runScript(t, e) { return new Promise((s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); o = o ? 1 * o : 20, o = e && e.timeout ? e.timeout : o; const [r, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: o }, headers: { "X-Key": r, Accept: "*/*" }, policy: "DIRECT", timeout: o }; this.post(n, ((t, e, i) => s(i))) })).catch((t => this.logErr(t))) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), o = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let o = t; for (const t of i) if (o = Object(o)[t], void 0 === o) return s; return o } lodash_set(t, e, s) { return Object(t) !== t || (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce(((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}), t)[e[e.length - 1]] = s), t } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), o = s ? this.getval(s) : ""; if (o) try { const t = JSON.parse(o); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e), r = this.getval(i), a = i ? "null" === r ? null : r || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, o, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const r = {}; this.lodash_set(r, o, t), s = this.setval(JSON.stringify(r), i) } } else s = this.setval(t, e); return s } getval(t) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.read(t); case "Quantumult X": return $prefs.valueForKey(t); case "Node.js": return this.data = this.loaddata(), this.data[t]; default: return this.data && this.data[t] || null } } setval(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": return $persistentStore.write(t, e); case "Quantumult X": return $prefs.setValueForKey(t, e); case "Node.js": return this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0; default: return this.data && this.data[e] || null } } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.cookie && void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))) } get(t, e = (() => { })) { switch (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]), t.params && (t.url += "?" + this.queryStr(t.params)), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, ((t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) })); break; case "Quantumult X": this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: i, headers: o, body: r, bodyBytes: a } = t; e(null, { status: s, statusCode: i, headers: o, body: r, bodyBytes: a }, r, a) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", ((t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } })).then((t => { const { statusCode: i, statusCode: o, headers: r, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: o, headers: r, rawBody: a, body: n }, n) }), (t => { const { message: i, response: o } = t; e(i, o, o && s.decode(o.rawBody, this.encoding)) })); break } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; switch (t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded"), t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]), void 0 === t.followRedirect || t.followRedirect || ((this.isSurge() || this.isLoon()) && (t["auto-redirect"] = !1), this.isQuanX() && (t.opts ? t.opts.redirection = !1 : t.opts = { redirection: !1 })), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, ((t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) })); break; case "Quantumult X": t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then((t => { const { statusCode: s, statusCode: i, headers: o, body: r, bodyBytes: a } = t; e(null, { status: s, statusCode: i, headers: o, body: r, bodyBytes: a }, r, a) }), (t => e(t && t.error || "UndefinedError"))); break; case "Node.js": let i = require("iconv-lite"); this.initGotEnv(t); const { url: o, ...r } = t; this.got[s](o, r).then((t => { const { statusCode: s, statusCode: o, headers: r, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: o, headers: r, rawBody: a, body: n }, n) }), (t => { const { message: s, response: o } = t; e(s, o, o && i.decode(o.rawBody, this.encoding)) })); break } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } queryStr(t) { let e = ""; for (const s in t) { let i = t[s]; null != i && "" !== i && ("object" == typeof i && (i = JSON.stringify(i)), e += `${s}=${i}&`) } return e = e.substring(0, e.length - 1), e } msg(e = t, s = "", i = "", o = {}) { const r = t => { const { $open: e, $copy: s, $media: i, $mediaMime: o } = t; switch (typeof t) { case void 0: return t; case "string": switch (this.getEnv()) { case "Surge": case "Stash": default: return { url: t }; case "Loon": case "Shadowrocket": return t; case "Quantumult X": return { "open-url": t }; case "Node.js": return }case "object": switch (this.getEnv()) { case "Surge": case "Stash": case "Shadowrocket": default: { const r = {}; let a = t.openUrl || t.url || t["open-url"] || e; a && Object.assign(r, { action: "open-url", url: a }); let n = t["update-pasteboard"] || t.updatePasteboard || s; if (n && Object.assign(r, { action: "clipboard", text: n }), i) { let t, e, s; if (i.startsWith("http")) t = i; else if (i.startsWith("data:")) { const [t] = i.split(";"), [, o] = i.split(","); e = o, s = t.replace("data:", "") } else { e = i, s = (t => { const e = { JVBERi0: "application/pdf", R0lGODdh: "image/gif", R0lGODlh: "image/gif", iVBORw0KGgo: "image/png", "/9j/": "image/jpg" }; for (var s in e) if (0 === t.indexOf(s)) return e[s]; return null })(i) } Object.assign(r, { "media-url": t, "media-base64": e, "media-base64-mime": o ?? s }) } return Object.assign(r, { "auto-dismiss": t["auto-dismiss"], sound: t.sound }), r } case "Loon": { const s = {}; let o = t.openUrl || t.url || t["open-url"] || e; o && Object.assign(s, { openUrl: o }); let r = t.mediaUrl || t["media-url"]; return i?.startsWith("http") && (r = i), r && Object.assign(s, { mediaUrl: r }), console.log(JSON.stringify(s)), s } case "Quantumult X": { const o = {}; let r = t["open-url"] || t.url || t.openUrl || e; r && Object.assign(o, { "open-url": r }); let a = t["media-url"] || t.mediaUrl; i?.startsWith("http") && (a = i), a && Object.assign(o, { "media-url": a }); let n = t["update-pasteboard"] || t.updatePasteboard || s; return n && Object.assign(o, { "update-pasteboard": n }), console.log(JSON.stringify(o)), o } case "Node.js": return }default: return } }; if (!this.isMute) switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": default: $notification.post(e, s, i, r(o)); break; case "Quantumult X": $notify(e, s, i, r(o)); break; case "Node.js": break }if (!this.isMuteLog) { let t = ["", "==============?ϵͳ֪ͨ?=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } debug(...t) { this.logLevels[this.logLevel] <= this.logLevels.debug && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.debug}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } info(...t) { this.logLevels[this.logLevel] <= this.logLevels.info && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.info}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } warn(...t) { this.logLevels[this.logLevel] <= this.logLevels.warn && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.warn}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } error(...t) { this.logLevels[this.logLevel] <= this.logLevels.error && (t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(`${this.logLevelPrefixs.error}${t.map((t => t ?? String(t))).join(this.logSeparator)}`)) } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.map((t => t ?? String(t))).join(this.logSeparator)) } logErr(t, e) { switch (this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: this.log("", `??${this.name}, ����!`, e, t); break; case "Node.js": this.log("", `??${this.name}, ����!`, e, void 0 !== t.message ? t.message : t, t.stack); break } } wait(t) { return new Promise((e => setTimeout(e, t))) } done(t = {}) { const e = ((new Date).getTime() - this.startTime) / 1e3; switch (this.log("", `?${this.name}, ����! ? ${e} ��`), this.log(), this.getEnv()) { case "Surge": case "Loon": case "Stash": case "Shadowrocket": case "Quantumult X": default: $done(t); break; case "Node.js": process.exit(1) } } }(t, e) }