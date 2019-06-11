//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
  },
  onclick:function(){
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success(res) {
        app.globalData.uploadData=res;
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths;
        wx.navigateTo({
          url: '/pages/scene/scene',
        })
      }
    })
 
  }
  })

