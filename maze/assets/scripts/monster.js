var global = require('global');

cc.Class({
    extends: cc.Component,

    properties: {
        ripeSprite: cc.Sprite,
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        if (this.game.isStop || otherCollider.node.name === 'flag') {
            return false;
        }
        if (global.cos_env === 'wx') {
            wx.vibrateShort();
            let chickAudio =  wx.createInnerAudioContext();
            chickAudio.autoplay = true;
            chickAudio.src = cc.url.raw('resources/audio/ripe-chick.mp3');
        }
        var sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = this.ripeSprite.spriteFrame;
        this.game.stopGame();
        this.game.ripeGame();
    },

    // onLoad () {},

    start () {
    },

    // update (dt) {},
});
