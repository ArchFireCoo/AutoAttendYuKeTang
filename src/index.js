const NodeRSA = require("node-rsa");
const path = require("path");
const fs = require("fs");
const got = require("got");
const { CookieJar } = require("tough-cookie");
const sendNotify = require("./sendNotify");

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};

let count = 0;
const times = 960;

const cookieJar = new CookieJar();

const customGot = got.extend({
  cookieJar,
});

const successLessons = new Set();

const publicKey = fs.readFileSync(resolve("public.pem"), "utf8");
const key = new NodeRSA(publicKey, "pkcs8-public", {
  encryptionScheme: "pkcs1",
});

const api = {
  login: "https://changjiang.yuketang.cn/pc/login/verify_pwd_login/",
  getOnLessonData:
    "https://changjiang.yuketang.cn/v/course_meta/on_lesson_courses",
  attendLesson: "https://changjiang.yuketang.cn/v/lesson/lesson_info_v2",
  attendLessonV3: "https://changjiang.yuketang.cn/api/v3/classroom/on-lesson"
};

const login = async (username, password) => {
  const body = await customGot(api.login, {
    method: "POST",
    json: {
      type: "PP",
      name: username,
      pwd: key.encrypt(password, "base64"),
    },
  }).json();
  if (!body.success) throw new Error("login failed");
};

const getOnLessonInfo = async () => {
  const {
    data: { on_lessons_v2 },
  } = await customGot(api.getOnLessonData).json();
  const {
    data: {onLessonClassrooms}
  } = await customGot(api.attendLessonV3).json();
  const on_lessons = on_lessons_v2.concat(onLessonClassrooms)
  return on_lessons.length > 0 ? on_lessons : false;
};

const attendLesson = async ({
  lesson_id,
  classroom: {
    course: { name },
  },
}) => {
  // await customGot(`https://changjiang.yuketang.cn/lesson/fullscreen/${lesson_id}?source=5`)
  const data = await customGot(api.attendLesson, {
    searchParams: { lesson_id },
  }).json();
  const { success } = data;
  if (success) {
    console.log("Success: ", name);
    if (!successLessons.has(lesson_id)) {
      sendNotify("YuKeTang: success", name);
      successLessons.add(lesson_id);
    }
  } else {
    console.log("Error: ", data);
    sendNotify("YukeTang: Error", JSON.stringify(data, null, 2));
  }
};

const execCheckIn = async () => {
  console.log(`Number of executions: ${++count}`);
  let lessonInfo = undefined;
  try {
    lessonInfo = await getOnLessonInfo();
  } catch (err) {
    console.log("GetOnInfo Failed:", err);
  }
  if (count >= times) {
    sendNotify("YukeTang: End", new Date().toLocaleString("zh-CN"));
    return;
  }
  if (count < times) {
    setTimeout(execCheckIn, 1000 * 20);
  }
  if (!lessonInfo) {
    return;
  }
  try {
    lessonInfo.forEach((lesson) => attendLesson(lesson));
  } catch (err) {
    console.log("Attend Failed:", err);
  }
};

const startUp = async () => {
  const { USER_INFO } = process.env;
  const [USERNAME, PASSWORD] = USER_INFO.split("|");
  if (!(USERNAME && PASSWORD)) {
    console.log("Failed: USER_INFO not provided.");
    process.exit(0);
  }
  await login(USERNAME, PASSWORD);
  sendNotify("YukeTang: Start", new Date().toLocaleString("zh-CN"));
  execCheckIn();
};

startUp();
