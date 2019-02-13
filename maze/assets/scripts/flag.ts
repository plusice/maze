const {ccclass, property} = cc._decorator;

@ccclass
export default class Flag extends cc.Component {

	public game:any;

	onBeginContact () {
		this.game.stopGame();
		this.game.passGame();
	}
}
