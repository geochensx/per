"""
new Env("儿童医院查询")
cron: 30 * * * *
"""
import time
from os import environ, system, path
from selenium import webdriver
from qlapi import qlenv
client_id=environ.get("QLAPIClientID")
client_secret=environ.get("QLAPIClientSecret")
ql_env = qlenv(
    url="127.0.0.1",   #青龙面板IP地址(不包含http://)
    post=5700,			#青龙面板端口
    client_id=client_id,  # 青龙面板openapi登录用户名
    client_secret=client_secret # 青龙面板openapi登录密码
)
etyyck = environ.get("etyyck") if environ.get("etyyck") else False
if etyyck:
    pass
else:
    exit(0)
chrome_options = webdriver.ChromeOptions()
driver = webdriver.Remote(
    command_executor='http://10.1.1.118:4444/wd/hub', # 远程服务器地址
    options=chrome_options
)
driver.set_window_size(480, 1080)
driver.get("https://influenza.nbfeyy.com:7031/wechat/?t=1732596219872&t=1732599969596#/home/home_op_new")
cookie_dict = {
    "name": "token",
    "value": etyyck
}
driver.add_cookie(cookie_dict=cookie_dict)
url_list=['https://influenza.nbfeyy.com:7031/wechat/?t=1732621039311#/inspection/inspection_time',
          'https://influenza.nbfeyy.com:7031/wechat/?t=1732621039311#/chemical/chemical_time']
for url in url_list:
    driver.get(url)
    time.sleep(10)
    html=driver.page_source
    if not("暂无" in html):
        QLAPI.notify('妇女儿童医院',"出通知了尽快查看")
        ll=ql_env.search("etyyck")
        for (id,value) in ll:
            ql_env.disable([id])
time.sleep(30)
driver.quit()