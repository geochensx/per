# ===========华润通==========
# H5登录抓包 ：https://cloud.huaruntong.cn/web/online/?mFrom=fastLogin&mFrom=quickRegister#/signIn?utm_source=hrt&utm_medium=flzx&utm_content=qd0228&utm_campaign=qd0228&inviteCode=2e7cbec65eb14497bae6d29103c000f6
# 或者华润通APP 域名https://mid.huaruntong.cn/api/user/memberinfo/appBootstarp 返回文本里的token
# 以上都是抓token
# 变量
# export hrthd='token'
# 多号@或换行隔开
# ===========一点万象=======
# APP:https://app.mixcapp.com/h5/invitation/templets/invitation.html?inviteCode=WX0sbvGkqX&mallNo=20014&userName=%E4%B8%87%E8%B1%A1%E4%BC%9A%E5%91%98
# 首页：签到集星
# 域名：https://app.mixcapp.com/mixc/gateway
# 请求文本：token
# 变量
# export ydwxhd='token'
# 多号@隔开
# ===========Ole=======
# APP:Ole lifestyle
# 变量
# export olehd='账号&密码'
# 多号@隔开
# ===========华润深圳湾体育中心春茧未来荟=======
# #小程序://春茧未来荟/Lw1ze94RnN8a6Rz
# 变量
# export szwhd='Cookie'
# 多号@隔开

# 需要先加入会员 去签到页面随便输入名字直接点加入会员
# 功能：华润通
# -------------------------------
"""
new Env("一点万象")
cron: 25 10 * * *
"""
from datetime import datetime
import time
import json
from os import environ, system, path
from re import findall
from sys import exit, stdout
import requests
import hashlib
import urllib
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
ydwxhd = json.loads(environ.get("ydwxhd")) if environ.get("ydwxhd") else []
hrthd = environ.get("hrthd") if environ.get("hrthd") else ""
olehd = environ.get("olehd") if environ.get("olehd") else ""
szwhd = environ.get("szwhd") if environ.get("szwhd") else ""
class YDWX:
    name = "一点万象"
    def __init__(self,user):
        self.user_info = ""
        self.task_info = ""
        self.headers = {
            "Host": "app.mixcapp.com",
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Linux; Android 14; M2102J2SC Build/UKQ1.231003.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/118.0.0.0 Mobile Safari/537.36/MIXCAPP/3.62.2/AnalysysAgent/Hybrid",
            "sec-ch-ua-platform": "Android",
            "Origin": "https://app.mixcapp.com",
            "X-Requested-With": "com.crland.mixc",
            "Referer": "https://app.mixcapp.com/m/m-20066/signIn?appVersion=3.62.2&mallNo=20066&timestamp=1731747051237&showWebNavigation=true",
            "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cookie": user['Cookie']
            } 
        self.data={
            "mallNo": "20066",
            "appId": "68a91a5bac6a4f3e91bf4b42856785c6",
            "platform": "h5",
            "imei": "728496158455898",
            "appVersion": "3.62.2",
            "osVersion": "14",
            "action": "mixc.app.memberSign.sign",
            "apiVersion": "1.0",
            "timestamp": "1731747053081",
            "deviceParams": user['deviceParams'],
            "date": "2024-11-16 04:50:53",
            "channel": "C001",
            "mac": "",
            "t": "1731747053412",
            "token": user['token'],
            "params": "eyJtYWxsTm8iOiIyMDA2NiJ9",
            }
    def sign(self):
        url = f'https://app.mixcapp.com/mixc/gateway'
        headers=self.headers
        params =self.data
        headers['Referer']="https://app.mixcapp.com/m/m-20066/signIn?appVersion=3.62.2&mallNo=20066&timestamp="+ str(int(time.time() * 1000))+"&showWebNavigation=true"
        params['timestamp']=str(int(time.time() * 1000))
        params['date'] = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        params['t']=str(int(time.time() * 1000))
        sorted_params = sorted(params.items())
        params_str=''
        print(params)
        for i,j in sorted_params:
            params_str+=i+"="+j+"&"
        params_str=params_str+"P@Gkbu0shTNHjhM!7F"
        # params_str=urllib.parse.urlencode(params)+"&P@Gkbu0shTNHjhM!7F"
        signs = hashlib.md5(params_str.encode('utf-8')).hexdigest()
        data = urllib.parse.urlencode(params) +"&sign="+ signs
        # print(params_str)
        # print(signs)
        req = requests.post(url, headers=headers, data=data).json()
        if 'code' in req and req['code'] == 0:
            point = req['data']['point']
            userPoints=req['data']['userPoints']
            self.task_info += f"签到成功，今日获取{point}积分,总共{userPoints}积分\n"
        else:
            print(f"签到失败：{req}")
            self.task_info += f"签到失败：{req}\n"
        return True        
    def main(self):
        self.sign()
        self.msg = self.user_info + self.task_info
        send = load_send()
        if callable(send):
            send("一点万象", self.msg)
        else:
            print('\n加载通知服务失败')
