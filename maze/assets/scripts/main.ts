const {ccclass, property} = cc._decorator;

import  global from './global';

let imageUrl = '';
let loaded = function(){};
let loadPromise = new Promise((resolve) => {
  loaded = resolve;
});
let comp = null;
let hasUpdateRank = false;
let ad = {
  bannerAd: undefined,
  hasBannerAd: false,
  // 销毁显示的广告并且新建另外一个广告
  buildAd () {
    if (global.sysInfo.SDKVersion < '2.0.4') {
      return false;
    }
    if (this.bannerAd) {
      this.bannerAd.hide();
      this.bannerAd.destroy();
    }
    this.hasBannerAd = false;
    this.bannerAd = wx.createBannerAd({
      adUnitId: 'adunit-0eb5472c658d89c2',
      style: {
        left: 10,
        top: global.sysInfo.screenHeight - 140,
        width: global.sysInfo.screenWidth - 20
      }
    });
    this.bannerAd.onResize(res => {
      // iphonex等机型（屏幕比较高），广告不能跟底部的控制条重合
      this.bannerAd.style.top = global.sysInfo.screenHeight - res.height - (global.sysInfo.screenHeight/global.sysInfo.screenWidth > 1.9 ? 20 : 10);
    });
    this.bannerAd.onError(err => {
      console.log(err);
    });
    this.bannerAd.onLoad(() => {
      this.hasBannerAd = true;
    });
  }
};
// 微信各种处理
if (global.cos_env === 'wx') {
  // 开启微信右上角分享
  wx.showShareMenu({
    withShareTicket: true
  });
  // 默认分享文案
  wx.onShareAppMessage(function () {
    return {
      title: global.getShareText(2),
      imageUrl: imageUrl
    };
  });
  // onshow时给loadPromise添加then，loadPromise在主场景onload的时候resolve。只要场景onload，每次onshow的then都会执行
  wx.onShow(obj => {
    loadPromise.then(() => {
      let hasPlayed = wx.getStorageSync('hasPlayed');
      if (obj.query.isGroupRank && obj.shareTicket) {
        // 游戏show时如果是群打开的带isGroupRank的分享，显示群排行
        // 如果是第一次玩，设置自己的分数为1
        wx.getOpenDataContext().postMessage({
          shareTicket: obj.shareTicket,
          score: hasPlayed ? undefined : 1,
          time: hasPlayed ? undefined : 0
        });
        comp && comp.showRank(true);
      } else if (!hasUpdateRank) {
        // 否则只是更新好友排行榜数据，不显示
        // 如果是第一次玩，设置自己的分数为1
        hasUpdateRank = true;
        wx.getOpenDataContext().postMessage({
          score: hasPlayed ? undefined : 1,
          time: hasPlayed ? undefined : 0
        });
      }
      // 是否是第一次玩
      if (!hasPlayed) {
        comp && comp.showHelp();
        wx.setStorageSync('hasPlayed', 'yes');
      }
    }).catch((err) => {
      console.log(err)
    });
  });
}

@ccclass
export default class Main extends cc.Component {
  private isStop:boolean = false;
  private tempV:cc.Vec2;
  private riped:boolean = false;
  private revived:boolean = false;
  private ripePanel:any;

  @property(cc.Node)
  maze: cc.Node;

  @property(cc.Node)
  chick:cc.Node;

  @property(cc.Node)
  flag: cc.Node;

  @property(cc.Vec2)
  speed: cc.Vec2 = cc.v2(0,0);

  @property(cc.Node)
  stopBtn: cc.Node;

  @property(cc.Node)
  startBtn: cc.Node;

  @property(cc.Label)
  level: cc.Label;

  @property(cc.Node)
  dialogWrapper: cc.Node;

  @property(cc.Prefab)
  helpPanelPrefab: cc.Prefab;

  @property(cc.Prefab)
  passPanelPrefab: cc.Prefab;

  @property(cc.Prefab)
  ripePanelPrefab: cc.Prefab;

  @property(cc.Prefab)
  goonPanelPrefab: cc.Prefab;

  @property(cc.Node)
  rankPanel: cc.Node;

  @property(Number)
  speedCoefficient: number = 0.1;


  start () {

  }

  onLoad () {
    this.level.string = `第${global.level}关`;
    // 根据关卡加速
    this.speedCoefficient = this.speedCoefficient + global.level * 0.1;

    // 小鸡组件、旗子组件等保存当前主组件对象
    this.chick.getComponent('monster').game = this;
    this.flag.getComponent('flag').game = this;
    this.rankPanel.getComponent('rank-panel').game = this;
    this.rankPanel.active = false;
    // 开启碰撞检测系统
    let manager = cc.director.getCollisionManager();
    manager.enabled = true;

    // 开启物理系统
    cc.director.getPhysicsManager().enabled = true;
    cc.director.getPhysicsManager().gravity = cc.v2();

    // 开始计时
    global.tik();

    if (global.cos_env === 'wx') {
      loaded();
      // 准备广告
      ad.buildAd();
    }
    cc.loader.loadRes('img/share',(err,data) => {
      imageUrl = data.url;
    });
    this.GSensor();

  }

