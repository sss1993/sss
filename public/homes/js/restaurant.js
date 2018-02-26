
app.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}])
app.service('lazyImgLoad', function() {
    var oImages = document.getElementById("main-box").getElementsByTagName("img");
    var _this = this;
    var _src = 'data-src';
    var getPosition = function(obj) {
        var top = 0;
        //left = 0,
        //width = obj.offsetWidth,
        //height = obj.offsetHeight;

        while(obj.offsetParent){
            top += obj.offsetTop;
            //left += obj.offsetLeft;
            obj = obj.offsetParent;
        }
        return {"top":top}//,"left":left,"width":width,"height":height};
    };
    var isLoad = function(curImg,src){
        curImg.src = src;
        curImg.removeAttribute(_src);
    }
    var loadImg = function(){
        for(var i = 0, len = oImages.length; i < len; i++){
            var curImg = oImages[i] ,
                imgTop = getPosition(curImg).top,
                scrollTop = document.documentElement.scrollTop || document.body.scrollTop,
                bodyHeight = document.documentElement.clientHeight,
                src = curImg.getAttribute(_src);
            if(src){
                if((scrollTop + bodyHeight / 2) > (imgTop - bodyHeight / 2)){
                    isLoad(curImg, src);
                }
            }
        }
    };
    var init = function(){
        var timer = null;
        loadImg();
        window.onscroll = function(){
            clearTimeout(timer);
            timer = setTimeout(function(){
                loadImg();
            },300);
        }
    };
    //init();
    return init;
})
app.service('formatRestaurantData', ['lazyImgLoad',function (lazyImgLoad) {
    var restaurantId = {
            acceptOrder: [],
            preOrder: [],
            offline: [],
            restaurantObj: {}
        },
        formatData = {
            "accept_order_restaurants": "acceptOrder",
            "pre_order_restaurants": "preOrder",
            "offline_restaurants": "offline"
        },
        restaruantType = ["accept_order_restaurants", "pre_order_restaurants", "offline_restaurants"],
        restaruantData = restaurant_data || {},
        len = restaruantType.length,
        curType = '',
        dataLen = 0,
        curArr = [],
        curData = null,
        activityList = [],
        activityCatch = {};
    for (var i = 0; i < len; i++) {
        curType = restaruantType[i];
        if (angular.isArray(restaruantData[curType])) {
            curArr = restaruantData[curType];
            dataLen = curArr.length;
            for (var j = 0; j < dataLen; j++) {
                //获取全部餐厅的id 类型
                curData = curArr[j];
                restaurantId[formatData[curType]].push(curData.id);
                restaurantId['restaurantObj'][curData.id] = { 'url': curData.restaurant_url, 'type': curType, 'name': curData.name};
                //获取餐厅活动
                if (!disableCoupon) {
                    if (curData.accepts_coupon && !activityCatch.coupon) {
                        activityList.push({ id: 'coupon', text: '餐厅可使用优惠劵'});
                        activityCatch.coupon = true;
                    }
                }
                if (angular.isArray(curData.activity_list)) {
                    for (var k = 0, activityLen = curData.activity_list.length; k < activityLen; k++) {
                        var curActivity = curData.activity_list[k];
                        if (!activityCatch[curActivity.id]) {
                            var obj = { id: curActivity.id, text: curActivity.brief};
                            if (curActivity.logo){
                                obj.url = curActivity.logo;
                            }
                            activityList.push(obj);
                            activityCatch[curActivity.id] = true;
                        }
                    }
                }
                lazyImgLoad();
            }
            function show(obj,j,i){
                obj[0].style.display = 'block';
                emptyObjs[j][i] = false;
                //obj.removeClass('rotateX90');
            }
        }
    }
    //添加活动默认选项
    activityList.unshift({"id": -1,"text": "全部活动"});
    return {
        'restaurantId': restaurantId,
        'promotionData': activityList
    }
}])
app.service('restaurantFilter', ['lazyImgLoad', function (lazyImgLoad) {
    var restaurantMain = document.getElementById("restaurantMain"),
        restaurantList = [],
        childrenNode = angular.element(restaurantMain).children(),
        isFirst = true,
        oLi = null,
        nav = { 'index': 0},
        listLen = 0 ,
        emptyObjs = [],
        filterObj = angular.element(document.getElementById('filterBox')),
        filterTitle = filterObj.find('b'),
        restaurantListId = ['acceptOrderRestaurants', 'preOrderRestaruants', 'offlineRestaurants'];
    for(var i = 0 , len = childrenNode.length; i < len; i++){
        if(childrenNode[i].className.indexOf('restaurant-list') != -1){
            restaurantList.push(angular.element(childrenNode[i]));
            emptyObjs.push([]);
        }
    }
    for (var i = 0; i < restaurantListId.length; i++) {
        if (restaurantList[i] && restaurantList[i][0] && restaurantList[i][0].id) {
            if (restaurantList[i][0].id != restaurantListId[i]) {
                restaurantList.splice(i, 0, {});
                emptyObjs.splice(i, {});
            }
        }
    }
    listLen = restaurantList.length;
    function show(obj,j,i){
        obj[0].style.display = 'block';
        emptyObjs[j][i] = false;
    }
    function hide(obj,j){
        obj[0].style.display = 'none';
        emptyObjs[j][i] = true;
    }
    function getDom(elem) {
        var children = elem.children(),
            cLen = children.length,
            result = {};
        for (var i = 0; i < cLen; i++) {
            if (children[i].className.indexOf('filter-Obj') > -1) {
                result.moreTitle = angular.element(children[i]) || {css:function(){}};
            }
            if (children[i].className.indexOf('show-more-recommend-restaurant') > -1) {
                result.moreBtn = angular.element(children[i])  || {css:function(){}};
            }
        }
        return result;
    }
    function getRestaurantListLi(elem) {
        elem.cacheDom = elem.cacheDom || {};
        var children = elem.children(),
            cLen = children.length,
            result = [];
        for (var i = 0; i < cLen; i++) {
            if (children[i].nodeName == 'UL') {
                var $ul = angular.element(children[i]),
                    $li = $ul.children(),
                    type = $ul.hasClass('recommend-restaurant') ? 'recommend' : 'more',
                    obj = getDom(elem);
                elem.cacheDom[type] = {
                    ul : $ul,
                    li : $li,
                    filterTitle: filterTitle,
                    moreTitle: obj.moreTitle, //更多餐厅title
                    moreBtn: obj.moreBtn //更多
                };
                for (var j = 0, liLen = $li.length; j < liLen; j++) {
                    result.push($li[j]);
                }
            }
        }
        //又找到对应的li
        if (elem.cacheDom['more']) {
            elem.cacheDom.allLi = result;
            elem.cacheDom.b = elem.find('b');
        }
        return result;
    }

    return {
        'filterObj': filterObj,
        'nav': nav,
        'order': function(v){
            if(v){
                var elem = restaurantList[nav.index],
                    $ul = null,
                    oLiList = null,
                    sort = function() {
                        oLiList.sort(function(cur,next){
                            var curVal = 0,
                                nextVal = 0,
                                result = false,
                                $cur = angular.element(cur),
                                $next = angular.element(next);
                            if(v == 'all'){
                                curVal = parseInt($cur.attr("data-index"));
                                nextVal = parseInt($next.attr("data-index"));
                                result = curVal - nextVal;
                            }else if(v == 'priceHigh' || v == 'priceLow'){
                                curVal = parseFloat($cur.attr('data-price'));
                                nextVal = parseFloat($next.attr('data-price'));
                                result = v=="priceLow" ? curVal - nextVal : nextVal - curVal;
                            }else{
                                curVal = parseInt($cur.attr('data-count'))||0;
                                nextVal = parseInt($next.attr('data-count'))||0;
                                result = v == 'countLow' ? curVal - nextVal : nextVal - curVal;
                            }
                            return result;
                        });
                        for(var j = 0,liLen =oLiList.length ; j < liLen; j++ ) {
                            $ul.append(oLiList[j]);
                        }
                    }
                getRestaurantListLi(elem);
                if (!(elem.cacheDom && (elem.cacheDom.recommend || elem.cacheDom.more))) {
                    getRestaurantListLi(elem);
                }
                if (elem.cacheDom.recommend) {
                    $ul = elem.cacheDom.recommend.ul;
                    oLiList = elem.cacheDom.recommend.li;
                    sort();
                }
                if (elem.cacheDom.more) {
                    $ul = elem.cacheDom.more.ul;
                    oLiList = elem.cacheDom.more.li;
                    sort();
                }
            }
            lazyImgLoad();
        },
        'filter': function(v){
            var isAllEmpty = false , isListEmpty = false, oLi = null, $li = null;
            if (isFirst) { isFirst = false; return false;}

            var j = nav.index,
                elem = restaurantList[j],
                oLiList = (elem.cacheDom && elem.cacheDom.allLi) || getRestaurantListLi(elem);

            if (oLiList.length == 0) {return false;}
            emptyObjs[j] = [];

            for(i = 0 , len = oLiList.length; i < len; i++){
                oLi = oLiList[i];
                $li = angular.element(oLi);
                //搜索
                if(v.name){
                    var name = $li.attr('data-title');
                    if(name.indexOf(v.name) != -1){
                        show($li,j,i);
                    }else{
                        hide($li,j,i);
                        continue;
                    }
                }
                //菜系
                if(v.cuisine){
                    if($li.hasClass('c_' + v.cuisine)){
                        show($li,j,i);
                    }else{
                        hide($li,j,i);
                        continue;
                    }
                }
                //优惠
                if(v.promotion){
                    var p_name = v.promotion == '-1' ? 'all' : v.promotion;
                    if($li.hasClass('p_' + p_name)){
                        show($li,j,i);
                    }else{
                        hide($li,j,i);
                        continue;
                    }
                }
                if(v.free){
                    if($li.hasClass('fee')){
                        show($li,j,i);
                    }else{
                        hide($li,j,i);
                        continue;
                    }
                }else{
                    show($li,j,i);
                }

                if(v.onlinePay){
                    if($li.hasClass('p_online')){
                        show($li,j,i);
                    }else{
                        hide($li,j,i);
                    }
                }else{
                    show($li,j,i);
                }
            }
            for(i = 0 , len = emptyObjs[j].length; i < len; i++){
                if(emptyObjs[j][i]){
                    isListEmpty = true;
                }else{
                    isListEmpty = false;
                    break;
                }
            }
            if(isListEmpty){
                //找不到任何结果
                elem.addClass('empty');
                elem.cacheDom.more.filterTitle.css({'display': 'none'});

                elem.cacheDom.more.moreBtn && elem.cacheDom.more.moreBtn.css({'display': 'none'});
                elem.cacheDom.more.moreTitle && elem.cacheDom.more.moreTitle.css({'display': 'none'});
            } else{
                elem.removeClass('empty');
                //遍历 推荐餐厅
                var recommendCount = 0;
                if (elem.cacheDom.recommend && elem.cacheDom.recommend.li) {
                    for (i = 0, rLen = elem.cacheDom.recommend.li.length; i < rLen; i++) {
                        if (elem.cacheDom.recommend.li[i].style.display !== 'none') {
                            recommendCount += 1;
                        }
                    }
                    if (recommendCount == 0) {
                        elem.cacheDom.more.filterTitle.html('附近餐厅').css({'display': 'block'});
                    } else {
                        elem.cacheDom.more.filterTitle.html('推荐餐厅').css({'display': 'block'});
                    }
                    if (elem.cacheDom.more.moreBtn) {
                        if (recommendCount > 8) {
                            elem.cacheDom.more.moreBtn.css({'display': 'block'});
                        } else {
                            elem.cacheDom.more.moreBtn.css({'display': 'none'});
                        }
                    }
                } else {
                    elem.cacheDom.more.filterTitle.html('附近餐厅').css({'display': 'block'});
                }
                //遍历 其他餐厅
                var moreCount = 0;
                if (elem.cacheDom.more && elem.cacheDom.more.li) {
                    for (i = 0, mLen = elem.cacheDom.more.li.length; i < mLen; i++) {
                        if (elem.cacheDom.more.li[i].style.display !== 'none') {
                            moreCount += 1;
                        }
                    }
                    if (moreCount == 0) {
                        elem.cacheDom.more.moreTitle.css({'display': 'none'});
                    } else {
                        if (elem.cacheDom.more.moreTitle) {
                            if (recommendCount > 0) {
                                elem.cacheDom.more.moreTitle.css({'display': 'block'});
                            } else {
                                elem.cacheDom.more.moreTitle.css({'display': 'none'});
                            }
                        }
                    }
                }
            }
            /*if (restaurantList[j].hasClass('empty')){
                isAllEmpty = true;
            }else{
                isAllEmpty = false;
            }*/
            lazyImgLoad();
        }
    }
}]);
app.service('restaurantListEvent', ["commonApi","$window",'$http', function(commonApi,window,http){
    return function(scope, elem){
        var children = list = elem.children(),
            i = 0,
            ul = [];
        for (i = 0; i < children.length; i++) {
            if (children[i].nodeName == 'UL') {
                ul.push(children[i]);
            }
        }
        ul = angular.element(ul);
        var restaurantItem = ul.children(),
            length = restaurantItem.length,
            isMobile = !commonApi.isMobile.any();

        var collectError = function(msg){
            scope.errorIcon = 'error';
            scope.errorMsg = msg;
            scope.showErrorMsg = true;
        }
        var collectSuccess = function(collectMsg,oTarget,isCancel){
            var title = '取消收藏餐厅',
                msg = '取消收藏',
                className = 'collect';
            if(isCancel){
                title = '收藏餐厅';
                msg = '收藏成功';
                className = 'collect not-collect';
            }
            collectMsg.addClass('active');
            startMove(collectMsg[0],{'opacity':0,bottom:90},function(){
                collectMsg.text(msg).removeAttr('style').toggleClass('collect-success cancel-collect active');
                isCollect = true;
            }, null, 10);
            oTarget.title = title;
            oTarget.className = className;
        }
        var isCollect = true;
        var emptyElem = elem.children()[0];
        var angularEmptyElem = angular.element(emptyElem);
        for (i = 0; i < length; i++) {
            (function (elem) {
                if(isMobile){
                    var tooltip = elem.children()[2] || {};
                    tooltip = angular.element(tooltip);
                    var children = tooltip.children()[0];
/*                    tooltip.on("mouseover",function(){
                        elem.removeClass("active");
                    })*/
                    elem.on("mouseover",function(e){
                        if(!elem.hasClass('active') && e.target.className.indexOf("tooltip") == -1){
                            if(tooltip.children().length <= 1){
                                tooltip.html(children.innerHTML);
                            }
                            var tooltipElem = tooltip[0].innerHTML;
                            angularEmptyElem.children()[1].innerHTML = '';
                            angular.element(angularEmptyElem.children()[1]).append(tooltipElem);
                            var className = 'active';
                            if(960 - (this.offsetLeft + 332 + this.offsetWidth) - this.offsetParent.offsetLeft <= 0){
                                className += ' right';
                            }else{
                                angularEmptyElem.removeClass('right');
                            }

                            var offsetLeft = elem[0].offsetLeft+elem[0].offsetParent.offsetLeft,offsetTop = elem[0].offsetTop+elem[0].offsetParent.offsetTop;
                            angularEmptyElem.css("left",offsetLeft+"px");
                            angularEmptyElem.css("top",offsetTop+"px");
                            angularEmptyElem.addClass(className);
                        }
                        return false;
                    }).on("mouseout",function(){
                         angularEmptyElem.removeClass('active');
                        return false;
                    })
                }
                elem.on('click',function(e){
                    var oTarget = e.target ;
                    var  rid = angular.element(oTarget).attr('data-rid');
                    if(oTarget.nodeName == 'DIV' && oTarget.className.indexOf('collect') != -1 && rid){
                        var collectMsg = angular.element(oTarget).next() ;
                        if(isCollect){
                            if(scope.loginInfo){
                                isCollect = false;
                                var url = favoriteUrl.replace('/0/','/' + rid + '/');
                                if(oTarget.className.indexOf('not-collect') != -1){
                                    http.put(url).success(function(d){
                                        if(d.status == 'ok'){
                                            collectSuccess(collectMsg,oTarget);
                                        }else{
                                            collectError(d.failed_msg);
                                        }
                                    }).error(function(){
                                        collectError('未知错误，请稍后在重试。');
                                    })
                                }else{
                                    http['delete'](url).success(function(d){
                                        if(d.status == 'ok'){
                                            collectSuccess(collectMsg,oTarget,true);
                                        }else{
                                            collectError(d.failed_msg);
                                        }
                                    }).error(function(){
                                        collectError('未知错误，请稍后在重试。');
                                    })
                                }
                            }else{
                                scope.logoinDialogShow();
                                scope.$apply();
                            }
                        }
                    } else{
                        var $div = elem.children()[0];
                            oA = angular.element($div).children()[0];
                        window.open(oA.href, "_blank");
                    }
                    e.preventDefault();
                    e.returnValue = false
                })
            })(angular.element(restaurantItem[i]));

        }
    }
}]);

