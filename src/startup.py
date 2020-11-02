from urllib import request, parse
from datetime import datetime
import time
from login import Login
from config import USERNAME, PASSWORD, PUSH_KEY

times = 2

def timer(n, task):
    count = 0
    while True: 
        count += 1
        if (count > times):
            msg = 'NotFoundOnlineClass'
            print('https://sc.ftqq.com/' + PUSH_KEY + '.send?text=' + msg)
            request.urlopen('https://sc.ftqq.com/' + PUSH_KEY + '.send?text=' + msg)
            print(msg)
            break
        print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        result = task.enterOnlineClass()
        if (result):
            msg = 'AttendSuccess'
            request.urlopen('https://sc.ftqq.com/' + PUSH_KEY + '.send?text=' + msg)
            print(msg)
            break
        time.sleep(n)


task = Login(username=USERNAME, password=PASSWORD)
task.setBrowser()
task.login()
timer(2 * 60, task)