# class HRTHD:
#     name = "华润通"
#     def __init__(self,user):
#         self.debug = True
#         self.user_info = ""
#         self.task_info = ""
#         self.headers = {
#         "Content-Type": "application/json;charset=UTF-8",
#         "Host": "mid.huaruntong.cn",
#         "Origin": "https://cloud.huaruntong.cn",
#         "Referer": "https://cloud.huaruntong.cn/",
#         "User-Agent": "Mozilla/5.0 (Linux; Android 10; Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.92 Mobile Safari/537.36",
#         "x-Hrt-Mid-Appid": "API_AUTH_WEB"
#     }
#     def log(self, message):
#         if self.debug:
#             print(message)

#     def create_guid(self):
#         return str(uuid.uuid4())

#     def md5(self,string):
#         return hashlib.md5(string.encode()).hexdigest()

#     def questionget(self):
#         uudi = self.create_guid()
#         timestamp = int(time.time() * 1000)
#         sorted_str = sorted(["API_AUTH_H5", "1c6120fd-5ad3-4c2d-8cb7-b87a707f416d", str(timestamp), uudi])
#         c = ''.join(sorted_str)
#         signature = self.md5(c)
#         auth = {
#             "appid": "API_AUTH_H5",
#             "nonce": uudi,
#             "timestamp": timestamp,
#             "signature": signature
#         }
#         data = {
#             "auth": auth,
#             "num": 1
#         }
#         url = "https://mid.huaruntong.cn/api/question/get"
#         response = requests.post(url, headers=self.headers, json=data)
#         result = response.json()
#         if result.get("code") == "S0A00000":
#             self.log(result.get("msg"))
#             ansid = result.get("data")[0].get("id")
#             nos = result.get("data")[0].get("no")
#             answers = result.get("data")[0].get("keywords")
#             print(ansid, nos, answers)
#             self.questioncount(ansid)
#         else:
#             self.log(result.get("msg"))

#     def questioncount(self,ansid):
#         uudi = self.create_guid()
#         timestamp = int(time.time() * 1000)
#         sorted_str = sorted(["API_AUTH_H5", "1c6120fd-5ad3-4c2d-8cb7-b87a707f416d", str(timestamp), uudi])
#         c = ''.join(sorted_str)
#         signature = md5(c)
        
#         auth = {
#             "appid": "API_AUTH_H5",
#             "nonce": uudi,
#             "timestamp": timestamp,
#             "signature": signature
#         }
        
#         data = {
#             "auth": auth,
#             "id": ansid,
#             "status": 1
#         }
        
#         url = "https://mid.huaruntong.cn/api/question/count"
#         response = requests.post(url, headers=self.headers, json=data)
#         result = response.json()
#         if result.get("code") == "S0A00000":
#             log(result.get("msg"))
#         else:
#             log(result.get("msg"))
#         def get_invitation_code(self):
#             body = {
#                 "apiPath": "%2Fapi%2Fpoints%2FgetInvitationCode",
#                 "timestamp": int(time.time() * 1000),
#                 "appId": "API_AUTH_WEB",
#                 "token": "2b1bc009f7c1ee1288cf3ba819c907883"
#             }

#             headers = {
#                 "Content-Type": "application/json;charset=UTF-8",
#                 "Host": "mid.huaruntong.cn",
#                 "Origin": "https://cloud.huaruntong.cn",
#                 "Referer": "https://cloud.huaruntong.cn/",
#                 "sec-ch-ua": "\"\"",
#                 "sec-ch-ua-mobile": "?1",
#                 "sec-ch-ua-platform": "\"\"",
#                 "Sec-Fetch-Dest": "empty",
#                 "Sec-Fetch-Mode": "cors",
#                 "Sec-Fetch-Site": "same-site",
#                 "User-Agent": "Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.92 Mobile Safari/537.36/ hrtbrowser/5.3.5 grayscale/0",
#                 "x-Hrt-Mid-Appid": "API_AUTH_WEB"
#             }

#             signed_data = self.signer.signs(body)
#             payload = {
#                 "key": signed_data["key"],
#                 "data": signed_data["data"]
#             }

#             request_data = {
#                 "method": "POST",
#                 "url": "https://mid.huaruntong.cn/api/points/getInvitationCode",
#                 "headers": headers,
#                 "data": json.dumps(payload)
#             }
#             response = requests.post(request_data["url"], headers=request_data["headers"], data=request_data["data"])
#             response_data = response.json()
#             if self.debug:
#                 logging.info("\n\n【debug】===============这是 返回data==============")
#                 logging.info(json.dumps(response_data))

