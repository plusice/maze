let global = require('global');

cc.Class({
  extends: cc.Component,

  properties: {
    // foo: {
    //     // ATTRIBUTES:
    //     default: null,        // The default value will be used only when the component attaching
    //                           // to a node for the first time
    //     type: cc.SpriteFrame, // optional, default is typeof default
    //     serializable: true,   // optional, default is true
    // },
    // bar: {
    //     get () {
    //         return this._bar;
    //     },
    //     set (value) {
    //         this._bar = value;
    //     }
    // },
  },

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {},

  start () {

  },

  restartGame () {
    // global.level = 1;
    // global.time = 0;
    cc.director.loadScene('main');
  },

  shareOrRank () {
    // 复活过，这里是显示排行榜
    if (this.game.revived) {
      this.game.showRank();
    } else {
      // 没有复活过，这里是分享
      cc.loader.loadRes("img/share",(err,data) => {
        this.game.shareGame({
          title: `我在小鸡电迷宫闯了${global.level}关，等你来超越！`,
          imageUrl: data.url
        });
        setTimeout(() => {
          this.game.revive();
        }, 500);
      });
    }
  }

  // update (dt) {},
});
