let sysInfo = {};
if (window.wx) {
  sysInfo = wx.getSystemInfoSync();
}
module.exports = {
  level: 1,
  time: 0,
  maxLevel: 7,
  cos_env: window.wx ? 'wx' : 'web',
  sysInfo: sysInfo,
  platform: sysInfo.platform,
  tik () {
    this.interval = setInterval(() => {
      this.time++;
    }, 1000);
  },
  stopTik () {
    clearInterval(this.interval);
  }
};