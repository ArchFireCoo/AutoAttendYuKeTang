const NodeRSA = require('node-rsa')
const path = require('path')
const fs = require('fs')
const got = require('got')
const { CookieJar } = require('tough-cookie')
const sendNotify = require('./sendNotify')

const resolve = function (...args) {
  return path.resolve(__dirname, ...args)
}

let count = 0
const times = 540

const cookieJar = new CookieJar()

const customGot = got.extend({
  cookieJar,
})

const publicKey = fs.readFileSync(resolve('public.pem'), 'utf8')

const key = new NodeRSA(publicKey, 'pkcs8-public', {
  encryptionScheme: 'pkcs1',
})

const api = {
  login: 'https://changjiang.yuketang.cn/pc/login/verify_pwd_login/',
  getOnLessonData: 'https://changjiang.yuketang.cn/v/course_meta/on_lesson_courses',
  attendLesson: 'https://changjiang.yuketang.cn/v/lesson/lesson_info_v2',
}

const login = async (username, password) => {
  const body = await customGot(api.login, {
    method: 'POST',
    json: {
      type: 'PP',
      name: username,
      pwd: key.encrypt(password, 'base64'),
    },
  }).json()
  if (!body.success) throw new Error('login failed')
}

const getOnLessonInfo = async () => {
  const {
    data: { on_lessons },
  } = await customGot(api.getOnLessonData).json()
  return on_lessons.length > 0 ? on_lessons[0] : false
}

const attendLesson = async ({
  lesson_id,
  classroom: {
    course: { name },
  },
}) => {
  // await customGot(`https://changjiang.yuketang.cn/lesson/fullscreen/${lesson_id}?source=5`)
  const { success } = await customGot(api.attendLesson, {
    searchParams: { lesson_id },
  }).json()

  if (success) {
    sendNotify('YuKeTang: success', name)
  } else {
    sendNotify('YuKeTang: fail', name)
  }
}

const execCheckIn = async () => {
  console.log(`Number of executions: ${++count}`)
  const lessonInfo = await getOnLessonInfo()

  if (!lessonInfo && count < times) {
    setTimeout(execCheckIn, 1000 * 60)
    return
  } else if (count === times) {
    sendNotify('YuKeTang: fail', 'Not Found Online Class')
    return
  }

  attendLesson(lessonInfo)
}

const startUp = async () => {
  const { USER_INFO } = process.env
  const [USERNAME, PASSWORD] = USER_INFO.split('|')
  if (!(USERNAME && PASSWORD)) {
    console.log('Failed: USER_INFO not provided.')
    process.exit(0)
  }
  await login(USERNAME, PASSWORD)
  execCheckIn()
}

startUp()
