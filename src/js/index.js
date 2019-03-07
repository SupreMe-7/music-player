require('../less/index.less');
var $ = require('zepto');
// 渲染模块
var render = require('./render');
// 音频播放标签
var audio = new Audio();
// 歌曲列表
var songList = [];
// 当前播放的歌曲的索引值
var index = 0;
// 当前播放的状态
var status = false;
// 当前播放的音乐详情
var curAudio = null;
// 每次重绘页面时触发的监听
var frameId = null;
// 设置音乐地址
function setSrc(src) {
    audio.src = src;
}
// 获取音乐列表数据
function getData() {
    $.ajax({
        url: '/mock/data.json',
        type: 'GET',
        success: function (data) {
            // 绑定点击事件和touch事件
            bindClickEvent();
            bindTouchEvent();
            bindOtherEvent();
            // 保存获取来的音乐列表
            songList = data;
            // 初始化渲染当前音乐
            $(document).trigger('play:change', 0);
        }
    })
}
getData();
// 绑定点击事件
function bindClickEvent() {
    // 自定义事件  用于手动触发 每次歌曲变化时触发该事件  传递一个参数当前要播放音乐的索引值
    $(document).on('play:change', function (event, index) {
        // 更新当前音乐地址
        setSrc(songList[index].audio);
        // 更新页面数据
        render.render(songList[index]);
        //渲染列表
        render.renderList(songList);
        // 默认是暂停状态时 图片不转动
        $('.song-pic').removeClass('rotate');
        // 判断当前是否为播放状态  
        if (status) {
            // 若是播放状态播放音乐 并且重新初始化进度条
            audio.play();
            // 让图片转动
            $('.song-pic').addClass('rotate');
            setProcess();
        }
        // 保存当前播放的音频信息
        curAudio = songList[index];
        // 渲染当前时间
        render.renderCurTime(0);
        // 渲染进度条
        render.renderProcess(0);
    })
    // 点击上一首
    $('.prev').click(function (e) {
        // 若当前索引值为0则上一首为列表中最后一首歌
        if (index == 0) {
            index = songList.length - 1;
        } else {
            // 否则索引值-1
            index --;
        }
        // 手动触发修改音乐事件   重新渲染页面
        $(document).trigger('play:change', index);
    });
    // 播放暂停按钮
    $('.play').click(function (e) {
        // 若当前为暂停状态 让音乐播放  否则点击该按钮让音乐停止
        if (audio.paused) {
            audio.play();
            // 当前播放状态变为true表示正在播放
            status = true;
            // 进度条渲染
            setProcess();
            // 改变按钮图标
            $(this).addClass('pause');
            $('.song-pic').addClass('rotate');
        } else {
            audio.pause();
            // 当前播放状态变为false表示暂停
            status = false;
            // 进度条不变  不用继续渲染进度条
            cancelAnimationFrame(frameId);
            // 改变按钮样式
            $(this).removeClass('pause');
            $('.song-pic').removeClass('rotate');
        }
    });
    // 点击下一曲
    $('.next').click(function (e) {
        // 判断该当前歌曲是否为列表中最后一条数据  若是将转为索引值为0的音乐即第一首
        if (index == songList.length - 1) {
            index = 0;
        } else {
            // 否则索引值+1
            index ++;
        }
        // 重新初始化音乐播放页面
        $(document).trigger('play:change', index);
        
    });
    //改变是否喜欢
    $('.fav').click(function (e) {
        songList[index].isLike = !songList[index].isLike;
        render.isLike(songList[index]);
        console.log('sss')
    }); 
    //播放曲目列表
    $('.list').click(function (e) {
        if ($(this).hasClass('playlist')) {
            $(this).removeClass('playlist');
            $('.song-list').css({
                display: 'none'
            })
        } else {
            $('.list').addClass('playlist');
            $('.song-list').css({
                display: 'inline-block'
            })
        }
    });
}
// 绑定进度条拖动时间
function bindTouchEvent() { 
    // 获取进度条距离文档最左端的距离  用来计算拖动的长度
    var offsetLeft = $('.process').offset().left;
    //  获取当前进度条的总长度
    var width = $('.process').width();
    // 开始拖动进度条时 进度条不按照原来的进度继续改变
    $('.pro-spot').on('touchstart', function () {
        console.log('start');
        // 清除重绘时对进度条的渲染
        cancelAnimationFrame(frameId);
    }).on('touchmove', function(e) {
        // 拖动过程中进度条需要跟随鼠标移动
        // x代表获取当前鼠标移动的距离 （相对于进度条总长度而言）
        var x = e.changedTouches[0].clientX - offsetLeft;
        // 计算当前拖拽进度条的百分比
        var ratio = x /  width;
        // 进度条渲染到相应的位置 ，当前播放时间发生变化
        jumpTo(ratio);
        // 阻止默认事件
        return false;
    }).on('touchend', function(e) {
        console.log('end', e);
       
    });
}
function bindOtherEvent() {
    $(audio).on('ended', function (e) {
        $('.next').trigger('click');
    })
}
// 按照比例获取当前播放时间
function getCurTime(ratio) {
    return Math.round(ratio * curAudio.duration)
}
// 进度条调到指定位置函数 接收参数为调到的百分比小数
function jumpTo(ratio) {
    // 按照百分比获取当前播放时间
    var curTime = getCurTime(ratio);
    // 将音频调到当前播放的时间
    audio.currentTime = curTime;
    // 渲染当前播放的时间
    render.renderCurTime(curTime);
    // 渲染进度条
    render.renderProcess(ratio);
    // 播放音乐 
    audio.play();
    //  当前播放状态转为true
    status = true;
    // 进度条监听
    setProcess();
    // 播放时让图片旋转
    $('.song-pic').addClass('rotate');
    // 修改播放按钮样式
    $('.play').addClass('pause');
}
// 获取当前播放的进度函数  用于渲染进度条
function getPlayRatio (){
    return audio.currentTime / curAudio.duration;
}
// 设置进度条监听变化函数 （也为进度条初始化函数 每次播放音乐时触发）
function setProcess() {
    cancelAnimationFrame(frameId);
    // 每次页面重绘时触发的监听 播放时时刻修改进度条的信息
    var frame = function () {
        // 获取播放进度
        var playRatio = getPlayRatio();
        // 获取进度条总长度
        var width = $('.process').width();
        // 渲染进度条
        render.renderProcess(playRatio);
        // 获取当前播放时间
        var curTime = Math.round(audio.currentTime);
        // 渲染当前播放时间
        render.renderCurTime(curTime);
        // 递归 每次页面重绘时触发当前函数
        frameId = requestAnimationFrame(frame);
    }
    frame()
}
