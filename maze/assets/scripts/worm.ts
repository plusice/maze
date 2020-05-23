const {ccclass, property} = cc._decorator;

@ccclass
export default class Flag extends cc.Component {

	public game:any;

	onCollisionEnter () {
		this.game.getScore();
		this.node.destroy();
		console.log(1111111111)
	}
}
