const got = require('got')

const SCKEY = process.env.PUSH_KEY
const BARKID = process.env.BARK_ID

const sendNotify = (title, message) => {
  console.log("SCKEY:" + SCKEY);
  console.log("BARKID:" + BARKID);
  console.log("title:" + title);
  console.log("message:" + message);
  console.log("BARKReqURL:" + `https://api.day.app/${BARKID}/${title}/${message}`);
  if (BARKID) {
    got(`https://api.day.app/${BARKID}/%E6%A0%87%E9%A2%98/%E5%86%85%E5%AE%B9?group=%E9%95%BF%E6%B1%9F%E4%B8%8E%E8%AF%BE%E5%A0%82`, {
          responseType: 'json'  
    }).then( ({ body }) => {
      if (body.code === 200) {
        console.log("Bark app 推送通知成功");
      }else {
        console.log(`Bark app 推送通知异常：${body.message}`);
      }
    }).catch( (err) => {
      console.log("Bark app 发送通知调用API失败！！\n");
      console.log(err);
      console.log("SCKEY:" + SCKEY);
      console.log("BARKID:" + BARKID);
      console.log("BARKReqURL:" + `https://api.day.app/${BARKID}/${title}/${message}`);
    })
  } else {
    console.log( "您未提供BARKID，无法使用BARK接收推送通知\n")
  }

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
