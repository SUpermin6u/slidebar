/*
--------------------------------------slideBar滑动杆插件-------------------------------
update:改为同时存在两个滑块的情况
by szm ,  2016.8.9
-------------
author:ddd
date:2013.11.14
ver:1.1
describe:zepto,jquery通用
--------------------------------------------------------------------------------------
*/
(function($) {
    "use strict";
    var defalutOpt = {
        max: 100, //最大值
        min: 0, //最小值
        crossC: "#ddd", //划过区域的颜色
        bgC:"blue",     //背景颜色
        handlerC: "#777", //滑块的颜色
        defaultNum: [0,100], //滑动点默认值
        decimal: 0, //保留几位小数
        callBack: function(v) { //滑动时的执行函数
            //console.log(value);
        },
        endCb:function(v){//滑动结束时的执行函数

        }
    }
    $.fn.slideBar = function(option) {
        var opt = $.extend({}, defalutOpt, option);
        return this.each(function(e) {
            var $this = $(this); //当前对象
            var value = opt.defalutNum; //当前滑动条对应的数值
            var thisX = $this.offset().left; //当前元素相对文档的X坐标
            var thisW = $this.width(); //~~元素的宽度
            var handler = $this.find(".handler"); //拉(滑)杆
            var handlerW = handler.eq(0).width(); //拉(滑)杆的宽度
            var thisText = $("*[name='" + $this.attr("data-cell") + "']"); //数值容器
            var sliderW = thisW - handler.width(); //滑动宽度，（注意：与~~元素的宽度不一样）
            var cross = $this.find(".cross"); //滑过区域

            init(); //初始化
            if (!isMobile()) { //for pc
                /*拉(滑)杆元素点击之后，isSlider变true,然后开始活动-start--*/
                handler.mousedown(function(evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    $this.isSlider = true;
                    var that = $(this);
                    var index = that.index();
                    /*对文档绑定mousemove事件，滑动就是在该阶段发生*/
                    $(document).on("mousemove", function(e) {
                        var cursor = e.pageX;
                        handle(that,cursor);
                    });
                });
                /*拉(滑)杆元素点击之后，isSlider变true,然后开始活动-end--*/
                /*鼠标松开后注销document的mousemove事件*/
                $(document).mouseup(function(e) {
                    $(document).off("mousemove");
                    opt.endCb(value);
                });
            } else { //for mobile
                var handlerInitX = 0;
                handler.each(function(i,el){
                    var that = $(this);
                    el.addEventListener('touchstart', function(event) {
                        event.preventDefault();
                        $this.isSlider = true;
                    }, false);
                    el.addEventListener('touchend', function(event) {
                        event.preventDefault();
                        $this.isSlider = false;
                        opt.endCb(value);
                    }, false);
                    el.addEventListener('touchmove', function(event) {
                        event.preventDefault();
                        if (!$this.isSlider) {
                            return;
                        }
                        var cursor = event.targetTouches[0].pageX;
                        handle(that,cursor);
                    }, false);
                })
                
            }
            //初始化函数
            function init() {
                $this.isSlider = false; //boolean值，是否要开始滑动,默认falses
                $this.css('backgroundColor',opt.bgC)
                thisText.on('change', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var that = $(this);
                    value = that.val();
                    handler.eq(that.index()).css({
                        left: ([(value - opt.min) / (opt.max - opt.min)] * sliderW) + "px",
                        backgroundColor: opt.handlerC,
                        zIndex:1
                    });
                    cross.css({
                        backgroundColor: opt.crossC,
                        width: handler.eq(1).css('left'),
                        left: handler.eq(0).css('left'),
                        position: 'absolute',
                        zIndex: 0
                    });
                    opt.callBack(value);

                });
                thisText.each(function(i) {
                    $(this).val(opt.defaultNum[i]).trigger('change');
                });
            }

            function isMobile() { //是否为移动终端
                var u = navigator.userAgent;
                if (u.match(/AppleWebKit.*Mobile.*/)) {
                    return true;
                } else {
                    return false;
                }
            }

            //具体的滑块处理方法
            function handle($el,cursor,leftValue,rightValue){
                var index = $el.index();
                var leftValue = parseInt(handler.eq(0).css('left'));
                var rightValue = parseInt(handler.eq(1).css('left'));
                if(index == 0){
                    if (cursor <= thisX) {
                        $el.css({
                            left: 0
                        });
                    } else if(cursor >= rightValue + thisX - handlerW){
                        $el.css({
                            left: rightValue - handlerW + "px"
                        });
                    } else{
                        $el.css({
                            left: (cursor - thisX) + "px"
                        });
                    }
                }
                if(index == 1){
                    if(cursor <= leftValue + thisX + handlerW){
                        $el.css({
                            left: leftValue + handlerW + "px"
                        });
                    }
                    else if (cursor >= (thisX + thisW - handlerW)) {
                        $el.css({
                            left: thisW - handlerW + "px"
                        });
                    } else{
                        $el.css({
                            left: (cursor - thisX) + "px"
                        });
                    }
                }
                value = (parseFloat($el.position().left / sliderW) * (opt.max - opt.min) + opt.min).toString();
                if (value.indexOf(".") > 0 || opt.decimal > 0) {
                    value = value.substr(0, value.indexOf(".") + opt.decimal);
                    if (value < 0) {
                        value = 0
                    }
                }
                //window.slideVal=value;//输出给全局变量
                thisText.eq(index).val(value);
                cross.css({
                    width: rightValue-leftValue,
                    left: leftValue+handlerW/2
                });
                opt.callBack(value);
            }
        });
    }
})(typeof(Zepto) != 'undefined' ? Zepto : jQuery);
