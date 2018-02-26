var element = document.getElementById("element"),target = document.getElementById("cart-item-list");
app.config(['$interpolateProvider',function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);
app.controller("bodyCtrl", ["$scope", "mapApi", 'cache', '$timeout','$window','$interval', "ajaxData",'$http','getAdditives',function (scope, mapApi, cache, timeout,window,interval, ajaxData,http,getAdditives) {
    scope.canProcessOrder = can_process_order;
    var reloadFunc = function(){window.location.reload()};
    loginObj.init(scope,interval,reloadFunc,reloadFunc).bind();
    if(!scope.canProcessOrder){
        scope.createOrderBtnName = "餐厅休息";
        scope.isEmpty = true;
        scope.isPlaceOrder = true;
        scope.restaurantRest = true;
        return false;
    }
    scope.$on('restaurant-rest', function () {
        scope.restaurantRest = true;
    })
    scope.$on('collect-callback',function(e){
        scope.errorIcon = e.targetScope.errorIcon;
        scope.errorMsg = e.targetScope.errorMsg;
        scope.showErrorMsg = true;
    });

    bodyCtrl.init(scope, mapApi, cache, timeout, ajaxData,http , getAdditives , window);
    scope.accessoryShow = false;
    scope.accessoryTitle = '';
    scope.accessoryObj = accessoryObj;
    scope.orderObj = orderObj;
    scope.grid_locationId = grid_locationId;
    //辅料选项
    scope.optional = {};
    //datasource
    scope.optionSets = [];
    //current selected tab index
    scope.curIndex = 0;
    //selected accessories
    scope.selectedAccessory = [];
    //Accessory total price
    scope.subtotal = 0;
    bodyCtrl.bulidAccessoryDialog();
    bodyCtrl.cart();
    bodyCtrl.searchAddress();
    bodyCtrl.createOrder();
    scope.$on('show-search-address', function () {
        scope.searchAddress = true;
    })
}]);

var bodyCtrl = (function (window) {
    var scope = null, mapApi = null, cache = null, timeout = null, ajaxData = null,http,getAdditives=null,window=null,
        menuItemObj = 0,
        mandatoryCount = 0,
        formatRestaurantId = "",
        catchData = {}, //缓存的数据 {id:{id:'',name:'',price:''}}
        checkNumber = function (num) {
            if (isNaN(num)||num=="") {
                return -1;
            } else {
                return parseFloat(num);
            }
        },
        formatOrderItem = function (cartDatas) {
            var orderData = [] , item = null , itemOptions = null,itemAdds=null;
            for (var i = 0, len = cartDatas.length; i < len; i++) {
                item = cartDatas[i];
                orderData.push({
                    id: item.id,
                    p: item.price+"",
                    q: item.quantity
                })
                itemOptions = item.options;
                orderData[i].opts=[];
                for (var j = 0, optionLen = itemOptions.length; j < optionLen; j++) {
                    orderData[i].opts.push({
                        id: itemOptions[j].id,
                        p: itemOptions[j].price+"",
                        q: itemOptions[j].quantity
                    });
                }
                itemAdds=item.additions,orderData[i].adds=[];
                for (var t = 0, addLength = itemAdds.length; t < addLength; t++) {
                    orderData[i].adds.push({
                        id: itemAdds[t].id,
                        p: itemAdds[t].price+"",
                        q: item.quantity
                    });
                }
            }
            return orderData;
        },
        toFixed = function(num){
          return parseFloat(num).toFixed(2);
        },
        buildCreateOrderBtnName = function(sendMonty , total , isEmpty){
            //Delivery charges none or not number
            if(sendMonty && !isNaN(sendMonty)&&sendMonty!=-1){
                if(total && !isNaN(total)){
                    if(!isEmpty){
                        if(sendMonty - total > 0){
                            return '还差 ' + toFixed(sendMonty - total) + '元 起送';
                        }else{
                            return '立即下单';
                        }
                    }else{
                        return toFixed(sendMonty) + "元 起送";
                    }
                }else{
                    return toFixed(sendMonty) + "元 起送";
                }
            }else{
                return '立即下单';
            }
        };
    return {
        init: function (_scope, _mapApi, _cache, _timeout, _ajaxData,_http,_getAdditives,_window) {
            scope = _scope;
            mapApi = _mapApi;
            cache = _cache;
            timeout = _timeout;
            ajaxData = _ajaxData;
            http = _http;
            window=_window;
            getAdditives=_getAdditives;
            formatRestaurantId = cache.buildCacheKey(restaurantId);
            scope.setCatchData = function (item) {
                catchData[item.id] = item;
            }
        },
        bulidAccessoryDialog: function () {
            var optionData = {};
            //加载数据
            scope.menuClick = function (obj, isShowAccessory) {
                menuItemObj = {
                    "id": obj.id,
                    "name": obj.name,
                    "price": obj.price,
                    "quantity": 1,
                    "sectionId": obj.sectionId,
                    "key": obj.key,
                    "options": [],
                    "additions":obj.additions||[],
                    "index": 0
                }
                if (isShowAccessory) {
                    optionData = menuItemObj;
                    var isDisabledPut = false ,
                        selectTabCount = {};
                    scope.footItemName = obj.name;
                    scope.footItemPrice = obj.price;
                    scope.selectedAccessoryPrice = 0;
                    scope.subtotal = obj.price;
                    scope.accessoryShow = true;
                    scope.optionSets = obj['optionsets'];
                    scope.accessoryTitle = '请为 <font color="#FEBC19">' + obj.name + '</font> 选择辅料(*为必选)';
                    //初始化
                    scope.optional = {};
                    mandatoryCount = 0;
                    for (var i = 0, len = obj['optionsets'].length; i < len; i++) {
                        //标签页上的数量
                        if (obj['optionsets'][i].mandatory) {
                            //给必须项初始化model
                            scope.optional[i] = '';
                            mandatoryCount += 1;
                            isDisabledPut = true;//有必选项 放入购物车就警用
                        }
                        selectTabCount[i] = 0;//初始化tab标签上的数量
                    }
                    scope.selectTabCount = selectTabCount;
                    scope.changeAccessoryContent(0);
                    scope.isDisabledPut = isDisabledPut;
                    document.getElementById("accessory-nav").style.marginLeft="0px";
                } else {
                    menuItemObj.sid = menuItemObj.idsectionId + '-' + menuItemObj.id;
                    scope.addCartItem(menuItemObj);
                }
            }
            //tab change
            scope.changeAccessoryContent = function (index, mandatory) {
                scope.curIndex = index;
                scope.current_options = scope.optionSets[index];
            }
            //auto select the option if there is only one
            scope.autoSelect = function() {
                if(scope.current_options.options.length==1&&scope.current_options.mandatory){
                    scope.optional[scope.curIndex] = scope.current_options.options[0].id;
                }
            }
            scope.handleContentClick = function(e) {
                var target = angular.element(e.target);
                var next = scope.curIndex + 1;
                if (target.attr('type') == 'radio') {
                    if (next < scope.optionSets.length) {
                        scope.changeAccessoryContent(next);
                    }
                }
            }
            scope.putCart = function () {
                //scope.addCartItem()
                menuItemObj = optionData;
                var selectId = '';
                for (var i = 0, len = scope.selectedAccessory.length; i < len; i++) {
                    scope.selectedAccessory[i].quantity = 1;
                    selectId += scope.selectedAccessory[i].id + '-';
                }
                menuItemObj.selectId = selectId;
                menuItemObj.options = angular.copy(scope.selectedAccessory);
                scope.addCartItem(menuItemObj, true);
            }
            //watch Accessory
            scope.$watch("optional", function (obj) {
                var currentMandatoryCount = 0;
                if (obj) {
                    var isDisabledPut = true,
                        selectedAccessory = [],
                        curTabCount = 0;
                    //scope.selectedAccessory = [];
                    for (var i in obj) {
                        if (i.indexOf('-') == -1 && obj[i] != '') {
                            currentMandatoryCount += 1;
                            if (currentMandatoryCount == mandatoryCount) {
                                isDisabledPut = false;
                            }
                        }
                        if (obj[i]) {
                            if (i.indexOf('-') == -1) {
                                catchData[obj[i]].mandatory = true;
                            }
                            if (parseInt(i.split('-')[0]) == scope.curIndex) {
                                curTabCount += 1;
                            }
                            selectedAccessory.push(catchData[obj[i]]);
                        }
                    }
                    if (scope.isDisabledPut) {
                        scope.isDisabledPut = isDisabledPut
                    }
                    scope.selectedAccessory = selectedAccessory;
                    if (scope.selectTabCount) {
                        scope.selectTabCount[scope.curIndex] = curTabCount;
                    }
                    //统计金额
                    if (scope.selectedAccessory.length > 0) {
                        var subtotal = 0 , selectedAccessoryPrice = 0;
                        for (var i = 0, length = scope.selectedAccessory.length; i < length; i++) {
                            selectedAccessoryPrice += scope.selectedAccessory[i].price;
                        }
                        scope.selectedAccessoryPrice = selectedAccessoryPrice;
                        scope.subtotal = selectedAccessoryPrice + scope.footItemPrice;
                    }
                }
            }, true);
        },
        cart: function () {
            //外送费 delivery_fee
            var tempDeliveryCost = checkNumber(delivery.delivery_fee);
            //起送金额 minimum_order_quantity
            var sendMonty = checkNumber(delivery.minimum_order_quantity);
            //create order btn name
            scope.createOrderBtnName = buildCreateOrderBtnName(sendMonty);
            //满额免外送费 free_delivery_treshold
            var freeDeliveryCostMoney = checkNumber(delivery.free_delivery_treshold);
            scope.deliveryCost = tempDeliveryCost < 0 ? 0 : tempDeliveryCost;
            //init cart
            if(cache.judgeMode()){
                scope.cartDatas = angular.fromJson(cache.getValue(formatRestaurantId)) || [];
                //更新购物车数据
                for(var i = 0;i < scope.cartDatas.length;i++){
                    var item = scope.cartDatas[i];
                    var key = item.key;
                    var newOrderItem = scope.accessoryObj[key];
                    if(newOrderItem&&angular.isObject(newOrderItem)){
                        var options = item.options;
                        var newOrderOptions = newOrderItem.optionsets;
                        item.price = newOrderItem.price;
                        item.additions = newOrderItem.additions;
                        if(options.length>0){
                            for(var t = 0;t < options.length;t++){
                                for(var m = 0;m < newOrderOptions.length;m++){
                                    var newOrderOptionsItem = newOrderOptions[m].options;
                                    for (var s=0;s<newOrderOptionsItem.length;s++){
                                        if(options[t].id == newOrderOptionsItem[s].id){
                                            options[t].price = newOrderOptionsItem[s].price;
                                        }
                                    }
                                }
                            }
                        }   
                    }
                }
            }else{
                scope.cartDatas = [];
            }
            //cart is empty
            scope.isEmpty = true;
            scope.isPlaceOrder = true;
            scope.menuItemCount = {};
            //加载数据
            var objData=scope.orderObj,orderListObj=[];
            for( var z=0;z<objData.length;z++){
                var orderItemObj = {
                        "id": objData[z].id,
                        "name": objData[z].name,
                        "price": objData[z].menu_price,
                        "quantity": objData[z].quantity,
                        "sectionId": objData[z].sectionId,
                        "key": objData[z].key,
                        "options": objData[z].options,
                        "additions":objData[z].additions||[],
                        "index": 0
                    }
                if(objData[z].options.length>0){
                    var selectId = '';
                    for (var i = 0, len = objData[z]['options'].length; i < len; i++) {
                        selectId +=  objData[z]['options'][i].id + '-';
                        orderItemObj['options'][i].quantity=objData[z].quantity;
                        orderItemObj['options'][i].price=orderItemObj['options'][i].option_price
                    }
                    orderItemObj.selectId = selectId;
                }else{
                    orderItemObj.sid = objData[z].sectionId + '-' + objData[z].id;
                }

                orderListObj.push(orderItemObj);
            }

            for(var m=0;m<orderListObj.length;m++){
                //包含辅料
                if (orderListObj[m].options.length>0) {
                    for (var i = 0, len = scope.cartDatas.length; i < len; i++) {

                        if (scope.cartDatas[i].key == orderListObj[m].key && scope.cartDatas[i].selectId == orderListObj[m].selectId) {
                            scope.cartDatas[i].quantity +=orderListObj[m].quantity;
                            for (var j = 0, oLen = scope.cartDatas[i].options.length; j < oLen; j++) {
                                scope.cartDatas[i].options[j].quantity =scope.cartDatas[i].quantity;
                            }
                            orderListObj[m]="";
                            break;
                        }
                    }
                   if(orderListObj[m]!=""){
                        scope.cartDatas.push(orderListObj[m]); 
                    }
                } else {
                   for (var i = 0, len = scope.cartDatas.length; i < len; i++) {
                        if (scope.cartDatas[i].key == orderListObj[m].key) {
                            scope.cartDatas[i].quantity += orderListObj[m].quantity;
                            orderListObj[m]="";
                            break;
                        }
                    }
                    if(orderListObj[m]!=""){
                        scope.cartDatas.push(orderListObj[m]); 
                    }
                }
            }
            scope.addCartItem = function (data, hasAccessory) {
                //包含辅料
                if (hasAccessory) {
                    scope.accessoryShow = false;
                    for (var i = 0, len = scope.cartDatas.length; i < len; i++) {
                        if (scope.cartDatas[i].key == data.key && scope.cartDatas[i].selectId == data.selectId) {
                            scope.cartDatas[i].quantity += 1;
                            for (var j = 0, oLen = scope.cartDatas[i].options.length; j < oLen; j++) {
                                scope.cartDatas[i].options[j].quantity += 1
                            }
                            return false;
                        }
                    }
                    scope.cartDatas.push(data);
                } else {
                    for (var i = 0, len = scope.cartDatas.length; i < len; i++) {
                        if (scope.cartDatas[i].key == data.key) {
                            scope.cartDatas[i].quantity += 1;
                            return false;
                        }
                    }
                    data.options = [];
                    scope.cartDatas.push(data);
                }
            }
            //watch cart
            scope.$watch("cartDatas", function (obj,oldObj) {
                scope.menuItemCount = {};
                scope.sectionCount = {};
                scope.additions = {};
                var additionsData=getAdditives.getValue(obj);
                scope.additions=additionsData;
                var total = 0,
                    isEmpty = true,
                    menuItemCount = {},
                    sectionCount = {};
                for (var i = 0, len = obj.length; i < len; i++) {
                    isEmpty = false;
                    //item price
                    total += obj[i].quantity * obj[i].price;
                    for (var j = 0, oLen = obj[i].options.length; j < oLen; j++) {
                        //accessory price
                        total += obj[i].options[j].quantity * obj[i].options[j].price;
                    }
                    if(!obj[i].additions){
                        obj[i].additions=[];
                    }
                    for (var j = 0, oLen = obj[i].additions.length; j < oLen; j++) {
                        //accessory price
                        total += obj[i].quantity * obj[i].additions[j].price;
                    }
                    if (menuItemCount[obj[i].key]) {
                        menuItemCount[obj[i].key] += obj[i].quantity;
                    } else {
                        menuItemCount[obj[i].key] = obj[i].quantity;
                    }
                    if (obj[i].key.indexOf(obj[i].sectionId + '-') != -1) {
                        if (isNaN(sectionCount[obj[i].sectionId])) {
                            sectionCount[obj[i].sectionId] = obj[i].quantity
                        } else {
                            sectionCount[obj[i].sectionId] += obj[i].quantity
                        }
                    }
                }
                scope.menuItemCount = menuItemCount;
                scope.sectionCount = sectionCount;
                scope.isEmpty = isEmpty;
                scope.isPlaceOrder = isEmpty;
                if (freeDeliveryCostMoney > 0) {
                    scope.deliveryCost = total >= freeDeliveryCostMoney ? 0 : tempDeliveryCost;
                }
                if (sendMonty > 0){
                    scope.isPlaceOrder = total < sendMonty;
                }else{
                    sendMonty = 0;
                    scope.isPlaceOrder = total < sendMonty;
                }
                if (scope.grid_locationId == "") {
                    scope.isPlaceOrder=true;
                }
                scope.createOrderBtnName = buildCreateOrderBtnName(sendMonty,total,isEmpty);
                scope.total = total + scope.deliveryCost;
                if(cache.judgeMode()){
                    if(obj.length > 0 ){
                        cache.setValue(formatRestaurantId, angular.toJson(obj));
                    }else{
                        cache.removeItem(formatRestaurantId);
                    }
                }
            }, true);
            //add cart item num
            scope.addGoodsNum = function (index) {
                if (!scope.cartDatas[index]) {
                    return;
                }
                var count = scope.cartDatas[index].quantity;
                scope.cartDatas[index].quantity = count + 1;
                for (var i = 0, len = scope.cartDatas[index].options.length; i < len; i++) {
                    scope.cartDatas[index].options[i].quantity = count + 1;
                }
            }
            scope.clearCart = function () {
                scope.cartDatas = [];
                if(cache.judgeMode()){
                    cache.removeItem(formatRestaurantId);
                }
            }
            scope.clearShopingCart = function () {
                scope.cartDatas = [];
                if(cache.judgeMode()){
                    cache.removeItem(formatRestaurantId);
                }
                window.location.reload();
            }
        },
        searchAddress: function () {
            if (scope.grid_locationId == "") {
                timeout(function () {
                    scope.searchAddress = true;
                    scope.isPlaceOrder=true;
                }, 0);
            } else if (window.location.search.indexOf('referer=menupage') != -1) {
                timeout(function () {
                    if (!inRange) {
                        scope.notInRange = true;
                        timeout(function () {
                            window.location.href = restaurant_list_url.replace('0', scope.grid_locationId);
                        }, 2000)
                    }
                }, 0)
            }
            scope.locationRestaurant = function () {
                window.location.href = restaurant_list_url.replace('0', scope.grid_locationId);
            }
            scope.selectedResult = function (text) {
                mapApi.byKeywords(text, scope.city_name).then(function (data) {
                    if (data && data.list && data.list.length > 0) {
                        scope.isNotFindStreet = false;
                        scope.shreets = data.list;
                        scope.addressShow = true;
                    } else {
                        scope.isNotFindStreet = true;
                    }
                })
            }
            scope.resetStreet = function () {
                scope.addressShow = false;
                scope.$broadcast("clear-keyword", "");
            }
            scope.resultClick = function (list) {
                var loactionUrl = window.location.pathname;
                var get_grid_location_data = {
                    lat: list.y,
                    lng: list.x,
                    description: list.name,
                    street: '',
                    street_number: '',
                    xstreet: ''
                };
                ajaxData.getGridLocationId(get_grid_location_data).then(function (grid_location_id) {
                    window.location.href = loactionUrl + '?gid=' + grid_location_id + '&referer=menupage';
                });
            }
        },
        createOrder: function () {
            scope.createOrder = function () {
                var orderDatas = formatOrderItem(scope.cartDatas);
                if (orderDatas && orderDatas.length > 0) {
                    scope.isPlaceOrder=true;
                    http.post(create_order_url, {
                            "restaurant_id": restaurantId,
                            "grid_location_id": scope.grid_locationId,
                            "menu_items_total": (scope.total - scope.deliveryCost).toFixed(2),
                            "delivery_fee": scope.deliveryCost.toFixed(2),
                            "menu_items_data": angular.toJson(orderDatas),
                            "discount": 0,
                            "platform":1
                        })
                        .success(function (d) {
                            if (d.status == 'ok' && d.order_id) {
                                window.location.href = checkout_url.replace('/0/', '/' + d.order_id + '/?gid=' + scope.grid_locationId);
                            } else {
                                if(d.status == 'failed' ){
                                    if(d.failed_code == 0){
                                        scope.clearShopCart = true;
                                    }else{
                                        scope.clearShopCart = false;
                                    }
                                }
                                scope.createOrderError = true;
                                scope.createOrderErrorMsg = d.failed_msg;
                                scope.isPlaceOrder=false;
                            }
                        })
                        .error(function () {
                            scope.isPlaceOrder=false;
                            scope.createOrderError = true;
                            scope.createOrderErrorMsg = '访问异常，请稍后再试。';
                        })
                }
            }
        }
    }
})(window);
app.controller("searchAddressCtrl", ["$scope", function (scope) {
    scope.$on("clear-keyword", function (data) {
        scope.keyword = '';
    })
}]);
app.directive("menuItem",['commonApi',function (commonApi) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            if(!commonApi.isMobile.any()){
                elem.on("mouseover",function(){
                    elem.addClass("menu-item-hover");
                });
                 elem.on("mouseout",function(){
                    elem.removeClass("menu-item-hover");
                });
            }
            elem.on('click', function () {
                if(!scope.canProcessOrder){
                    scope.$emit('restaurant-rest');
                    return false;
                }

                if (scope.grid_locationId == "" || !inRange) {
                    scope.$emit('show-search-address');
                    return false;
                }
                
                var key = attrs['accessorykey'];
                var options_sets = scope.accessoryObj[key];
                if (options_sets['optionsets'].length) {
                    options_sets['optionsets'].sort(function (f, s) {
                        var f = f.mandatory ? 1 : 0,
                            s = s.mandatory ? 1 : 0;
                        return s - f;
                    });
                    scope.menuClick(options_sets, true);
                    scope.$apply();
                } else {
                    if(commonApi.isIE.ie8() || commonApi.isIE.ie9()){
                        scope.menuClick(scope.accessoryObj[attrs['accessorykey']]);
                    }else{
                        var elemObj= document.createElement("span");

                        if(!elem.hasClass("hasImg")){
                            var oLi = elem.children()[0];
                            var oSpan = oLi.lastElementChild || oLi.lastChild;
                            oI = oSpan.lastElementChild || oSpan.lastChild;
                            elemObj.style.left = oI.offsetLeft - 105 + "px"
                        }else{
                            var oSpan = elem.children()[3];
                            oI = angular.element(oSpan).children()[0];
                            elemObj.style.left = oI.offsetLeft - 40 + "px"
                        }

                        elemObj.className="badge";
                        elemObj.innerHTML = 1;
                        elemObj.style.position = 'absolute';
                        
                        elemObj.style.top = oI.offsetTop + "px";
                        elem[0].appendChild(elemObj);
                        var parabola = funParabola(elemObj, target, {
                            curvature: 0.003,
                            speed: 400,
                            complete: function () {
                                scope.menuClick(scope.accessoryObj[attrs['accessorykey']]);
                                elemObj.style.display = "none"
                                //oLi.removeChild(elemObj);
                                scope.$apply();
                            }
                        }).mark();
                        parabola.init(); 
                    }
                }
            });
        }
    }
}]);
app.directive("subGoods", function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.on("click", function () {
                var index = attrs["subGoods"];
                if (scope.cartDatas[index]) {
                    var count = scope.cartDatas[index].quantity;
                    if (count == 1) {
                        //提示是否删除
                        startMove(elem.parent().parent()[0], {opacity: 0}, function () {
                            scope.cartDatas.splice(index, 1);
                            scope.$apply();
                        }, 100)
                    } else {
                        var count = scope.cartDatas[index].quantity;
                        scope.cartDatas[index].quantity = count - 1;
                        for (var i = 0, len = scope.cartDatas[index].options.length; i < len; i++) {
                            scope.cartDatas[index].options[i].quantity = count - 1;
                        }
                    }
                    scope.$apply();
                }
            })
        }
    }
});
app.directive("menutoggle", function () {
    return function (scope, elem, attrs) {
        var parent = angular.element(elem.parent()).parent();
        var oArticle = parent[0].getElementsByTagName('article');
        var oAs = elem[0].getElementsByTagName('a');
        elem.on('click', function (e) {
            if (e.target.nodeName == 'A') {
                var $this = angular.element(e.target.parentNode),
                    toggle = $this.attr("data-toggle");
                for (var i = 0, len = oAs.length; i < len; i++) {
                    oAs[i].parentNode.className = '';
                }
                $this[0].className = 'active';

                if (toggle == 'section-all') {
                    for (var i = 0, len = oArticle.length; i < len; i++) {
                        oArticle[i].style.display = 'block';
                    }
                    return false;
                }

                for (var i = 0, len = oArticle.length; i < len; i++) {
                    if (oArticle[i].className.indexOf(toggle) != -1) {
                        oArticle[i].style.display = 'block';
                    } else {
                        oArticle[i].style.display = 'none';
                    }
                }
            }
            return false;
        })
    }
});
app.directive("accessoryNav", function () {
    return {
        restrict: 'C',
        link: function (scope, elem) {
            var width = 0;
            var nav = angular.element(elem.parent()) , tab = angular.element(nav.parent()), oChildren = tab.children(),
                oLeft = oChildren[0] , oRight = oChildren[2] , offset = 0 , navWidth = 0;
            scope.$watch('optionSets', function () {
                var oLis = elem.children();
                elem.css('width', '2000px');
                setTimeout(function () {
                    width = 0;
                    for (var i = 0, len = oLis.length; i < len; i++) {
                        width += oLis[i].offsetWidth;
                    }
                    navWidth = 800 - 46;
                    if (width > 800) {
                        oLeft.style.display = 'block';
                        oRight.style.display = 'block';
                        nav.css('width', navWidth + 'px');
                    } else {
                        oLeft.style.display = 'none';
                        oRight.style.display = 'none';
                        nav.css('width', 800 + 'px');
                    }
                    elem.css('width', width + 2 + 'px');
                }, 0);
            })
            oLeft.onclick = function () {
                offset=parseInt(elem.css('marginLeft'));
                if (offset == 0) {
                    return false;
                }
                offset += 600
                if (offset > 0) {
                    offset = 0;
                }
                startMove(elem[0], {'marginLeft': offset})
            }
            oRight.onclick = function () {
                offset=parseInt(elem.css('marginLeft'));
                if (Math.abs(offset) + navWidth == width) {
                    return false;
                }
                offset -= 600;
                if (Math.abs(offset) + navWidth > width) {
                    offset = navWidth - width;
                }
                startMove(elem[0], {'marginLeft': offset})
            }

        }
    }
});
app.directive("addendumItem",function(){
    return {
         restrict: 'C',
         link:function(scope,elem,attrs){
            var children=elem.children();
            if(children.length<=0){
                var prev=elem.parent().children()[0];
                angular.element(prev).addClass("menu-nohas-container");
                elem.remove();
            }
        }
    }
});
angular.element(document).ready(function() {
    var groups = document.getElementById('menu-main').getElementsByTagName('ul');
    var navigation = document.getElementById('list-order-nav');
    var isOrderByPriceAscend = false, isOrderByPriceDescend = false;

    var getText = function(elem) {
        if (angular.isElement(elem)) {
            return elem.innerText || elem.textContent;
        } else {
            return '';
        }
    };

    var getDefaultOrder = function(targetEl) {
        var list = [],listImg=[];
        var li;
        if (angular.isElement(targetEl)) {
            li = targetEl.getElementsByTagName('li');
            for (var i = 0, len = li.length; i < len; ++i) {
                list.push(li[i]);    
            }
        }
        return list;
    };

    /*
    按照销量降序
     */
    var compareSales = function(a, b) {
        var saleA = angular.element(a).attr('data-sale');
        var saleB = angular.element(b).attr('data-sale');

        return saleB - saleA;
    };

    /*
    按照价格升序
     */
    var comparePrice = function(a, b) {
        var priceA = angular.element(a).attr('data-price');
        var priceB = angular.element(b).attr('data-price');

        return priceA - priceB;
    };

    for (var i = 0, len = groups.length; i < len; ++i) {
        //按照一定的顺序保存dom引用
        groups[i]._defaultOrder = getDefaultOrder(groups[i]);
        groups[i]._priceAscend = groups[i]._defaultOrder.slice(0).sort(comparePrice);
        groups[i]._priceDescend = groups[i]._priceAscend.slice(0).reverse();
        groups[i]._saleDescend = groups[i]._defaultOrder.slice(0).sort(compareSales);
    }
    
    navigation.onclick = function(event) {
        var orderListName, frag, order;
        var event=event||window.event;
        var elem = event.target || event.srcElement, $elem;
        var $priceElem = angular.element(navigation.getElementsByTagName("a")[2]);
        if (elem.nodeName === 'A') {
            $elem = angular.element(elem);
            for(i=0;i<navigation.getElementsByTagName("a").length;i++){
                 angular.element(navigation.getElementsByTagName("a")[i]).removeClass('active');
            }
            $elem.addClass('active');
            $priceElem.removeClass('descend');
            if ($elem.hasClass('sort-default')) {
                orderListName = '_defaultOrder';
                isOrderByPriceAscend = false;
                isOrderByPriceDescend = false;
            } else if ($elem.hasClass('sort-sale')) {
                orderListName = '_saleDescend';
                isOrderByPriceAscend = false;
                isOrderByPriceDescend = false;
            } else if ($elem.hasClass('sort-price')) {
                if (!isOrderByPriceAscend && !isOrderByPriceDescend) {
                    orderListName = '_priceAscend';
                    isOrderByPriceAscend = true;
                } else if (isOrderByPriceAscend) {
                    orderListName = '_priceDescend';
                    isOrderByPriceAscend = false;
                    isOrderByPriceDescend = true;
                    $elem.addClass('descend');
                } else if (isOrderByPriceDescend) {
                    orderListName = '_priceAscend';
                    isOrderByPriceAscend = true;
                    isOrderByPriceDescend = false;
                }
            }

            if (orderListName) {
                for (var i = 0, gLen = groups.length; i < gLen; ++i) {
                    //排序去除class
                    if(angular.element(groups[i]).hasClass("menu-group-img")){
                        angular.element(groups[i]).removeClass("menu-first-load")
                    }
                    frag = document.createDocumentFragment();
                    order = groups[i][orderListName];
                    for (var j = 0, oLen = order.length; j < oLen; ++j) {
                        frag.appendChild(order[j]);
                    }
                    groups[i].appendChild(frag);
                }
            }
        }
    }
});


