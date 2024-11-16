
# @env : rxkfck
# 功能：瑞幸签到 
# -------------------------------
"""
export rxkf = "7518db86-240a-4d70-8e1f-96eca2c16c9f"
new Env("瑞幸咖啡")
cron: 25 6,12,18 * * *
"""
from datetime import datetime
from json import dumps
from time import sleep, time
from os import environ, system, path
from random import randint, choice
from re import findall
from sys import exit, stdout
import requests

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
rxkfck = environ.get("rxkfck") if environ.get("rxkfck") else ""
if rxkfck == "":
    print("未找到rxkfck，请填写rxkfck变量")
    exit(0)

class RXKF:
    name = "瑞幸咖啡"
    def __init__(self):
        self.Authorization = rxkfck
        self.headers = {"Authorization": self.Authorization,
        "locale": "zh_CN",
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; M2102J2SC Build/UKQ1.231003.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.188 Mobile Safari/537.36 XWEB/1260213 MMWEBSDK/20240802 MMWEBID/3827 MicroMessenger/8.0.53.2740(0x2800353E) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
        }
        self.user_info = ""
        self.task_info = ""
    def sign(self):
        url = f'https://mall-api.luckincoffeeshop.com/p/signIn/userSignIn'
        data = requests.post(url, headers=self.headers, data="").json()
        if 'code' in data and data['code'] == 'A0003':
            self.print_now("CK已失效，请重新获取")
            return False
        elif 'code' in data and data['code'] == '00000':
            data_data = data['data'][0]
            score = data_data.get('score')
            self.task_info += f"签到成功，今日获取{score}积分\n"
        elif 'code' in data and data['code'] == 'A00001':
            self.task_info += f"签到失败，今天已签到\n"
        else:
            self.print_now(f"签到失败：{data}")
            self.task_info += f"签到失败：{data}\n"
        return True        

    def get_userinfo(self):
        url = f"https://mall-api.luckincoffeeshop.com/p/user/userInfo"
        data = requests.get(url, headers=self.headers).json()
        if 'code' in data and data['code'] == '00000':
            score=data['data']['score']
            userMobile=data['data']['userMobile']
            self.user_info+=f"用户手机：{userMobile}当前积分：{score}\n"
        else:
            self.user_info = f"查询失败,未获取到用户信息{data}\n"
    def lottery(self):
        url = f"https://mall-api.luckincoffeeshop.com/p/lottery/getDetail?activityId=191"
        data = requests.get(url, headers=self.headers).json()
        if 'code' in data and data['code'] == '00000':
            lotteryNum=data['data']['lotteryNum']
        else:
            self.user_info = f"抽奖失败{data}\n"
        if lotteryNum>=1:
            for i in range(lotteryNum):              
                url=f"https://mall-api.luckincoffeeshop.com/p/lottery/lottery?activityId=191"
                data = requests.get(url, headers=self.headers).json()
                if 'code' in data and data['code'] == '00000':
                    awardName=data['data']['awardName']
                    self.task_info += f"抽奖成功，获得{awardName}个抽奖机会\n"
                else:
                    self.task_info += f"抽奖失败{data}\n"
        elif lotteryNum==0:
            self.task_info += f"今日已抽过奖\n"
        else:
            self.task_info += f"抽奖失败\n"

    def main(self):
        if self.sign():  
            self.lottery()
            self.get_userinfo()
        self.msg = self.user_info + self.task_info
        send = load_send()
        if callable(send):
            send("瑞幸咖啡", self.msg)
        else:
            print('\n加载通知服务失败')

if __name__ == '__main__':
    rxkf = RXKF()
    rxkf.main()
