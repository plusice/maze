let sysInfo:any = {};
if (window.wx) {
  sysInfo = wx.getSystemInfoSync();
}
export default {
  level: 1,
  score: 0,
  time: 0,
  maxLevel: 7,
  cos_env: window.wx ? 'wx' : 'web',
  sysInfo: sysInfo,
  platform: sysInfo.platform,
  tik () {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      this.time++;
    }, 1000);
  },
  stopTik () {
    clearInterval(this.interval);
  },
  // 获取分享文本
  getShareText (code:number, level?:number) {
    let text = '';
    switch(code){
    case 1:
      text = `我在小鸡电迷宫闯了${level}关，等你来超越！`;
      break;
    case 2:
      text = '过年啦，迷宫里的小鸡仔要被吃啦，快点帮它逃出来吧～';
      break;
    default:
      text = `我在小鸡电迷宫闯了${level}关，等你来超越！`;
    }
    return text;
  }
};