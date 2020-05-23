const {ccclass, property} = cc._decorator;

import  global from './global';

@ccclass
export default class NewClass extends cc.Component {

  public game:any;

	// 第一次调用原地复活
	restartGame () {
		if (this.game.revived) {
			global.level = 1;
			global.time = 0;
			global.score = 0;
		  cc.director.loadScene('main');
		} else {
		  this.game.revive();
		}
	}

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


	// update (dt) {}
}
