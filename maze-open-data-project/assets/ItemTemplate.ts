import {ItemTemplateData as itemData} from './common';

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

  @property(cc.Label)
  index: cc.Label;

  @property(cc.Sprite)
  avatar: cc.Sprite;

  @property(cc.Label)
  nickName: cc.Label;

  @property(cc.Label)
  score: cc.Label;

  @property(cc.Label)
  time: cc.Label

  start () {

  }

  init (data:itemData) {
    this.index.string = data.index;
    this.avatar.spriteFrame = data.avatarSF;
    this.nickName.string = data.nickName;
    this.score.string = data.score;
    this.time.string = data.time;
  }

  // update (dt) {}
}
