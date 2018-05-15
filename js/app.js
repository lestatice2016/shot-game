var container = document.getElementById('game');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var Score = document.querySelector('.score');
const NUM = 7; //怪兽个数
var enemys = [];//实际怪兽数
var bullets = [];//实际子弹数
var score = 0;
var plane = new Plane();//唯一的飞机对象
var frame =0;

/**
 * 整个游戏对象
 */
var GAME = {
  init: function(opts) {
    this.status = 'start';
    this.bindEvent();
  },
  bindEvent: function() {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    var replayBtns = document.querySelectorAll('.js-replay');
    // 开始游戏按钮绑定
    playBtn.onclick = function() {
      self.play();
    };
    // 重新开始按钮绑定
      replayBtns.forEach(function (item,index) {
          item.onclick = function () {
              clear();
              enemys.splice(0,enemys.length);
              bullets.splice(0,bullets.length);
              score = 0;
              frame = 0;
              self.play();
          }
      });
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function(status) {
    this.status = status;
    container.setAttribute("data-status", status);
  },
  play: function() {
    this.setStatus('playing');
    plane.draw();
    plane.listen();
    initEnemys();
    drawScore();
  }
};
/**
 *  飞机对象
 */
function Plane(){
  this.x = 320;
  this.y = 470;
  this.width = 60;
  this.height = 100;
}
Plane.prototype.move = function(keycode){
   if (!keycode) return;
   var self = this;
   switch (keycode){
       //左移
       case 37 : {
          if (self.x > 30) {
              self.clear();
              self.x -=10;
              self.draw();
          }
       }
       break;
       case 38 :{
         var a = new Bullet(self.x+self.width/2,self.y-5);
         a.initBullet();
         bullets.push(a);
         conflictCheck();
       }
       break;
       //右移
       case 39 : {
           if (self.x < 610){
            //不是因为先清除后更新引起的卡顿
               self.clear();
               self.x +=10;
               self.draw();
           }
       }
       break;
   }
}
Plane.prototype.draw = function (){
  var self = this;
  var image =new Image();
    image.src = 'img/plane.png';
    //加载图像
    drawImage(image,self);
}
/**
 * 键盘监听
 */
Plane.prototype.listen = function(){
  var self = this;
  document.addEventListener('keydown',function(event){
      var keycode = event.keyCode || event.charCode || event.which;
      self.move(keycode);
  });
}
Plane.prototype.clear = function(){
  var self = this;
  context.clearRect(self.x,self.y,self.width,self.height);
}
/**
 * 初始化子弹
 */
var animId;
function Bullet(x,y){
  this.x = x;
  this.y = y;
}
Bullet.prototype.initBullet=function(){
    this.drawBullet();
    this.animBullet();
}
Bullet.prototype.drawBullet=function(){
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = '#fff';
    context.moveTo(this.x,this.y);
    context.lineTo(this.x,this.y-10);
    context.stroke();
}
Bullet.prototype.move = function(){
  if(this.y <0) {
      // cancelAnimationFrame(animId);
      return;
  }
  //移动前的y坐标保存,方便后面清除
  this.clearY = this.y;
  this.y -=10;
}
Bullet.prototype.animBullet = function(){
  //加判断条件,取消循环,提升性能
   if (this.y >0) {
       this.move();
       //局部重绘
       context.clearRect(this.x - 10, this.clearY - 10, 30, 10);
       this.drawBullet();
       animId = requestAnimationFrame(this.animBullet.bind(this));
   }
}
/**
 *初始化怪兽
 */
function Enemy(x,y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height =50;
    this.status = 'live';
    this.direction ='right';
}
Enemy.prototype.draw = function(){
  var self = this;
  var image = new Image();
  if (this.status === 'live')
  {
    image.src = 'img/enemy.png';
  }else{
    frame++;
    image.src = 'img/boom.png';
    if (frame === 3){
      frame = 0;
      enemys.splice(self.delIdex,1);
      //重新绘制分数
      score++;
      clearScore();
      drawScore();

    }
  }
    drawImage(image,self);
}
/**
 * 构造一行怪兽
 */
var idEnemy;
function initEnemys(){
    var x =30;
    var y =30;
    for(var i =0;i<NUM;i++){
       var obj = new Enemy(x,y);
       enemys.push(obj);
       x +=60;
    }
    drawEnemys();
    animEnemys();
}
function drawEnemys() {
    enemys.forEach(function(item,index){
        item.draw();
    });
}
//将一行怪兽作为一个整体来移动
function moveEnemys(){
   var len = enemys.length;
   if (enemys[len-1].direction === 'right'){
     if (enemys[len-1].x <620){
         enemys.forEach(function(item,index){
             item.x +=2;
         });
     }else {
         enemys.forEach(function (item,index) {
             item.direction = 'left';
             item.y +=50;
         });
     }
   }else if(enemys[0].direction === 'left'){
     if (enemys[0].x >32){
         enemys.forEach(function(item,index){
             item.x -=2;
         });
     }else {
         enemys.forEach(function (item,index) {
             item.direction = 'right';
             item.y +=50;
         });
     }
   }
}
function animEnemys() {
    if (enemys[0] && enemys[0].y <= 420)
    {
        moveEnemys();
        context.clearRect(30, 30, 670, 440);
        drawEnemys();
        idEnemy = requestAnimationFrame(animEnemys);
    }else if(enemys[0]){
        clear();
        GAME.setStatus('failed');
        Score.innerHTML =''+score;
    }else {
        clear();
        GAME.setStatus('all-success');
    }
}
/**
 * 碰撞检测
 */
function conflictCheck(){
  for(var i=0;i<bullets.length;i++)
    for(var j=0;j<enemys.length;j++){
         if (!(bullets[i].x < enemys[j].x)&& !(enemys[j].x+enemys[j].width < bullets[i].x)
         && !(bullets[i].y < enemys[j].y)&& !(bullets[i].y-10 > enemys[j].y+enemys[j].height)){
                 //子弹与怪兽相撞了
                 enemys[j].status = 'dead';
                 //保存怪兽在数组中的index,在draw()中方便删除
                 enemys[j].delIdex = j;
                 //子弹y坐标设为<0,使其停止重绘
                 bullets[i].y = -1;
         }
    }
    requestAnimationFrame(conflictCheck);
}
function drawScore() {
    context.fillStyle = '#fff';
    context.font = '18px arial';
    context.fillText('分数 : '+score,20,20);
}
function clearScore() {
    context.clearRect(0,0,700,30);
}

/**
 * 加载图像,判断是否已经有了图片的缓存,来减少加载
 */
function drawImage(image,obj){
    if(image.width || image.complete){
          context.drawImage(image,obj.x,obj.y,obj.width,obj.height);
    }else {
        image.onload = function(){
          context.drawImage(image,obj.x,obj.y,obj.width,obj.height);
        }
    }
}

/**
 * 全局下的画布清除
 */
function clear(){
  context.clearRect(0,0,canvas.width,canvas.height);
}

// 初始化
GAME.init();
