# Usage
### **<u>Make Sure You have Chrome Browser</u>**

## Method 1: Local
```shell
git clone https://github.com/VidocqH/AutoAttendYuKeTang
cd AutoAttendYuKeTang
python3 -m venv env
source env/bin/activate
pip install -r requirements
```

## Method 2: Github Actions (Recommend)
**These actions are setting specified for 吉珠 CS junior students. Modify .github/workflows/*.yml to fit your needs.**

1. Fork [this responsitory](https://github.com/VidocqH/AutoAttendYuKeTang)
2. Create 'Server酱' [SCKEY](http://sc.ftqq.com/?c=code)
3. In project page, click 'Settings' -> click 'Secret'
4. In 'Secret' page, create two secrets named 'USER_INFO' and 'PUSH_KEY':
   - 'USER_INFO': yourYuKeTangaccount|yourYuKeTangpassword
   - 'PUSH_KEY': SCKEY
