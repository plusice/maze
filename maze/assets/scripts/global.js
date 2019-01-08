module.exports = {
  level: 1,
  time: 0,
  maxLevel: 7,
  cos_env: window.wx ? 'wx' : 'web',
  tik () {
    this.interval = setInterval(() => {
      this.time++;
    }, 1000);
  },
  stopTik () {
    clearInterval(this.interval);
  }
};