app.controller("bodyCtrl",["$scope","cache",'$window','$interval', "$http" , 'formatRestaurantData',
    function(scope, cache ,window, $interval, $http, formatRestaurantData){
        try{var json = cache.getValue('tmpLocationName'),
            key = "http://" + location.host + location.pathname,
            obj = angular.fromJson(json) || {};
            if(currentLocation) {
                scope.currentLocation = currentLocation;
            }else{
                scope.currentLocation = obj[key];
            }
        }catch(e){  }

        scope.errorIcon = 'success';

        var reloadFunc = function(){window.location.reload()};
        loginObj.init(scope,$interval,reloadFunc,reloadFunc).bind();
    }
]);

app.directive("restaurantList",["commonApi","$window",'$http', 'restaurantListEvent', function(commonApi,window,http, restaurantListEvent){
    return{
        restrict:'C',
        link: function(scope, elem){
            restaurantListEvent(scope, elem);
            elem.on('click', function(e) {
                var oTarget = e.target;
                if (oTarget.nodeName == 'A' && oTarget.className.indexOf('reset-filter') != -1) {
                    scope.$apply(function () {
                        scope.resetFilter();
                    });
                    return false;
                }
            })
        }
    };
}]);
app.directive("restaurantMain", ['restaurantFilter', 'lazyImgLoad', 'formatRestaurantData',  function(restaurantFilter, lazyImgLoad, formatRestaurantData){
    return{
        restrict:'C',
        link: function(scope, elem, attrs){
            //餐厅状态切换
            scope.tabsAction=function(type){
                scope.tabsAction1=false;
                scope.tabsAction2=false;
                scope.tabsAction3=false;
                scope["tabsAction"+type]=true;
                lazyImgLoad();
            }
            //菜系选择
            scope.cuisineIndex = 'all';
            scope.changeCuisine = function(type){
                scope.cuisineIndex = type;
                scope.filterObj.cuisine = type;
            }

            var priceReg = true,
                countReg = true;
            scope.sortObj = [{"id":"all","text":"默认"},{"id":"count","text":"销量"},{"id":"price","text":"起送价"}];
            scope.sortIndex = 1;
            scope.filterObj ={free : false,onlinePay : false };
            scope.priceReg = true;
            scope.countReg = true;

            scope.resetFilter = function(){
                scope.promotionIndex = 0;
                scope.sortIndex = 1;
                scope.cuisineIndex = 'all';
                scope.filterObj = {
                    name : '',
                    promotion : scope.promotionObj[0].id,
                    cuisine : 'all',
                    onlinePay : false,
                    free : false
                }
                scope.order = scope.sortObj[0].id
            }

            //默认 change
            scope.changeSortA=function(index){
                scope.priceReg = priceReg = true;
                scope.countReg = countReg = true;
                scope.sortIndex = index;
                scope.order = "all";
            }
            //销量 change
            scope.changeSortC=function(index){
                scope.sortIndex=index;
                if(!countReg){
                    scope.countReg=!scope.countReg;
                }
                if(countReg){
                    scope.priceReg=priceReg=true;
                    countReg=false;
                }
                if(scope.countReg){
                    scope.order = "countHigh";
                }else{
                    scope.order = "countLow";
                }
            }
            //价格 change
            scope.changeSortP=function(index){
                scope.sortIndex=index;
                if(!priceReg){
                    scope.priceReg=!scope.priceReg;
                }
                if(priceReg){
                    scope.countReg=countReg=true;
                    priceReg=false;
                }
                if(scope.priceReg){
                    scope.order = "priceLow";
                }else{
                    scope.order = "priceHigh";
                }
            }
            //活动
            scope.promotionObj = formatRestaurantData.promotionData;
            scope.promotionIndex = 0;
            scope.changePromotion = function(index){
                scope.promotionIndex = index;
                scope.filterObj.promotion = scope.promotionObj[index].id;
            }

            scope.$watch("order", restaurantFilter.order)
            scope.$watch("filterObj", restaurantFilter.filter, true);
        }
    };
}]);
//用户已定过餐厅
app.directive("historyRestaurants", ['$http', 'formatRestaurantData', function($http, formatRestaurantData){
    return{
        restrict:'A',
        link: function(scope, elem, attrs){
            /*scope.historyChange = function(index){
                if(index > 0){
                    var obj = scope.history[index] || {};
                    if(obj.url){
                        window.open(obj.url,"_blank");
                    }
                }
            }*/
            elem.on('click',function(){
                scope.$apply(function() {
                    scope.isShowHistory = !scope.isShowHistory;
                });
                if (scope.isShowHistory) {
                    setTimeout(function () {
                        var $elem = angular.element(document);
                        try{$elem.off('click')}catch(e){}
                        $elem.on('click',function(e){
                            scope.$apply(function() {
                                scope.isShowHistory = false;
                            });
                            angular.element(this).off('click');
                            return false;
                        })
                    }, 0)
                }

            })

            getUserHistory();
            function getUserHistory() {
                restaurantId = formatRestaurantData.restaurantId;
                scope.history_accept_order_restaurants = [];
                scope.history_pre_order_restaurants = [];
                scope.history_offline_restaurants = [];

                scope.acceptOrderId = restaurantId.acceptOrder;
                var allRestaurantIdStr = restaurantId.acceptOrder.concat(restaurantId.preOrder.concat(restaurantId.offline)).join(',');
                $http.post('/ajax/restaurants/ordered_restaurants/', {'r_ids': allRestaurantIdStr }).success(function(d) {
                    if (d.status == 'ok') {
                        var ordered_r_ids = d.ordered_r_ids.split(',') ,
                            restaurantObj = restaurantId.restaurantObj,
                            history_accept_order_restaurants = [],
                            history_pre_order_restaurants = [],
                            history_offline_restaurants = [];
                        for (var i = 0, len = ordered_r_ids.length; i < len; i++) {
                            var obj = restaurantObj[ordered_r_ids[i]];
                            if (obj) {
                                switch(obj.type){
                                    case 'accept_order_restaurants':
                                        history_accept_order_restaurants.push({'restaurant_url': obj.url, 'name': obj.name});
                                        break;
                                    case 'pre_order_restaurants':
                                        history_pre_order_restaurants.push({'restaurant_url': obj.url, 'name': obj.name});
                                        break;
                                    case 'offline_restaurants' :
                                        history_offline_restaurants.push({'restaurant_url': obj.url, 'name': obj.name});
                                        break;

                                }
                            }
                        }
                        scope.history_accept_order_restaurants = history_accept_order_restaurants;
                        scope.history_pre_order_restaurants = history_pre_order_restaurants;
                        scope.history_offline_restaurants = history_offline_restaurants;
                    }
                })
            }
        }
    }
}]);

