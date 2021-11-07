const NodeRSA = require("node-rsa");
const path = require("path");
const fs = require("fs");
const got = require("got");
const { CookieJar } = require("tough-cookie");
const sendNotify = require("./sendNotify");
const moment = require("moment");

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};

let count = 0;

const cookieJar = new CookieJar();

let startTime = undefined;

const customGot = got.extend({
  cookieJar,
  timeout: 10000,
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
  attendLessonV3: "https://changjiang.yuketang.cn/api/v3/lesson/checkin",
  getOnLessonDataV3:
    "https://changjiang.yuketang.cn/api/v3/classroom/on-lesson",
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
    data: { on_lessons: on_lessons_v2 },
  } = await customGot(api.getOnLessonData).json();
  const on_lessons = on_lessons_v2;
  return on_lessons && on_lessons.length > 0 ? on_lessons : false;
};

const getOnLessonInfoV3 = async () => {
  const {
    data: { onLessonClassrooms },
  } = await customGot(api.getOnLessonDataV3).json();
  return onLessonClassrooms && onLessonClassrooms.length > 0
    ? onLessonClassrooms
    : false;
};

const attendLessonV3Request = (lessonId) =>
  customGot(api.attendLessonV3, {
    method: "POST",
    json: {
      source: 1,
      lessonId,
    },
  }).json();

const attendLessonV3 = async ({ lessonId, classroomId, courseName }) => {
  const data = await attendLessonV3Request(lessonId);
  const { code } = data;
  const success = code === 0;
  if (success) {
    console.log("Success: ", courseName);
    if (!successLessons.has(classroomId)) {
      sendNotify("YuKeTang: success", courseName);
      successLessons.add(classroomId);
    }
  } else {
    console.log("Error: ", data);
    sendNotify("YukeTang: Error", JSON.stringify(data, null, 2));
  }
};

const attendLesson = async ({ lesson_id, classroom }) => {
  const data = await customGot(api.attendLesson, {
    searchParams: { lesson_id, source: 1 },
  }).json();
  const name = classroom?.course?.name;
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
  if (count <= 1) {
    startTime = moment();
  } else {
    const nowTime = moment();
    if (nowTime.diff(startTime, "minute") > 320) {
      sendNotify("YukeTang: End", nowTime.format("YYYY-MM-DD hh:mm:ss"));
      return;
    }
  }
  setTimeout(execCheckIn, 1000 * 20);
  let lessonInfo = undefined;
  let lessonInfoV3 = undefined;
  try {
    lessonInfo = await getOnLessonInfo();
    lessonInfoV3 = await getOnLessonInfoV3();
  } catch (err) {
    console.log("GetOnInfo Failed:", err);
  }
  if (!lessonInfo && !lessonInfoV3) {
    return;
  }
  try {
    lessonInfo && lessonInfo.forEach((lesson) => attendLesson(lesson));
    lessonInfoV3 && lessonInfoV3.forEach((lesson) => attendLessonV3(lesson));
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
