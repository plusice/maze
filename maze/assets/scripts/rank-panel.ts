const {ccclass, property} = cc._decorator;

import  global from './global';

@ccclass
export default class NewClass extends cc.Component {

	public game:any;

	hidePanel () {
		this.node.active = false;
		this.game.startGame();
	}

	share () {
		cc.loader.loadRes('img/share',(err,data) => {
			this.game.shareGame({
			title: global.getShareText(2),
			imageUrl: data.url,
			query: 'isGroupRank=true'
			});
		});
	}

	// update (dt) {}
}
