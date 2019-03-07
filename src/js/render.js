var gussFun = require('./gaussFun');
function render (data) {
    renderImg(data);
    renderInfo(data);
    blur(data);
    renderFav(data);
    renderAllTime(data.duration);
    isLike(data);
}
function renderImg(data) {
    $('.song-img').find('img').attr('src', data.image);
}
function renderInfo(data) {
    var str = ' <div class="song-name">\
    <h2>' + data.song +'</h2>\
</div>\
<div class="singer">' + data.singer +'</div>\
<div class="album">' + data.album +'</div>';
    $('.song-info').html(str);
}
function renderFav(data) {
    if (data.isLike) {
        $('.fav').addClass('liking');
    }
}
function timeFormat(t) {
    var minute = Math.floor(t / 60);
    var second = t - minute * 60;
    if (minute < 10) {
        minute = '0' + minute;
    }
    if (second < 10) {
        second = '0' + second;
    }
    return minute + ':' + second;
}
function renderCurTime(t) {
    var time = timeFormat(t);
    $('.cur-time').html(time);
}
function renderAllTime(t) {
    var time = timeFormat(t);
    $('.all-time').html(time);
}
function blur (data) {
    var img = new Image();
    img.src = data.image;
    img.onload = function () {
        var canvas = $('<canvas width="200" height="200"><canvas>');
        var ctx = canvas[0].getContext('2d');
        ctx.drawImage(img, 0, 0, 200, 200);
        var pixel = ctx.getImageData(0, 0, 200, 200);
        var srcData = gussFun(pixel);
        ctx.putImageData(srcData, 0, 0);
        var imgSrc = canvas[0].toDataURL();
        $('.wrapper').css({
            backgroundImage: 'url(' + imgSrc + ')'
        })
    }
}
function renderProcess(per) {
    var translateX = (per - 1) * 100;
    if (translateX < 0) {
        $('.pro-up').css({
            transform:'translateX(' + translateX + '%)'
        });
        //
        $('.pro-spot').css({
            left: per * 100 + '%',
        });
        var isMove = $('.pro-spot').offset().left - $('.process').offset().left < $('.process').width() - $('.pro-spot').width();
        // $('')
        if (!isMove) {
            $('.pro-spot').css({
                right: 0,
                left: $('.process').width() - $('.pro-spot').width()
            });
        }
       
    } else {
        $('.pro-up').css({
            transform: 'translateX(0)',
        })
    }
   
}
function isLike(data) {
    if (data.isLike) {
        $('.fav').addClass('liking');
    } else {
        $('.fav').removeClass('liking');
    }
}
function renderList (data) {
    var strAll = '';
    for (var i = 0; i < data.length; i++) {
        var str = '<div class="song"><div class="songName">' + data[i].song + '</div>\
    <div class="songSinger">' + data[i].singer +'</div>\
    <div class="songTime">' + timeFormat(data[i].duration) + '</div></div>'
        strAll += str;
    }
    $('.song-list').html(strAll);
}
module.exports = {
    render: render,
    renderAllTime: renderAllTime,
    renderCurTime: renderCurTime,
    renderProcess: renderProcess,
    isLike: isLike,
    renderList: renderList
};