  GSensor () {
    // 开启加速计
    cc.systemEvent.setAccelerometerEnabled(true);
    cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onAccel, this);
  }

  onAccel (accelEvent:any):Boolean {
    this.speed.x = accelEvent.acc.x/2;
    this.speed.y = accelEvent.acc.y/2;
    if (global.cos_env === 'wx' && global.platform === 'ios') {
      this.speed.x = -this.speed.x;
      this.speed.y = -this.speed.y;
    }
    return true;
  }

  update () {
    if (this.isStop) {
      return;
    }
    let rigidbody = this.chick.getComponent(cc.RigidBody);
    let velocity = rigidbody.linearVelocity;
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
  }

  // 暂停游戏。保存当前速度并设置当前速度为0
  stopGame () {
    if (this.isStop) {
      return true;
    }
    this.isStop = true;
    global.stopTik();
    let rigidbody = this.chick.getComponent(cc.RigidBody);
    let velocity = rigidbody.linearVelocity;
    this.tempV = cc.v2(velocity.x, velocity.y);
    rigidbody.linearVelocity = cc.v2(0, 0);
    this.stopBtn.active = false;
    this.startBtn.active = true;
    // 清除迷宫中的音效
    this.maze.getComponent('maze').clearElectricAndSound();
    // 暂停物理系统
    cc.director.getPhysicsManager().enabled = false;
  }

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

    // 准备广告
    ad.buildAd();
  }

  showHelp () {
    this.stopGame();
    let helpNode = cc.instantiate(this.helpPanelPrefab);
    helpNode.getComponent('help-panel').game = this;
    if (global.cos_env === 'wx') {
      if (!wx.getStorageSync('hasPlayed')) {
        helpNode.getChildByName('goon').getChildByName('Label').getComponent(cc.Label).string = '开始游戏';
      }
    }
    this.dialogWrapper.addChild(helpNode);
  }

  passGame () {
    if (global.cos_env === 'wx') {
      let audio =  wx.createInnerAudioContext();
      audio.autoplay = true;
      audio.src = cc.url.raw('resources/audio/chick.mp3');
    }
    this.stopGame();
    let passPanel = cc.instantiate(this.passPanelPrefab);
    // passPanel.getComponent('help-panel').game = this;
    this.dialogWrapper.addChild(passPanel);

    // 记录分数
    if (global.cos_env === 'wx') {
      wx.getOpenDataContext().postMessage({
        score: global.level + 1,
        time: global.time
      });
    }

    // 显示广告
    if (ad.bannerAd && ad.hasBannerAd) {
      ad.bannerAd.show();
    }
  }

  // 第一次显示排行榜和立即复活
  // 第二次显示分享和重新开始
  ripeGame () {
    if (this.riped) {
      return false;
    }
    this.riped = true;
    this.stopGame();
    setTimeout(() => {
      this.ripePanel = cc.instantiate(this.ripePanelPrefab);
      // 复活过了不能再复活了
      if (this.revived) {
        this.ripePanel.getChildByName('restart').getChildByName('Label').getComponent(cc.Label).string = '再来一次';
        this.ripePanel.getChildByName('share').getChildByName('Label').getComponent(cc.Label).string = '分享战绩';
      }
      this.ripePanel.getComponent('ripe-panel').game = this;
      this.dialogWrapper.addChild(this.ripePanel);
    }, 500);

    // 显示广告
    if (ad.bannerAd && ad.hasBannerAd) {
      ad.bannerAd.show();
    }
  }

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
    let goonPanel = cc.instantiate(this.goonPanelPrefab);
    goonPanel.getComponent('goon-panel').game = this;
    this.dialogWrapper.addChild(goonPanel);
  }

  shareGame ({title, imageUrl, query}) {
    wx.shareAppMessage({
      title: title,
      imageUrl: imageUrl,
      query: query
    });
  }

  showRank (isGroupRank) {
    if (!this.rankPanel.active) {
      this.stopGame();
      // 排行榜高一点，不然会被广告挡住
      this.rankPanel.setPosition(0, 30);
      this.rankPanel.active = true;
    }
    if (isGroupRank === true) {
      this.rankPanel.getChildByName('share').getChildByName('label').getComponent(cc.Label).string = '分享好友';
      this.rankPanel.getChildByName('close').getChildByName('label').getComponent(cc.Label).string = '开始游戏';
    } else {
      this.rankPanel.getChildByName('share').getChildByName('label').getComponent(cc.Label).string = '查看群排行';
      this.rankPanel.getChildByName('close').getChildByName('label').getComponent(cc.Label).string = '关闭';
    }
    // 显示广告
    if (ad.bannerAd && ad.hasBannerAd) {
      ad.bannerAd.show();
    }
  }

  getScore () {
    global.score++;
  }
}
