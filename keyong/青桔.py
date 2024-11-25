
# 功能：青橘
# -------------------------------
"""
new Env("青橘")
cron: 30 8 * * *
"""
import json
from time import sleep, time
from os import environ, system, path
from sys import exit, stdout
import requests
import base64
import hashlib
from collections import OrderedDict
import requests
from urllib.parse import quote
def get_sign(app_sec, params, extra_params):
    combined_params = {**params, **extra_params}
    return B(combined_params,app_sec)
def B(t, e):
    # Step 1: Process the input object
    r = OrderedDict(sorted(t.items(), key=lambda item: item[0], reverse=True))
    
    # Step 2: Build the string
    n = []
    for key, value in r.items():
        n.append(key + str(value))
    o = e + ''.join(n) + e
    
    # Step 3: Encode
    # UTF-8 encoding
    utf8_encoded = o.encode('utf-8')
    
    # Base64 encoding
    base64_encoded = base64.b64encode(utf8_encoded).decode('utf-8')
    
    # SHA1 hash
    sha1_hash = hashlib.sha1(base64_encoded.encode('utf-8')).hexdigest()
    
    return sha1_hash
def load_send():
    cur_path = path.abspath(path.dirname(__file__))
    if path.exists(cur_path + "/notify.py"):
        try:
            from notify import send
            return send
        except ImportError:
            return False
    else:
        return False
qjck = json.loads(environ.get("qjck")) if environ.get("qjck") else []

class Qingju:
    name = "青桔"
    def __init__(self,user):
        self.xpsid = user['xpsid']
        self.cityId =user['cityId']
        self.token = user['token']
        self.klat = user['klat']
        self.klnt = user['klnt']
        self.userId = user['userId']
        self.headers  = {
  'User-Agent': "Mozilla/5.0 (Linux; Android 14; M2102J2SC Build/UKQ1.231003.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.102 Mobile Safari/537.36 XWEB/1300073 MMWEBSDK/20241101 MMWEBID/3827 MicroMessenger/8.0.54.2760(0x28003636) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
  'Content-Type': "application/json",
  'Cityid': self.cityId,
  'xpsid': self.xpsid,
  'xpsid-root': self.xpsid,
  'charset': "utf-8",
  'Referer': "https://servicewechat.com/wx9e9b87595c41dbb7/485/page-frame.html"
}
        self.user_info = ""
        self.task_info = ""
    def sign(self):
        url = f'https://htwkop.xiaojukeji.com/gateway'
        params= {
            'api': "prado.play.common.facade.component",
            'apiVersion': "1.0.0",
            'appKey': "h5appbcd0af7461691c1e30bcd61098f",
            'appVersion': "17.2.0",
            'mobileType': "Xiaomi",
            'osType': "2",
            'osVersion': "Android 14",
            'timestamp': str(int(time.time()*1000)),
            'ttid': "h5",
            'userRole': "1",
            'token': self.token,
            'userId': self.userId
            }
        payload = {"cityId":self.cityId,
                   "methodName":"signIn",
                   "serviceCode":"signInComponentService",
                   "serviceType":"SIMPLE",
                   "entryFlag":"APP_LETS",
                   "classifyCode":"SIGN",
                   "scene":"LLC_WELFARE_CENTER",
                   "bizId":363,
                   "channelId":3,
                   "miniappversion":"17.2.0",
                   "klat":self.klat,
                   "klnt":self.klnt,
                   "accuracy":15,
                   "hwId":"10000"}
        sign=get_sign(app_sec="h5app07a02944776b7638e9b90793363", params=params, extra_params=payload)
        params['sign']=sign
        quote_payload = quote(json.dumps(payload))
        data = requests.post(url, params=params, data=quote_payload, headers=self.headers).json()
        if 'code' in data and data['code'] == 'A0003':
            self.print_now("CK已失效，请重新获取")
            return False
        elif 'code' in data and data['code'] == 200:
            data_data = data['data']['data']['dailySignReward']
            rightCount=data_data.get('rightCount')
            rewardName=data_data.get('rewardName')
            self.task_info += f"签到成功，今日获取{rightCount}{rewardName}\n"
        elif 'code' in data and data['code'] == 'A00001':
            self.task_info += f"签到失败，今天已签到\n"
        else:
            self.print_now(f"签到失败：{data}")
            self.task_info += f"签到失败：{data}\n"
        return True        
    def main(self):
        self.sign()
        self.msg = self.user_info + self.task_info
        send = load_send()
        if callable(send):
            send("青桔單車", self.msg)
        else:
            print('\n加载通知服务失败')

if __name__ == '__main__':
    for user in qjck:
        qj = Qingju(user)
        qj.main()
