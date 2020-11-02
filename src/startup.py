from datetime import datetime
import time
from login import Login

def timer(n, task):
    count = 0
    while True: 
        count += 1
        if (count > 5):
            print('Not found online class')
            break
        print(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        result = task.enterOnlineClass()
        if (result):
            print('Attend class success')
            break
        time.sleep(n)


username = ''
password = ''

task = Login(username=username, password=password)
task.setBrowser()
task.login()
timer(15 * 60, task)
# timer(5, task)
