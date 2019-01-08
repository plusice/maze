let RankItem = cc.Class({
  name: 'RankItem',
  properties: {
    index: 1,
    avatarSF: cc.SpriteFrame,
    nickname: '',
    openid: '',
    score: 0,
    time: 0
  }
});

cc.Class({
  extends: cc.Component,

  properties: {
    rankItemList: {
      default: [],
      type: RankItem
    },
    rankItemPrefab: cc.Prefab,
    linePrefab: cc.Prefab
  },

  onLoad () {
    this.updateRank();
    wx.onMessage((data) => {
      if (data.score) {
        this.setSelfScore(data.score, data.time).then(() => {
          this.updateRank();
        });
      } else {
        this.updateRank();
      }
    });
  },

  start () {

  },


  setSelfScore (score, time) {
    return new Promise((resolve, reject) => {
      wx.getUserCloudStorage({
        keyList: ['level'],
        success (res) {
          if (res.KVDataList && res.KVDataList[0]) {
            let oldScore = 1;
            try {
              oldScore = JSON.parse(res.KVDataList[0].value).wxgame.score;
              if (score >= oldScore) {
                wx.setUserCloudStorage({
                  KVDataList: [{
                    key: 'level',
                    value: JSON.stringify({
                      wxgame: {
                        score: score,
                        time: time,
                        update_time: new Date().getTime(),
                        randomCode: Math.random()
                      }
                    })
                  }],
                  complete () {
                    resolve();
                  }
                });
              } else {
                reject();
              }
            } catch (err) {
              reject();
            }
          } else {
            wx.setUserCloudStorage({
              KVDataList: [{
                key: 'level',
                value: JSON.stringify({
                  wxgame: {
                    score: score,
                    time: time,
                    update_time: new Date().getTime(),
                    randomCode: Math.random()
                  }
                })
              }],
              complete () {
                resolve();
              }
            });
          }
        },
        fail () {
          wx.setUserCloudStorage({
            KVDataList: [{
              key: 'level',
              value: JSON.stringify({
                wxgame: {
                  score: score,
                  time: time,
                  update_time: new Date().getTime(),
                  randomCode: Math.random()
                }
              })
            }],
            complete () {
              resolve();
            }
          });
        }
      });
    });
  },

  updateRank () {
    if (this.rendering) {
      return false;
    }
    this.rendering = true;
    let comp = this;
    this.dataList = [];
    this.friendDataList = [{
      avatarUrl: '',
      nickname: '',
      openid: '',
      KVDataList: [{
        key: 'level',
        value: '{"wxgame": {"score":16,"update_time": 1513080573}}'
      }]
    }];
    this.userData = {
      KVDataList: []
    };
    let pro1 = new Promise(function(resolve){
      wx.getFriendCloudStorage({
        keyList: ['level'],
        success (res) {
          if (res.data) {
            comp.friendDataList = res.data;
            resolve();
          }
        }
      });
    });
    let pro2 = new Promise(function(resolve){
      wx.getUserCloudStorage({
        keyList: ['level'],
        success (res) {
          if (res.KVDataList) {
            let KVDataList = comp.userData.KVDataList = res.KVDataList;
            if (KVDataList && KVDataList[0] && KVDataList[0].value) {
              comp.userData.wxgame = JSON.parse(KVDataList[0].value).wxgame;
            }
            resolve();
          }
        }
      });
    });
    // let pro3 = new Promise(function(resolve, reject){
    //   wx.getUserInfo({
    //     openIdList: ['selfOpenId'],
    //     lang: 'zh_CN',
    //     success (res) {
    //       console.log('self', res)
    //       comp.userData = Object.assign(comp.userData, res.data[0]);
    //       resolve();
    //     }
    //   })
    // });
    Promise.all([pro1, pro2]).then(() => {
      comp.dataList = comp.friendDataList;
      comp.dataList.forEach(item => {
        if (item.KVDataList && item.KVDataList[0] && item.KVDataList[0].value) {
          try {
            let itemGame = JSON.parse(item.KVDataList[0].value).wxgame;
            item.score = itemGame.score;
            item.time = itemGame.time;
            item.update_time = itemGame.update_time;
            item.randomCode = itemGame.randomCode;
          } catch (err) {
            item.score = 1;
            item.time = 10;
          }
        } else {
          item.score = 1;
          item.time = 10;
        }
      });
      comp.dataList.sort((item1, item2) => {
        if (item2.score === item1.score) {
          return item1.time - item2.time;
        } else {
          return item2.score - item1.score;
        }
      });
      // 用分数时间和随机code判断是否是当前用户，把当前用户提前到数组最前面
      let userGame = comp.userData.wxgame;
      let curUserItem = null;
      comp.dataList.forEach((item, index) => {
        item.index = index + 1;
        if (userGame.score === item.score && userGame.time === item.time && item.update_time === userGame.update_time && item.randomCode === userGame.randomCode) {
          curUserItem = item;
        }
      });
      let rankItemList = comp.dataList.slice(0, 10);
      if (curUserItem) {
        rankItemList = [curUserItem].concat(rankItemList);
      }
      let pro10 = rankItemList.map(item => {
        let pro = comp.createImage(item.avatarUrl);
        pro.then(data => {
          item.avatarSF = data;
        });
        return pro;
      });
      Promise.all(pro10).then(() => {
        let rankListNode = comp.node.getChildByName('rankList');
        let rankNodes = rankListNode.children;
        let selfNode = comp.node.getChildByName('self');
        selfNode.getChildByName('rank').getComponent(cc.Label).string = rankItemList[0].index;
        selfNode.getChildByName('nick').getComponent(cc.Label).string = rankItemList[0].nickname.substr(0, 6);
        selfNode.getChildByName('score').getComponent(cc.Label).string = `${rankItemList[0].score}关`;
        selfNode.getChildByName('time').getComponent(cc.Label).string = filterTime(rankItemList[0].time);
        selfNode.getChildByName('avatar').getComponent(cc.Sprite).spriteFrame = rankItemList[0].avatarSF;
        for (var i = 1; i < rankItemList.length; ++i) {
          var item = cc.instantiate(comp.rankItemPrefab);
          var data = rankItemList[i];
          if (rankNodes[i - 1]) {
            rankNodes[i - 1].getChildByName('rank').getComponent(cc.Label).string = data.index;
            rankNodes[i - 1].getChildByName('nick').getComponent(cc.Label).string = data.nickname.substr(0, 6);
            rankNodes[i - 1].getChildByName('score').getComponent(cc.Label).string = `${data.score}关`;
            rankNodes[i - 1].getChildByName('time').getComponent(cc.Label).string = filterTime(data.time);
            rankNodes[i - 1].getChildByName('avatar').getComponent(cc.Sprite).spriteFrame = data.avatarSF;
          } else {
            rankListNode.addChild(item);
            item.getComponent('ItemTemplate').init({
              index: data.index,
              avatarSF: data.avatarSF,
              nickName: data.nickname.substr(0, 6),
              score: `${data.score}关`,
              time: filterTime(data.time)
            });
            item.getChildByName('avatar').setContentSize(30, 30);
          }
        }
        comp.rendering = false;

        function filterTime (seconds) {
          return Math.floor(seconds/60) + '分' + seconds % 60 + '秒';
        }
      });
    });
  },

  createImage(avatarUrl) {
    return new Promise((resolve, reject) => {
      if (cc.sys.browserType === cc.sys.BROWSER_TYPE_WECHAT_GAME_SUB) {
        try {
          let image = wx.createImage();
          image.onload = () => {
            try {
              let texture = new cc.Texture2D();
              texture.initWithElement(image);
              texture.handleLoadedTexture();
              resolve(new cc.SpriteFrame(texture));
            } catch (e) {
              reject(e);
            }
          };
          image.src = avatarUrl;
        } catch (e) {
          reject(e);
        }
      }
    });
  },

  // update (dt) {},
});