#             if response_data.get("code") == "S0A00000":
#                 invitation_code = response_data["data"]["data"]["invitationCode"]
#                 return invitation_code
#             else:
#                 logging.error(response_data.get("msg"))
#     def saveQuestionSignin(self,question_id):
#         body = {
#         "answerResult": 1,
#         "questionId": question_id,
#         "channelId": "APP",
#         "merchantCode": "1641000001532",
#         "storeCode": "qiandaosonjifen",
#         "sysId": "T0000001",
#         "transactionUuid": self.uuid,  # 需要定义或传递这个变量
#         "inviteCode": ints,       # 需要定义或传递这个变量
#         "token": hrthd,           # 需要定义或传递这个变量
#         "apiPath": "%2Fapi%2Fpoints%2FsaveQuestionSignin",
#         "appId": "API_AUTH_WEB",
#         "timestamp": int(datetime.now().timestamp() * 1000)
#     }
#         headers = {
#             "Content-Type": "application/json;charset=UTF-8",
#             "Host": "mid.huaruntong.cn",
#             "Origin": "https://cloud.huaruntong.cn",
#             "Referer": "https://cloud.huaruntong.cn/",
#             "sec-ch-ua": "\"\"",
#             "sec-ch-ua-mobile": "?1",
#             "sec-ch-ua-platform": "\"\"",
#             "Sec-Fetch-Dest": "empty",
#             "Sec-Fetch-Mode": "cors",
#             "Sec-Fetch-Site": "same-site",
#             "User-Agent": "Mozilla/5.0 (Linux; Android 10; PCAM00 Build/QKQ1.190918.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.92 Mobile Safari/537.36/ hrtbrowser/5.3.5 grayscale/0",
#             "x-Hrt-Mid-Appid": "API_AUTH_WEB"
#         }

#         url = "https://mid.huaruntong.cn/api/points/saveQuestionSignin"
#         secret = "c274fc67-19f9-47ba-bb84-585a2e3a1f6a"
#         pub_key = """-----BEGIN PUBLIC KEY-----
# MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDuAiqDmvn9Rf15o21qkDxN0rUfZsX6rVBrtfgY6tamN2Yn+1D3eHZJuKNlucyqeBr6nmfN2srYAX+oyCXr5vWwFcljPuWh8aSASqyk7MfbAv5Q4VqYS7lsYUQRdw4plZG0NASDeBvHWi3lsHjGfNb7iUvgrk312EDfBHtRgDvB0QIDAQAB
# -----END PUBLIC KEY-----"""
#         signer = Signer(secret, pub_key)
#         response = requests.post(url, headers=headers, json=signer.signs(body))
#         data = response.json()
#         if self.debug:
#             print("\n\n【debug】===============这是 返回data==============")
#             print(json.dumps(data))

#         if data.get('code') == "S0A00000":
#             if data['data']:
#                 print(f"签到获得：{data['data']['point']}")
#                 msg += f"\n签到获得：{data['data']['point']}"
#             else:
#                 print(data['msg'])
#             msg += f"\n{data['msg']}"
#         else:
#             print(data['msg'])
#             msg += f"\n{data['msg']}"
#     def queryInvitedToDraw(self):
#         pass
# class Signer:
#     def __init__(self, secret, pub_key):
#         self.secret = secret
#         self.pub_key = pub_key

#     def encode_utf8(self, s):
#         return s.encode('utf-8')

#     def rsa_encrypt(self, data):
#         key = RSA.import_key(self.pub_key)
#         cipher = PKCS1_v1_5.new(key)
#         encrypted_data = cipher.encrypt(data.encode())
#         return base64.b64encode(encrypted_data).decode()

#     def aes_encrypt(self, data, key, iv):
#         cipher = AES.new(key, AES.MODE_CBC, iv)
#         padded_data = data + (16 - len(data) % 16) * chr(16 - len(data) % 16)
#         encrypted_data = cipher.encrypt(padded_data.encode())
#         return base64.b64encode(encrypted_data).decode()

#     def generate_random_key(self, length=16):
#         return ''.join(chr(i) for i in range(length))

#     def signs(self, body):
#         if 'apiPath' in body:
#             body['appId'] = body.get('appId')
#             body['timestamp'] = body.get('timestamp', int(datetime.now().timestamp() * 1000))
            
#             params = []
#             for key, value in body.items():
#                 if value is not None:
#                     if isinstance(value, datetime):
#                         value = json.dumps(value).replace('"', '')
#                     elif isinstance(value, dict):
#                         value = json.dumps(value)
#                     params.append(f"{key}={value}")
            
#             params_str = '&'.join(sorted(params))
#             hmac = hashlib.md5()
#             hmac.update(self.encode_utf8(params_str + self.secret))
#             signature = hmac.hexdigest()
            
#             body['signature'] = signature
            
#             random_key = self.generate_random_key()
#             iv = b'\x00' * 16
#             encrypted_data = self.aes_encrypt(json.dumps(body), random_key.encode(), iv)
            
#             return {
#                 "key": self.rsa_encrypt(random_key),
#                 "data": encrypted_data
#             }
#         return {}

if __name__ == '__main__':
    print('脚本执行开始\n')
    for user in ydwxhd:
        ydhx = YDWX(user)
        ydhx.user_info=user['userId']
        ydhx.main()
