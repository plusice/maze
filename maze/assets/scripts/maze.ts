const {ccclass, property} = cc._decorator;

import MazeBuilder from './mazebuilder';
import  global from './global';

@ccclass
export default class NewClass extends cc.Component {
  private mazeArray:any[];
  private electricTimer:any = null;
  private chickTimer:any = null;

  @property(cc.Node)
  electricNode: cc.Node = null
  @property(cc.Prefab)
  mazeCrossPrefab: cc.Prefab = null
  @property(cc.Prefab)
  mazeLinePrefab: cc.Prefab = null
  @property(cc.Prefab)
  mazeTPrefab: cc.Prefab = null
  @property(cc.Prefab)
  mazeTurnPrefab: cc.Prefab = null
  @property(cc.Prefab)
  mazeShortPrefab: cc.Prefab = null
  @property(cc.Node)
  flag: cc.Node;
  @property(cc.Node)
  sprite: cc.Node;
  @property(Number)
  cubeWith:number =  36

  onLoad() {
    // 根据关卡改变迷宫通道宽度
    if (global.level <= global.maxLevel) {
      this.cubeWith = 36;
    } else {
      this.cubeWith = 33;
    }
    this.paintMaze();
    this.playElectricAndSound();
  }
  /**
   * MazeBuilder构建迷宫数组，画迷宫。1～7关逐步增加迷宫道路数目，8～14关缩小迷宫通道宽度，道路数目重新从最小到最大逐步增加，15～21类似
   */
  paintMaze() {
    // 根据关卡改变迷宫道路数目
    let roadNum =  global.level > global.maxLevel ? (global.maxLevel - 1 + 2) : (global.level - 1 + 2),
      startPoint = [1, 1],
      endPoint = [1,1];
    let maze = new MazeBuilder(roadNum, roadNum, startPoint);
    maze.generate();
    endPoint = [maze.deepestNode.y, maze.deepestNode.x];
    this.mazeArray = maze.mazeDataArray;
    let i = 0, j = 0;
    let iLen = this.mazeArray.length,
      jLen = this.mazeArray[0].length;
    let offsetI = iLen * this.cubeWith / 2 - this.cubeWith / 2,
      offsetJ = jLen * this.cubeWith / 3 - this.cubeWith / 2;
    for (i = 0; i < iLen; i++) {
      for (j = 0; j < this.mazeArray[i].length; j++) {
        // 如果value为0画墙
        if (this.mazeArray[i][j].value === 0) {
          var prefabType = this.getPrefabType(i, j, this.mazeArray);
          var prefab = undefined, rotation = undefined;
          switch(prefabType) {
          case 'vLine':
          prefab = this.mazeLinePrefab;
          break;
          case 'hLine':
          prefab = this.mazeLinePrefab;
          rotation = 90;
          break;
          case 'topT':
          prefab = this.mazeTPrefab;
          rotation = -90;
          break;
          case 'rightT':
          prefab = this.mazeTPrefab;
          break;
          case 'btmT':
          prefab = this.mazeTPrefab;
          rotation = 90;
          break;
          case 'leftT':
          prefab = this.mazeTPrefab;
          rotation = 180;
          break;
          case 'leftTopTurn':
          prefab = this.mazeTurnPrefab;
          rotation = 180;
          break;
          case 'topRightTurn':
          prefab = this.mazeTurnPrefab;
          rotation = -90;
          break;
          case 'rightBtmTurn':
          prefab = this.mazeTurnPrefab;
          break;
          case 'btmLeftTurn':
          prefab = this.mazeTurnPrefab;
          rotation = 90;
          break;
          case 'leftShort':
          prefab = this.mazeShortPrefab;
          rotation = 90;
          break;
          case 'topShort':
          prefab = this.mazeShortPrefab;
          rotation = 180;
          break;
          case 'rightShort':
          prefab = this.mazeShortPrefab;
          rotation = -90;
          break;
          case 'btmShort':
          prefab = this.mazeShortPrefab;
          break;
          case 'cross':
          prefab = this.mazeCrossPrefab;
          break;
          default:
          prefab = this.mazeLinePrefab;
          }
          // 使用给定的模板在场景中生成一个新节点
          let cube = cc.instantiate(prefab);
          // 将新增的节点添加到 Canvas 节点下面
          this.node.addChild(cube);
          if (rotation) {
          cube.setRotation(rotation);
          }
          cube.setPosition(cc.v2(i * this.cubeWith - offsetI, j * this.cubeWith - offsetJ));
        }
      }
    }
    this.flag.setPosition(cc.v2(endPoint[0] * this.cubeWith - offsetI, endPoint[1] * this.cubeWith - offsetJ));
    this.sprite.setPosition(cc.v2(startPoint[0] * this.cubeWith - offsetI, (startPoint[1]) * this.cubeWith - offsetJ));
  }
  /**
   * 获取坐标的墙的类型，可能是转角墙、十字墙、一面墙、半面墙
   * @param {number} x 坐标
   * @param {number} y 坐标
   * @param {Array} mazeArray 迷宫数组
   */
  getPrefabType (x, y, mazeArray) {
    if (x%2 == 1) {
      return 'hLine';
    }
    if (y%2 == 1) {
      return 'vLine';
    }

    // top有墙
    if (mazeArray[x][y+1] && mazeArray[x][y+1].value === 0) {
      // btm有墙
      if (mazeArray[x][y-1] && mazeArray[x][y-1].value === 0) {
      // left有墙
      if (mazeArray[x-1] && mazeArray[x-1][y] && mazeArray[x-1][y].value === 0) {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'cross';
        // right无墙
        } else {
        return 'leftT';
        }
      // left无墙
      } else {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'rightT';
        // right无墙
        } else {
        return 'vLine';
        }
      }
      // btm无墙
      } else {
      // left有墙
      if (mazeArray[x-1] && mazeArray[x-1][y] && mazeArray[x-1][y].value === 0) {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'topT';
        // right无墙
        } else {
        return 'leftTopTurn';
        }
      // left无墙
      } else {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'topRightTurn';
        // right无墙
        } else {
        return 'topShort';
        }
      }
      }
    // top无墙
    } else {
      // btm有墙
      if (mazeArray[x][y-1] && mazeArray[x][y-1].value === 0) {
      // left有墙
      if (mazeArray[x-1] && mazeArray[x-1][y] && mazeArray[x-1][y].value === 0) {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'btmT';
        // right无墙
        } else {
        return 'btmLeftTurn';
        }
      // left无墙
      } else {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'rightBtmTurn';
        // right无墙
        } else {
        return 'btmShort';
        }
      }
      // btm无墙
      } else {
      // left有墙
      if (mazeArray[x-1] && mazeArray[x-1][y] && mazeArray[x-1][y].value === 0) {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'hLine';
        // right无墙
        } else {
        return 'leftShort';
        }
      // left无墙
      } else {
        // right有墙
        if (mazeArray[x+1] && mazeArray[x+1][y] && mazeArray[x+1][y].value === 0) {
        return 'rightShort';
        // right无墙
        } else {
        return 'hLine';
        }
      }
      }
    }
  }
  /**
   * 播放闪电和声音
   */
  playElectricAndSound () {
    // 保存迷宫的墙点
    let wallPoints = [];
    let iLen = this.mazeArray.length,
      jLen = this.mazeArray[0].length;
    let offsetI = iLen * this.cubeWith / 2 - this.cubeWith / 2,
      offsetJ = jLen * this.cubeWith / 3 - this.cubeWith / 2;
    for (let i = 0; i < iLen; i++) {
      for (let j = 0; j < this.mazeArray[i].length; j++) {
      if (this.mazeArray[i][j].value === 0) {
        wallPoints.push({
        x: i,
        y: j
        });
      }
      }
    }

    // 加载音效
    let electricAudio, chickAudio;
    if (global.cos_env === 'wx') {
      electricAudio =  wx.createInnerAudioContext();
      electricAudio.src = cc.url.raw('resources/audio/electric.mp3');
      chickAudio =  wx.createInnerAudioContext();
      chickAudio.src = cc.url.raw('resources/audio/chick.mp3');
    }

    let wallLen = wallPoints.length;
    let anim = this.electricNode.getComponent(cc.Animation);

    play.call(this);
    playChickSound.call(this);
    // 随机时间在某个墙点出现闪电
    function play() {
      let wallPoint = wallPoints[Math.floor(Math.random() * wallLen)];
      this.electricNode.setPosition(cc.v2(wallPoint.x * this.cubeWith - offsetI, wallPoint.y * this.cubeWith - offsetJ));
      this.electricNode.setRotation(90 * Math.floor(Math.random() * 4));
      this.electricNode.setScale([1,1.5][Math.floor(Math.random() * 2)]);
      anim.play();

      // var audio = document.createElement('audio');
      // audio.src = cc.url.raw('resources/audio/electric.mp3');
      // audio.play();
      electricAudio && electricAudio.play();

      this.electricTimer = setTimeout(() => {
      play.call(this);
      }, [Math.random() * 3000 + 300, 4000][Math.floor(Math.random() * 2)]);
    }
    // 随机时间小鸡叫
    function playChickSound() {
      // var audio = document.createElement('audio');
      // audio.src = cc.url.raw('resources/audio/chick.mp3');
      // audio.play();
      chickAudio && chickAudio.play();

      this.chickTimer = setTimeout(() => {
      playChickSound.call(this);
      }, [Math.random() * 3000 + 2000, 5000][Math.floor(Math.random() * 2)]);
    }
    }

    clearElectricAndSound () {
    clearTimeout(this.electricTimer);
    clearTimeout(this.chickTimer);
    return this;
  }

  start () {

  }

  onDestroy () {
    clearTimeout(this.electricTimer);
    this.electricTimer = null;
  }
}
