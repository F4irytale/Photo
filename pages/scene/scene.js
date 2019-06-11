// pages/scene/scene.js
var app = getApp();
var cfg = {
  photo: {},
  template: {},
  scale: 1,
  endTime:{},
};
var SCALE = {
  MIN: 0.1,
  MAX: 2,
}

Page({
  data: {
    templates: [{
      cover: '../../img/sy/bili1.png'
    }, {
      cover: "../../img/sy/mi6.png"
    }, {
      cover: "../../img/sy/hp10.png"
    }, {
      cover: "../../img/sy/hpm9.png"
    }, {
      cover: "../../img/sy/mi5.png"
    }, {
      cover: "../../img/sy/yy8.png"
    }],
    currentNewScene: 0,
    canvasWidth: 0,
    canvasHeight: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setCanvasSize();
  },
  setCanvasSize: function () {
    var that = this;
    var uploadData = app.globalData.uploadData;
    var templates = this.data.templates;
    wx.createSelectorQuery().select('#sceneeditor')
      .boundingClientRect(function (canvasWrapper) {
        console.log(canvasWrapper)
        cfg.canvasWrapper = canvasWrapper;

        wx.getImageInfo({
          src: uploadData.tempFilePaths[0],
          success(res) {
            console.log(res);
            cfg.photo.path = res.path;
            var originalHeight = cfg.photo.originalHeight = res.height;
            var originalWidth = cfg.photo.originalWidth = res.width;

            if (originalHeight / originalWidth > canvasWrapper.height / canvasWrapper.width) {
              cfg.canvasHeight = canvasWrapper.height;
              cfg.canvasWidth = originalWidth * cfg.canvasHeight / originalHeight;
            } else {
              cfg.canvasWidth = canvasWrapper.width;
              cfg.canvasHeight = originalHeight * cfg.canvasWidth / originalWidth;
            }
            that.setData({
              canvasWidth: cfg.canvasWidth,
              canvasHeight: cfg.canvasHeight,
            }),
              that.drawNewSence(that.data.currentNewScene);
          }
        })
      }).exec()
  },
  drawNewSence: function (index) {
    var uploadData = app.globalData.uploadData;

    var templates = this.data.templates;
    const ctx = wx.createCanvasContext("scene");

    wx.getImageInfo({
      src: templates[index].cover,
      success(res) {
        var width = cfg.template.originalWidth = res.width;
        var height = cfg.template.originalHeight = res.height;
        cfg.template.x = 10;
        cfg.template.y = 0;
        cfg.template.cover = templates[index].cover;

        ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
        ctx.drawImage(templates[index].cover, 10, 0, 100, 100 * height / width);
        ctx.draw();

      }
    })


  },

  startmove: function (event) {
    var touchpoint = event.touches[0];
    var x = cfg.template.x;
    var y = cfg.template.y;
    cfg.offsetx = touchpoint.clientX - x;
    cfg.offsety = touchpoint.clientY - y;

  },
  ontouch: function (event) {
    var index = event.currentTarget.dataset.index;
    this.setData({
      currentNewScene: index
    })
    this.drawNewSence(index);
  },
  ontouchstart: function (event) {
    console.log(event)

    if (event.touches.length > 1) {
      this.startzoom(event);
    } else {
      this.startmove(event);
    }


  },
  move: function (event) {
    var touchpoint = event.touches[0];
    var uploadData = app.globalData.uploadData;
    // var width = cfg.template.originalWidth;
    // var height = cfg.template.originalHeight;
    var x = touchpoint.clientX - cfg.offsetx;
    var y = touchpoint.clientY - cfg.offsety;
    const ctx = wx.createCanvasContext("scene");
    cfg.template.x = x;
    cfg.template.y = y;
    var newWidth = 100 * cfg.scale;
    var newHeight = newWidth *cfg.template.originalHeight / cfg.template.originalWidth;
    ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    ctx.drawImage(cfg.template.cover, x, y, newWidth, newHeight);
    ctx.draw();
  },
  downloadpic:function(){
    var canvasWidth = cfg.canvasWidth;
    var canvasHeight = cfg.canvasHeight;
wx.canvasToTempFilePath({
  width: canvasWidth,
  height: canvasHeight,
  destHeight: canvasHeight * 2,
    destWidth:canvasWidth * 2,
  canvasId: 'scene',
  success:function(res){
    wx.saveImageToPhotosAlbum({
      filePath: res.tempFilePath,
      success:function(res){
        wx.showToast({
          title: '保存成功',
        });
      }
    })
  }
}, )
  },
  ontouchmove: function (event) {
    console.log(event);
    if (event.touches.length > 1) {
      this.zoom(event);
    } else {
if(new Date().getTime() - cfg.endTime<600){
  return;
}
      this.move(event);
    }
  },
  ontouchend:function(){
    const date = new Date();
    cfg.endTime = date.getTime();
  },
  startzoom: function (event) {
    var xmove = event.touches[1].clientX - event.touches[0].clientX;
    var ymove = event.touches[1].clientY - event.touches[0].clientY;
    cfg.initialdistance = Math.sqrt(xmove * xmove + ymove * ymove);

  },
  zoom: function (event) {
    var xmove = event.touches[1].clientX - event.touches[0].clientX;
    var ymove = event.touches[1].clientY - event.touches[0].clientY;
    cfg.curdistance = Math.sqrt(xmove * xmove + ymove * ymove);
    cfg.scale = Math.min(cfg.scale + 0.001 * (cfg.curdistance - cfg.initialdistance), SCALE.MAX);
    cfg.scale = Math.max(cfg.scale, SCALE.MIN);

    var uploadData = app.globalData.uploadData;
    const ctx = wx.createCanvasContext("scene");
    var template = cfg.template;
    var newWidth = 100 * cfg.scale;
    var newHeight = newWidth * template.originalHeight / template.originalWidth;
    ctx.drawImage(uploadData.tempFilePaths[0], 0, 0, cfg.canvasWidth, cfg.canvasHeight);
    ctx.drawImage(cfg.template.cover, template.x, template.y, newWidth, newHeight);
    ctx.draw();

  }
})