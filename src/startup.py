from urllib import request, parse
from datetime import datetime
import time
from login import Login
from config import USERNAME, PASSWORD, PUSH_KEY

times = 8

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

        result = task.enterOnlineClass()
        if (result):
            msg = 'AttendSuccess'
            request.urlopen('https://sc.ftqq.com/' + PUSH_KEY + '.send?text=' + msg)
            print(msg)
            break

        print('The ' + str(count) + ' times not success' + '格林威治时间:' + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        time.sleep(n)


task = Login(username=USERNAME, password=PASSWORD)

print('init browser')
task.setBrowser()
task.login()
print('finish init browser')

timer(10 * 60, task)
