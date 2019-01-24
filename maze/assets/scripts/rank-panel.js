let global = require('global');

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
    cc.loader.loadRes('img/share',(err,data) => {
      this.game.shareGame({
        title: global.getShareText(2),
        imageUrl: data.url,
        query: 'isGroupRank=true'
      });
    });
  }

  // update (dt) {},
});
