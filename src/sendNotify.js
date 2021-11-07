const got = require('got')

const SCKEY = process.env.PUSH_KEY

const sendNotify = (title, message) => {
  if (SCKEY) {
    got(`https://sctapi.ftqq.com/${SCKEY}.send`, {
      searchParams: {
        text: title,
        desp: message,
      },
      responseType: 'json',
    })
      .then(({ body }) => {
        if (body.code === 0) {
          console.log('server酱发送通知消息成功\n')
        } else if (body.code === 1024) {
          console.log(`server酱发送通知消息异常: ${body.errmsg}\n`)
        } else {
          console.log(`server酱发送通知消息异常\n${JSON.stringify(body)}`)
        }
      })
      .catch((err) => {
        console.log('发送通知调用API失败！！\n')
        console.log(err)
      })
  } else {
    console.log('您未提供server酱的SCKEY，取消微信推送消息通知\n')
  }
}

module.exports = sendNotify
