const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

	public game:any;

	goon () {
		this.game.startGame();
		this.node.destroy();
	}

	// update (dt) {}
}
