const {ccclass, property} = cc._decorator;

export interface ItemTemplateData {
    index: string;
    avatarSF: cc.SpriteFrame;
    nickName: string;
    score: string;
    time: string;
}