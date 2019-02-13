function MazeBuilder(col, row, start) {
    this.col = col;
    this.row = row;
    this.start = start;
    // this.end = end;
}
// 向下取整，生成随机数
MazeBuilder.prototype.random = function (k) {
    return Math.floor(Math.random() * k);
};


MazeBuilder.prototype.generate = function () {
    // 生成 2R+1 行 2R+1 列数组
    this.mazeDataArray = [];
    for (let i = 0; i < 2 * this.col + 1; i++) {
        let arr = [];
        for (let j = 0; j < 2 * this.row + 1; j++) {
            // 设置墙和初始格子
            if (i % 2 == 0 || j % 2 == 0) {
                arr.push({
                    value: 0,
                    x: j,
                    y: i
                });
            } else {
                arr.push({
                    value: 1,
                    isVisited: false,
                    x: j,
                    y: i
                });
            }
        }
        this.mazeDataArray[i] = arr;
    }
    // 选取左下点作为 currentNode
    let currentNode = this.mazeDataArray[this.start[0]][this.start[1]];
    currentNode.isVisited = true;
    currentNode.deep = 0;
    // 访问过的节点列表
    let visitedList = [];
    let trash = [];
    visitedList.push(currentNode);
    // 循环以下操作，直到所有的格子都被访问到。
    while (currentNode.isVisited) {
        // 得到当前访问格子的四周（上下左右）的格子
        let upNode = this.mazeDataArray[currentNode.y - 2] ? this.mazeDataArray[currentNode.y - 2][currentNode.x] : {isVisited: true};
        let rightNode = this.mazeDataArray[currentNode.x + 2] ? this.mazeDataArray[currentNode.y][currentNode.x + 2] : {isVisited: true};
        let downNode = this.mazeDataArray[currentNode.y + 2] ? this.mazeDataArray[currentNode.y + 2][currentNode.x] : {isVisited: true};
        let leftNode = this.mazeDataArray[currentNode.x - 2] ? this.mazeDataArray[currentNode.y][currentNode.x - 2] : {isVisited: true};

        let neighborArray = [];
        if (!upNode.isVisited) {
            neighborArray.push(upNode);
        }
        if (!rightNode.isVisited) {
            neighborArray.push(rightNode);
        }
        if (!downNode.isVisited) {
            neighborArray.push(downNode);
        }
        if (!leftNode.isVisited) {
            neighborArray.push(leftNode);
        }
        // 在这些格子中随机选择一个没有在访问列表中的格子，
        // 如果找到，则把该格子和当前访问的格子中间的墙打通(置为1)，
        if (neighborArray.length !== 0) { // 如果找到
            let neighborNode = neighborArray[this.random(neighborArray.length)];
            this.mazeDataArray[(neighborNode.y + currentNode.y) / 2][(neighborNode.x + currentNode.x) / 2].value = 1;
            neighborNode.isVisited = true;
            neighborNode.deep = currentNode.deep + 1;
            visitedList.push(neighborNode);
            currentNode = neighborNode;
        } else {
            // 把该格子作为当前访问的格子，并放入访问列表。
            // 如果周围所有的格子都已经访问过，则从已访问的列表中，随机选取一个作为当前访问的格子。
            currentNode = visitedList[this.random(visitedList.length)];
            if (!currentNode) {
                // visitedList为空时 跳出循环
                break;
            }
            currentNode.isVisited = true;
            // 从 visitedList 中删除随机出来的当前节点
            let tempArr = [];
            visitedList.forEach(item => {
                if (item !== currentNode) {
                    tempArr.push(item);
                }
            });
            visitedList = tempArr;
            trash.push(currentNode);
        }
    }
    // this.mazeDataArray[this.start[0]][this.start[1]]={
    //     x:this.start[0],
    //     y:this.start[1],
    //     value:1
    // };
    let deepestNode = trash[0];
    trash.forEach(node => {
        if (deepestNode.deep < node.deep) {
            deepestNode = node;
        }
    });
    this.deepestNode = deepestNode;
};


export default MazeBuilder;