app.directive("filterActivity",function(){
    return{
        restrict:'A',
        link: function(scope,elem,attrs){
            elem.on('click',function(){
                scope.$apply(function() {
                    scope.isShowActivity = !scope.isShowActivity;
                });
                if (scope.isShowActivity) {
                    setTimeout(function () {
                        var $elem = angular.element(document);
                        try{$elem.off('click')}catch(e){}
                        $elem.on('click',function(e){
                            scope.$apply(function() {
                                scope.isShowActivity = false;
                            });
                            angular.element(this).off('click');
                            return false;
                        })
                    }, 0)
                }
            })
        }
    }
});
app.directive("closeBtn",function(){
    return{
        restrict:'A',
        link: function(scope,elem,attrs){
            elem.on('click',function(){
                 var parent=angular.element(elem).parent();
                    startMove(parent[0],{"bottom":-157},function(){
                        parent.remove();
                     });
            })
        }
    }
});
app.directive("openWindow",function(){
    return{
        restrict:'A',
        link: function(scope,elem,attrs){
            elem.on('click',function(e){
                var e=e||window.event;
                var oTarget = e.target||e.srcElement;
                if(oTarget.nodeName!="A"){
                    var $div = elem.children()[3] ,
                        oA = angular.element($div).children()[0];
                        window.open(oA.href, "_blank");
                }
            })
        }
    }
});
app.directive('restaurantTypeNav', ['restaurantFilter', 'restaurantListEvent', function (restaurantFilter, restaurantListEvent) {
    return function(scope, elem, attr) {
        var preObj = document.getElementById("preOrderRestaruants"),
            offObj = document.getElementById("offlineRestaurants"),
            preOrderRestaruants = {},
            offlineRestaurants = {};
        if (preObj) {
            preOrderRestaruants = angular.element(document.getElementById("preOrderRestaruants"));
        }
        if (offObj) {
            offlineRestaurants = angular.element(document.getElementById("offlineRestaurants"));
        }
        elem.on('click', function(e) {
            var target = e.target;
            if (target.nodeName == 'LI') {
                var $target = angular.element(target),
                    index = $target.attr('data-index'),
                    isNotRender = !!$target.attr('no-render');

                if (isNotRender) {
                    if (index === '2' && preOrderRestaruants) {
                        preOrderRestaruants.html(preOrderRestaruants.children()[0].innerHTML);
                        restaurantListEvent(scope, preOrderRestaruants);
                    }
                    if (index === '3' && offlineRestaurants) {
                        offlineRestaurants.html(offlineRestaurants.children()[0].innerHTML);
                        restaurantListEvent(scope, offlineRestaurants);
                    }
                    $target.removeAttr('no-render');
                }
                restaurantFilter.nav.index = index - 1;
                restaurantFilter.order(scope.order);
                restaurantFilter.filter(scope.filterObj);
                scope.$apply(function() {
                    scope.tabsAction(index);
                })
            }
        });
        var index = angular.element(elem.children()[0]).attr('data-index');
        index = parseInt(index) || 1;
        restaurantFilter.nav.index = index - 1;
        restaurantFilter.filter(scope.filterObj);
    }
}]);
app.controller('historyOrder',['$scope','$http','$location','$interval','commonApi',function(scope,http,location,interval,commonApi){
    scope.url=[];
    var url=location.absUrl();
    var arr=url.split("/");
    var len=arr.length-2;
    var path=arr[len];
    scope.gid=path;
    var others_ordersUrl=location.absUrl();
    var orestaurant=document.getElementById("ye-restaurant"),ohistoryOrder=document.getElementById("historyOrder");
    var nowDate=new Date().getTime();
    if(orestaurant&&!commonApi.isMobile.any()){
        var oli = angular.element(orestaurant).children();
        if(oli.length>=10){
            http.post(others_ordersUrl+"others_orders/",{"rids":scope.acceptOrderId.join(",")})
                .success(function(data){
                    if(data.code=="0"){
                        var localtime=data.localtime;
                         var dateTime=new Date(parseInt(localtime)*1000);
                         var hour=dateTime.getHours();
                         if(hour>=10&&hour<=21){
                            if(data.data.length>=5){
                                 scope.orders=data.data;
                                 ohistoryOrder.style.display="block";
                                 startMove(ohistoryOrder,{"bottom":0},function(){
                                    scrollOrder();
                                 });
                            }
                         }
                    }
            });
        }
    }
    //each
    var each=function(arr, callback) {
        if (arr.forEach) {
            arr.forEach(callback);
        }else {
            for (var i = 0, len = arr.length; i < len; i++)
                callback.call(this, arr[i], i, arr);
        }
    }
    var scrollOrder=function() {
            var targetIdx=0; //目标图片序号
            var curIndex=0; //现在图片序号
            var wrapId=document.getElementById("orderBox");
            var oli=wrapId.getElementsByTagName("li");
            var height=wrapId.clientHeight,itv=null;
            var ajaxDataReg=true;
            each(oli,function(elem,idx,arr){
                 if (idx==0){
                    elem.style.top="0px";
                 }else{
                     elem.style.top=height+"px";
                 }
                elem.style.position="absolute";
            });
            //自动轮播效果
            this.scroll=function(){
                if(!document.getElementById("historyOrder")){
                    clearTimeout(itv);
                    return false;
                }
                if (targetIdx <oli.length - 1) {
                     targetIdx++;
                 } else {
                     targetIdx = 0;
                 }
                 startMove(oli[curIndex],{"top":"-"+height},function(){
                     for(i=0;i<oli.length;i++){
                         if(i!=targetIdx){
                             oli[i].style.top=height+"px";
                         }
                     }
                 });
                startMove(oli[targetIdx],{"top":0},function(){
                    var endTimeDate=new Date().getTime();
                    var timeInterval=(endTimeDate-nowDate)/1000/60;
                    if(timeInterval>=5){
                        setTimeout(function(){
                            startMove(ohistoryOrder,{"bottom":-155});
                        },1500)
                        return false;
                    }
                    setTimeout(function(){
                        curIndex = targetIdx;
                        clearTimeout(itv);
                        itv=null;
                        this.intervalObj();
                    },500)
                });
            }
            this.intervalObj=function(){
                var timer=(Math.round(Math.random()*10)+5)*1000;
                itv = setTimeout(function () {
                    this.scroll();
                }, timer);
            }
            this.intervalObj();
        };

}]);

app.directive("showMoreRecommendRestaurant", function() {
    return {
        restrict: 'C',
        link: function(scope, elem, attrs) {
            var recommendRestaurant = elem.parent().children()[1],
                $recommendRestaurant = angular.element(recommendRestaurant),
                $span = elem.find('span');
            elem.on('click', function() {
                var value = '查看更多';
                if (!elem.hasClass('expand')) {
                    value = '收起'
                }
                $span.html(value);
                $recommendRestaurant.toggleClass('recommend-restaurant');
                elem.toggleClass('expand');
            })
        }
    }
})
