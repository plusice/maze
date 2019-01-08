// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
  extends: cc.Component,

  properties: {
    index: cc.Label,
    avatar: cc.Sprite,
    nickName: cc.Label,
    score: cc.Label,
    time: cc.Label
  },

  start () {

  },

  init: function (data) {
    this.index.string = data.index;
    this.avatar.spriteFrame = data.avatarSF;
    this.nickName.string = data.nickName;
    this.score.string = data.score;
    this.time.string = data.time;
  }
  // update (dt) {},
});
