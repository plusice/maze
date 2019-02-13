const {ccclass, property} = cc._decorator;

class UserData {
  public avatarUrl: string;
  public nickname: string;
  public openid: string;
  public KVDataList: any[];
}

class RankItem extends cc.Component {
  @property(Number)
  index: number = 1;

  @property(cc.SpriteFrame)
  avatarSF: cc.SpriteFrame;

  @property(String)
  nickname: string = '';

  @property(String)
  openid: string = '';

  @property(Number)
  score: number = 0;

  @property(Number)
  time: number = 0;
}

@ccclass
export default class NewClass extends cc.Component {

  @property([RankItem])
  rankItemList: RankItem[] = [];

  @property(cc.Prefab)
  rankItemPrefab: cc.Prefab;

  @property(cc.SpriteFrame)
  avatarFrame: cc.SpriteFrame;

  private rendering: boolean = false;
  private dataList: any[] = [];
  private friendDataList: UserData[] = [{
    avatarUrl: '',
    nickname: '',
    openid: '',
    KVDataList: [{
      key: 'level',
      value: '{"wxgame": {"score":16,"update_time": 1513080573}}'
    }]
  }];
  private userGameData: any = {};

  onLoad () {
    wx.onMessage(data => {
      if (data.fromEngine) {
        return;
      }
      if (data.score) {
        // 更新分数
        this.setSelfScore(data.score, data.time).then(() => {
          this.updateRank(data.shareTicket);
        });
      } else {
        // 更新排行榜
        this.updateRank(data.shareTicket);
      }
    })
  }

  start () {

  }

  /**
   * 更新自己的分数，需要先获取旧的分数进行对比
   * @param {*} score
   * @param {*} time
   */
  setSelfScore (score:number, time:number):Promise<void> {
    return new Promise((resolve, reject)=> {
      wx.getUserCloudStorage({
        keyList: ['level'],
        success (res) {
          if (res.KVDataList && res.KVDataList[0]) {
            try {
              let oldData = JSON.parse(res.KVDataList[0].value);
              let oldScore = oldData.wxgame.score;
              let oldTime = oldData.time || oldData.wxgame.time;
              if (score > oldScore || (score == oldScore && oldTime > time)) {
                wx.setUserCloudStorage({
                  KVDataList: [{
                    key: 'level',
                    value: JSON.stringify({
                      wxgame: {
                        score: score,
                        update_time: new Date().getTime()
                      },
                      time: time,
                      randomCode: Math.random()
                    })
                  }],
                  complete () {
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            } catch (err) {
              reject(err);
            }
          } else {
            wx.setUserCloudStorage({
              KVDataList: [{
                key: 'level',
                value: JSON.stringify({
                  wxgame: {
                    score: score,
                    update_time: new Date().getTime()
                  },
                  time: time,
                  randomCode: Math.random()
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
                  update_time: new Date().getTime()
                },
                time: time,
                randomCode: Math.random()
              })
            }],
            complete () {
              resolve();
            }
          });
        }
      });
    });
  }

  /**
   *
   * @param {*} shareTicket 群排行需要的ticket，如果是undefined，则更新好友排行
   */
  updateRank (shareTicket:string|undefined) {
    if (this.rendering) {
      return false;
    }
    // 删除旧的节点
    this.node.getChildByName('rankList').children.forEach(node => {
      node.destroy();
    });
    this.node.getChildByName('self').active = false;
    this.node.getChildByName('loading').active = true;

    // 修改title
    if (shareTicket) {
      this.node.getChildByName('title').getComponent(cc.Label).string = '群排行榜';
    } else {
      this.node.getChildByName('title').getComponent(cc.Label).string = '好友排行榜';
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
    this.userGameData = {};
    let proOthers = null;
    if (shareTicket) {
      proOthers = new Promise(function(resolve){
        wx.getGroupCloudStorage({
          shareTicket: shareTicket,
          keyList: ['level'],
          success (res) {
            if (res.data) {
              comp.friendDataList = res.data;
              resolve();
            }
          }
        });
      });
    } else {
      proOthers = new Promise(function(resolve){
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
    }
    let proMe = new Promise(function(resolve){
      wx.getUserCloudStorage({
        keyList: ['level'],
        success (res) {
          if (res.KVDataList) {
            let KVDataList = res.KVDataList;
            if (KVDataList && KVDataList[0] && KVDataList[0].value) {
              comp.userGameData = JSON.parse(KVDataList[0].value);
            }
            resolve();
          }
        }
      });
    });
    Promise.all([proOthers, proMe]).then(() => {
      comp.dataList = comp.friendDataList;
      comp.dataList.forEach(item => {
        if (item.KVDataList && item.KVDataList[0] && item.KVDataList[0].value) {
          try {
            let itemGameData = JSON.parse(item.KVDataList[0].value);
            item.score = itemGameData.wxgame.score;
            item.update_time = itemGameData.wxgame.update_time;
            item.time = (itemGameData.time === undefined ? itemGameData.wxgame.time : itemGameData.time);
            item.randomCode = (itemGameData.randomCode === undefined ? itemGameData.wxgame.randomCode : itemGameData.randomCode);
          } catch (err) {
            item.score = 1;
            item.time = 0;
          }
        } else {
          item.score = 1;
          item.time = 0;
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
      let userGameData = {
        score: comp.userGameData.wxgame.score,
        update_time: comp.userGameData.wxgame.update_time,
        randomCode: comp.userGameData.randomCode === undefined ? comp.userGameData.wxgame.randomCode : comp.userGameData.randomCode,
        time: comp.userGameData.time === undefined ? comp.userGameData.wxgame.time : comp.userGameData.time
      };
      let curUserItem = null;
      comp.dataList.forEach((item, index) => {
        item.index = index + 1;
        if (userGameData.score === item.score && userGameData.time === item.time && item.update_time === userGameData.update_time && item.randomCode === userGameData.randomCode) {
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
        let selfNode = comp.node.getChildByName('self');

        // rankNodes.forEach(node => {
        //   node.destroy();
        // });
        comp.node.getChildByName('loading').active = false;
        selfNode.active = true;
        selfNode.getComponent('ItemTemplate').init({
          index: rankItemList[0].index,
          avatarSF: rankItemList[0].avatarSF,
          nickName: rankItemList[0].nickname.substr(0, 6),
          score: `${rankItemList[0].score}关`,
          time: filterTime(rankItemList[0].time)
        });
        for (var i = 1; i < rankItemList.length; ++i) {
          var item = cc.instantiate(comp.rankItemPrefab);
          var data = rankItemList[i];
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
        // 如果数量比原来少，则删除多余节点
        // for (var j = rankItemList.length - 1; j < rankNodes.length; j++) {
        //   rankNodes[j].destroy();
        // }
        comp.rendering = false;

        function filterTime (seconds) {
          return Math.floor(seconds/60) + '分' + seconds % 60 + '秒';
        }
      });
    });
  }

  createImage (avatarUrl:string) {
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
  }


  // update (dt) {}
}
