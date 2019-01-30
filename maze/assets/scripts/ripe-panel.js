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
  // 第一次调用原地复活
  restartGame () {
    // global.level = 1;
    // global.time = 0;
    if (this.game.revived) {
      cc.director.loadScene('main');
    } else {
      this.game.revive();
    }
  },

  shareOrRank () {
    // 复活过，这里是分享
    if (this.game.revived) {
      cc.loader.loadRes("img/share",(err,data) => {
        this.game.shareGame({
          title: global.getShareText(2),
          imageUrl: data.url
        });
        setTimeout(() => {
          this.game.revive();
        }, 500);
      });
    } else {
      // 没有复活过，这里是显示排行榜
      this.game.showRank();
    }
  }

  // update (dt) {},
});


// let n = 4;
// let m = [1,3,4,6,8,10,12];
// let sum = 18;
// let arr = [];

// function sumFun(sum, indexM) {

//   if (sum <= 0 || indexM < 0) {
//     return;
//   }
//   if (sum == m[indexM]) {
//     console.log(arr.concat(m[indexM]));
//     return;
//   }


//   if (sum <= m[indexM]) {
//     sumFun(sum, indexM - 1);
//   } else {
//     arr.push(m[indexM]);
//     sumFun(sum - m[indexM], indexM - 1);
//     arr.pop();
//     sumFun(sum, indexM - 1);
//   }

// }
// sumFun(sum, m.length - 1)




