const {ccclass, property} = cc._decorator;

import  global from './global';

@ccclass
export default class NewClass extends cc.Component {

	nextLevel () {
		global.level++;
		cc.director.loadScene('main');
	}

	// update (dt) {}
}
