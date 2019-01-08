var global = require('global');

cc.Class({
  extends: cc.Component,

  // LIFE-CYCLE CALLBACKS:

  closePanel () {
    this.game.startGame();
    this.node.destroy();
  }

  // update (dt) {},
});
