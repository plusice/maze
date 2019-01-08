var global = require('global');

cc.Class({
  extends: cc.Component,

  properties: {},

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {

  },

  hidePanel () {
    this.node.active = false;
    this.game.startGame();
  },

  share () {
    cc.loader.loadRes("img/share",(err,data) => {
      this.game.shareGame({
        title: `我在小鸡电迷宫闯了${global.level}关，等你来超越！`,
        imageUrl: data.url
      });
    });
  }

  // update (dt) {},
});
