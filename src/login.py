from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import NoSuchElementException
import os
import time

class Login:
    browser = None
    __username = ''
    __password = ''

    def __init__(self, username, password):
        self.__username = username
        self.__password = password

    def setBrowser(self):
        options = Options()
        options.add_argument('--no-sandbox')
        options.add_argument('disable-infobars')
        CHROME_DRIVER = os.getcwd() + '/src/chromedriver'
        self.browser = webdriver.Chrome(executable_path=CHROME_DRIVER, options=options)

    def login(self):
        url = 'https://changjiang.yuketang.cn/web'
        self.browser.get(url)
        self.browser.find_element_by_css_selector('.changeImg').click()
        input_elem = self.browser.find_element_by_css_selector('input[name=loginname]')
        pwd_elem = self.browser.find_element_by_css_selector('input[name=password]')
        input_elem.clear()
        pwd_elem.clear()
        input_elem.send_keys(self.__username)
        pwd_elem.send_keys(self.__password)
        pwd_elem.send_keys(Keys.ENTER)

    def enterOnlineClass(self):
        time.sleep(5)
        try:
            self.browser.find_element_by_css_selector('.onlesson').click()
            time.sleep(2)
            self.browser.find_element_by_css_selector('.lessonlist').click()
            time.sleep(5)
            self.browser.close()
            return True
        except NoSuchElementException:
            return False
