const {ccclass, property} = cc._decorator;

import  global from './global';

@ccclass
export default class NewClass extends cc.Component {

	public game:any;

	@property(cc.Sprite)
	ripeSprite: cc.Sprite;

	onCollisionEnter (otherCollider:any) {
		if (this.game.isStop || !(otherCollider.node.name === 'electric')) {
			return false;
		}
		if (global.cos_env === 'wx') {
			wx.vibrateShort();
			let chickAudio =  wx.createInnerAudioContext();
			chickAudio.autoplay = true;
			chickAudio.src = cc.url.raw('resources/audio/ripe-chick.mp3');
		}
		let sprite = this.node.getComponent(cc.Sprite);
		sprite.spriteFrame = this.ripeSprite.spriteFrame;
		this.game.stopGame();
		this.game.ripeGame();
	}

	// update (dt) {}
}
