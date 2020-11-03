from urllib import request, parse
from datetime import datetime
import time
from login import Login
from config import USERNAME, PASSWORD, PUSH_KEY
from urllib.parse import quote
import string

times = 20

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
        if (result[0]):
            msg = 'AttendSuccess'
            url = quote('https://sc.ftqq.com/' + PUSH_KEY + '.send?text=' + msg + '&desp=' + result[1], safe = string.printable)
            request.urlopen(url)
            print(msg)
            break

        print('The ' + str(count) + ' times did not success')
        time.sleep(n)


task = Login(username=USERNAME, password=PASSWORD)

print('init browser')
task.setBrowser()
task.login()
print('finish init browser')

timer(5 * 60, task)
