var count=$('.swiper-slide.page').length;
var inited = false;
var playerMap = {};

var mySwiper = new Swiper('#page-content',{
    mousewheelControl : true,
    virtual: {
        slides: (function () {
            var slides = [];
            var htmls=$($("#htmls").html()).clone()
            htmls.find('.swiper-slide.page').each(function () {
                slides.push($(this).html())
            })

            return slides;
        }()),
    },
    direction : 'vertical',
    lazy: {
        loadPrevNext: true,
    },
    on: {
        slideChangeTransitionEnd: function(){
            console.log(count,this.activeIndex)
            if(count==this.activeIndex+1){
                $(".arrow-down").hide()
            }else {
                $(".arrow-down").show()
            }

            var banner = $("#page-content .swiper-wrapper .swiper-slide[data-swiper-slide-index=" + this.activeIndex + "]").find(".banner")

            if(banner.length > 0) {
                if(!$(banner[0]).data("sub-inited")) {
                    initBanner(banner[0])
                }
            }

            if(this.activeIndex + 1 < count) {
                checkVideo(this.activeIndex + 1)
            }

        },
        slideChange: function() {
            if(this.activeIndex - 1 >= 0) {
                //pre
                var page = $("#page-content .swiper-wrapper .swiper-slide[data-swiper-slide-index=" + (this.activeIndex - 1) + "]");
                checkAndPauseVideo(page);
            }

            if(this.activeIndex + 1 < count) {
                //next
                var page = $("#page-content .swiper-wrapper .swiper-slide[data-swiper-slide-index=" + (this.activeIndex + 1) + "]");
                checkAndPauseVideo(page);
            }

            playCurrentVideo(this.activeIndex)
        },
        init: function(){
            count= this.virtual.slides.length;
            initDOM()
            playCurrentVideo(0)
        }
    },

});

var idx = 0;

function initDOM() {
    //初始化视频
    if($(".video-module").length>0){
        $(".video-module").each(function () {
            initVideo(this);
        })
    }
}

function playCurrentVideo(index) {
    var video = $("#page-content .swiper-wrapper .swiper-slide[data-swiper-slide-index=" + index + "]").find(".video-module");
    if(video.length > 0) {
        if($(video[0]).data("sub-inited")) {
            var playerId = "J_prismPlayer" + index;
            var player = playerMap[playerId];
            player.play();
        }
    }
}

function checkVideo(index) {
    var video = $("#page-content .swiper-wrapper .swiper-slide[data-swiper-slide-index=" + index + "]").find(".video-module")
    if(video.length > 0) {
        if(!$(video[0]).data("sub-inited")) {
            initVideo(video[0]);
        }
    }
}

function initVideo(video) {
    var $item = $(video);
    var src = $item.attr('data-url');
    var id = $item.attr('id');
    console.log(src, id);
    if(src) {
        setVideo(id, src);
        $item.data("sub-inited", "1")
    }
}

function initBanner(banner) {
    var mySwiperBanner = new Swiper($(banner), {
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        on: {
            init: function() {
                console.log("init sub swiper: " + idx++);
            }
        }
    })
    mySwiperBanner.init();
    $(banner).data("sub-inited", "1")
}

function checkAndPauseVideo(page) {
    if(page.find("div[id^='J_prismPlayer']").length > 0) {
        var playerItem = page.find("div[id^='J_prismPlayer']")[0];
        var playerId = $(playerItem).attr("id");
        var player = playerMap[playerId];
        // console.log(playerId, "isPlaying=" + player.getStatus());
        if(player.getStatus() == 'playing') {
            player.pause();
            console.log(playerId, "pause player")
        }
    }
}


function setVideo(id,url) {
    console.log("setVide: ", id);
    var aliplayer = new Aliplayer({
            "id": id,
            "source": url,
            "width": "100%",
            "height": "100%",
            "autoplay": false,
            "isLive": false,
            "rePlay": false,
            "playsinline": true,
            "preload": true,
            "controlBarVisibility": "hover",// 视频设置面板怎么显示 always永久显示  click点击显示 hover鼠标移动上去显示
            "useH5Prism": true,
            "skinLayout": [
                {name: "bigPlayButton", align: "cc"},
                {
                    "name": "H5Loading",
                    "align": "cc"
                },
                {
                    "name": "errorDisplay",
                    "align": "tlabs",
                    "x": 0,
                    "y": 0
                },
                {
                    "name": "infoDisplay"
                },
                {
                    "name": "tooltip",
                    "align": "blabs",
                    "x": 0,
                    "y": 56
                },
                {
                    "name": "thumbnail"
                },
                {
                    "name": "controlBar",
                    "align": "blabs",
                    "x": 0,
                    "y": 0,
                    "children": [
                        {
                            "name": "progress",
                            "align": "blabs",
                            "x": 0,
                            "y": 44
                        },
                        {
                            "name": "playButton",
                            "align": "tl",
                            "x": 15,
                            "y": 12
                        },
                        {
                            "name": "timeDisplay",
                            "align": "tl",
                            "x": 10,
                            "y": 7
                        },
                        {
                            "name": "volume",
                            "align": "tr",
                            "x": 5,
                            "y": 10
                        }
                    ]
                }
            ]
        }, function (player) {
            console.log("The player is created");
        },
    );
    var _video = $("#" + id).find('video')[0];
    aliplayer.on('play', function (e) {
        _video.removeEventListener('click', play);
        _video.addEventListener('click', pause);
    });
    aliplayer.on('pause', function (e) {
        _video.removeEventListener('click', pause);
        _video.addEventListener('click', play)
    });
    function play() {
        if (aliplayer) aliplayer.play();
    }

    function pause() {
        if (aliplayer) aliplayer.pause();
    }

    playerMap[id] = aliplayer
}