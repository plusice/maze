var global = require('global');

cc.Class({
  extends: cc.Component,

  properties: {
    maze: cc.Node,
    chick: cc.Node,
    flag: cc.Node,
    speed: cc.v2(0, 0),
    stopBtn: cc.Node,
    startBtn: cc.Node,
    level: cc.Label,
    dialogWrapper: cc.Node,
    helpPanelPrefab: cc.Prefab,
    passPanelPrefab: cc.Prefab,
    ripePanelPrefab: cc.Prefab,
    goonPanelPrefab: cc.Prefab,
    rankPanel: cc.Node,
    speedCoefficient: 0.1
  },

  // use this for initialization
  onLoad: function () {
    this.level.string = `第${global.level}关`;
    // 根据关卡加速
    this.speedCoefficient = this.speedCoefficient + global.level * 0.1;

    // 小鸡组件、旗子组件等保存当前主组件对象
    this.chick.getComponent('monster').game = this;
    this.flag.getComponent('flag').game = this;
    this.rankPanel.getComponent('rank-panel').game = this;
    // 开启碰撞检测系统
    var manager = cc.director.getCollisionManager();
    manager.enabled = true;

    // 开启物理系统
    cc.director.getPhysicsManager().enabled = true;
    cc.director.getPhysicsManager().gravity = cc.v2();

    if (global.cos_env === 'wx') {
      if (!wx.getStorageSync('hasPlayed')) {
        this.showHelp();
        wx.setStorageSync('hasPlayed', 'yes');
      } else {
        global.tik();
      }
    }
    this.GSensor();

  },

  GSensor:function(){
    // 开启加速计
    cc.systemEvent.setAccelerometerEnabled(true);
    cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onAccel, this);
  },

  onAccel: function(accelEvent) {
    this.speed.x = global.cos_env === 'wx' ? -accelEvent.acc.x/2 : accelEvent.acc.x/2;
    this.speed.y = global.cos_env === 'wx' ? -accelEvent.acc.y/2 : accelEvent.acc.y/2;
    return true;
  },

  // called every frame
  update: function (dt) {
    if (this.isStop) {
      return;
    }
    var rigidbody = this.chick.getComponent(cc.RigidBody);
    var velocity = rigidbody.linearVelocity;
    if (velocity.x < -10 && this.speed.x > 0
        || velocity.x > 10 && this.speed.x < 0
        || velocity.y < -10 && this.speed.y > 0
        || velocity.y > 10 && this.speed.y < 0) {
      rigidbody.linearDamping = Math.max(Math.abs(this.speed.x), Math.abs(this.speed.y));
    } else {
      rigidbody.linearDamping = 0.5;
    }
    rigidbody.linearVelocity = cc.v2(velocity.x + this.speed.x * this.speedCoefficient, velocity.y + this.speed.y * this.speedCoefficient);
    // rigidbody.linearVelocity = cc.v2(velocity.x + this.speed.x * this.speedCoefficient, velocity.y + this.speed.y * this.speedCoefficient);
  },
  // 暂停游戏。保存当前速度并设置当前速度为0
  stopGame () {
    this.isStop = true;
    global.stopTik();
    var rigidbody = this.chick.getComponent(cc.RigidBody);
    var velocity = rigidbody.linearVelocity;
    this.tempV = cc.v2(velocity.x, velocity.y);
    rigidbody.linearVelocity = cc.v2(0, 0);
    this.stopBtn.active = false;
    this.startBtn.active = true;
    // 清除迷宫中的音效
    this.maze.getComponent('maze').clearElectricAndSound();
    // 暂停物理系统
    cc.director.getPhysicsManager().enabled = false;
  },
  // 开始游戏并恢复速度
  startGame () {
    if (this.riped) {
      return false;
    }
    // 开始物理系统
    cc.director.getPhysicsManager().enabled = true;
    cc.director.getPhysicsManager().gravity = cc.v2();
    this.isStop = false;
    global.tik();
    this.stopBtn.active = true;
    this.startBtn.active = false;
    this.chick.getComponent(cc.RigidBody).linearVelocity = this.tempV;
    this.maze.getComponent('maze').clearElectricAndSound().playElectricAndSound();
  },
  // 显示帮助弹窗，并在弹窗js组件中保存当前组件
  showHelp () {
    this.stopGame();
    var helpNode = cc.instantiate(this.helpPanelPrefab);
    helpNode.getComponent('help-panel').game = this;
    if (global.cos_env === 'wx') {
      if (!wx.getStorageSync('hasPlayed')) {
        helpNode.getChildByName('goon').getChildByName('Label').getComponent(cc.Label).string = '开始游戏';
      }
    }
    this.dialogWrapper.addChild(helpNode);
  },
  passGame () {
    if (global.cos_env === 'wx') {
      let audio =  wx.createInnerAudioContext();
      audio.autoplay = true;
      audio.src = cc.url.raw('resources/audio/chick.mp3');
    }
    this.stopGame();
    var passPanel = cc.instantiate(this.passPanelPrefab);
    // passPanel.getComponent('help-panel').game = this;
    this.dialogWrapper.addChild(passPanel);

    // 记录分数
    if (global.cos_env === 'wx') {
      wx.getOpenDataContext().postMessage({
        score: global.level + 1,
        time: global.time
      });
    }
  },
  // 触电
  ripeGame () {
    if (this.riped) {
      return false;
    }
    this.riped = true;
    this.stopGame();
    setTimeout(() => {
      this.ripePanel = cc.instantiate(this.ripePanelPrefab);
      // 复活过了不能再分享复活了，显示排行榜
      if (this.revived) {
        this.ripePanel.getChildByName('share').getChildByName('Label').getComponent(cc.Label).string = '排行榜';
      }
      this.ripePanel.getComponent('ripe-panel').game = this;
      this.dialogWrapper.addChild(this.ripePanel);
    }, 500);

    // 记录分数
    if (global.cos_env === 'wx') {
      wx.getOpenDataContext().postMessage({
        score: global.level,
        time: global.time
      });
    }
  },
  // 复活一次，复活后速度为0
  revive () {
    if (this.revived) {
      return false;
    }
    this.ripePanel.destroy();
    this.revived = true;
    this.riped = false;
    this.tempV = cc.v2(0, 0);
    // 继续开始游戏弹窗
    var goonPanel = cc.instantiate(this.goonPanelPrefab);
    goonPanel.getComponent('goon-panel').game = this;
    this.dialogWrapper.addChild(goonPanel);
  },

  shareGame ({title, imageUrl}) {
    wx.shareAppMessage({
      title: title,
      imageUrl: imageUrl
    });
  },

  showRank () {
    this.stopGame();
    this.rankPanel.setPosition(0, 0);
    this.rankPanel.active = true;
  }
});