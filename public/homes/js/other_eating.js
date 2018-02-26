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
        scope.$on('restaurant-rest', function () {
            scope.restaurantRest = true;
        })
        return false;
    }
    scope.$on('collect-callback',function(e){
        scope.errorIcon = e.targetScope.errorIcon;
        scope.errorMsg = e.targetScope.errorMsg;
        scope.showErrorMsg = true;
    })

    bodyCtrl.init(scope, mapApi, cache, timeout, ajaxData,http,getAdditives);
    scope.accessoryShow = false;
    scope.accessoryTitle = '';
    scope.accessoryObj = accessoryObj;
    scope.orderObj = orderObj;
    scope.otherObj = otherObj;
    scope.data=data;
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
    var scope = null, mapApi = null, cache = null, timeout = null, ajaxData = null,http,getAdditives=null,
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
        init: function (_scope, _mapApi, _cache, _timeout, _ajaxData,_http,_getAdditives) {
            scope = _scope;
            mapApi = _mapApi;
            cache = _cache;
            timeout = _timeout;
            ajaxData = _ajaxData;
            http = _http;
            getAdditives=_getAdditives;
            formatRestaurantId = cache.buildCacheKey(restaurantId);
            scope.setCatchData = function (item) {
                catchData[item.id] = item;
            }
        },
        bulidAccessoryDialog: function () {
            //加载数据
            scope.menuClick = function (obj,unm) {
                var unm=unm-1;
                menuItemObj = {
                    "id": obj[unm].id,
                    "name": obj[unm].name,
                    "price": obj[unm].menu_price,
                    "quantity": obj[unm].quantity,
                    "sectionId": obj[unm].sectionId,
                    "key": obj[unm].key,
                    "options": obj[unm].options,
                    "index": 0,
                    "additions":obj[unm].additions
                }
                if(menuItemObj.options.length>0){
                    var selectId = '';
                    for (var i = 0, len = menuItemObj['options'].length; i < len; i++) {
                        selectId +=  menuItemObj['options'][i].id + '-';
                        menuItemObj['options'][i].quantity=menuItemObj.quantity;
                        menuItemObj['options'][i].price=menuItemObj['options'][i].option_price
                    }
                    menuItemObj.selectId = selectId;
                    scope.addCartItem(menuItemObj, true);
                }else{
                    menuItemObj.sid = menuItemObj.sectionId + '-' + menuItemObj.id;
                    scope.addCartItem(menuItemObj);
                }
            }
            //加载数据
            scope.ordermenuClick=function(obj){
                var objData=obj,orderListObj=[];
                for( var z=0;z<objData.length;z++){
                    var orderItemObj = {
                            "id": objData[z].id,
                            "name": objData[z].name,
                            "price": objData[z].menu_price,
                            "quantity": objData[z].quantity,
                            "sectionId": objData[z].sectionId,
                            "key": objData[z].key,
                            "options": objData[z].options,
                            "index": 0,
                            "additions": objData[z].additions
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
                                scope.cartDatas[i].quantity +=orderListObj[m].quantity ;
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
            }
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
                    var newOrderItem = scope.otherObj[key];
                    if(newOrderItem&&angular.isObject(newOrderItem)){
                        var options = item.options;
                        var newOrderOptions = newOrderItem.options;
                        item.price = newOrderItem.menu_price;
                        item.additions = newOrderItem.additions;
                        if(options.length>0){
                            for(var t = 0;t < options.length;t++){
                                for(var m = 0;m < newOrderOptions.length;m++){
                                    if(options[t].id == newOrderOptions[m].id){
                                        options[t].price = newOrderOptions[m].price;
                                    }
                                }
                            }
                        }   
                    }
                }
            }else{
                scope.cartDatas=[];
            }
            //cart is empty
            scope.isEmpty = true;
            scope.isPlaceOrder = true;
            scope.menuItemCount = {};
            scope.addCartItem = function (data, hasAccessory) {
                //包含辅料
                if (hasAccessory) {
                    for (var i = 0, len = scope.cartDatas.length; i < len; i++) {
                        if (scope.cartDatas[i].key == data.key && scope.cartDatas[i].selectId == data.selectId) {
                            scope.cartDatas[i].quantity +=data.quantity ;
                            for (var j = 0, oLen = scope.cartDatas[i].options.length; j < oLen; j++) {
                                scope.cartDatas[i].options[j].quantity =scope.cartDatas[i].quantity;
                            }
                            return false;
                        }
                    }
                    scope.cartDatas.push(data);
                } else {
                    for (var i = 0, len = scope.cartDatas.length; i < len; i++) {
                        if (scope.cartDatas[i].key == data.key) {
                            scope.cartDatas[i].quantity += data.quantity;
                            return false;
                        }
                    }
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
                }
                if (scope.grid_locationId == "") {
                    scope.isPlaceOrder=true;
                }
                scope.createOrderBtnName = buildCreateOrderBtnName(sendMonty,total,isEmpty);
                scope.total = total + scope.deliveryCost;
                if(obj.length > 0 ){
                    if(cache.judgeMode()){
                        cache.setValue(formatRestaurantId, angular.toJson(obj));
                    }
                }else{
                    if(cache.judgeMode()){
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
            //计算每个订单的总金额
            var priceObj={};
            for (var i = 0, len = data.length; i < len; i++) {
                    //item price
                    var allprice= 0,ordero=data[i];
                    for( var t=0;t<ordero.items.length;t++){
                        var orderItem=ordero.items[t];
                        allprice += orderItem.quantity * orderItem.menu_price;
                        for (var j = 0, oLen = orderItem.options.length; j < oLen; j++) {
                            //accessory price
                            allprice += orderItem.quantity * orderItem.options[j].option_price;
                        }
                        for (var f = 0, oLen = orderItem.additions.length; f < oLen; f++) {
                            //accessory price
                            allprice += orderItem.quantity * orderItem.additions[f].price;
                        }
                        priceObj[ordero.order_id]=allprice;
                    }
            }
            scope.allPrice=priceObj;
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
                            if (d.status = 'ok' && d.order_id) {
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

app.directive("orderId", ['commonApi',function (commonApi) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
           var key = attrs['orderid'];
            elem.on('click', function () {
                if (scope.grid_locationId == "") {
                    scope.$emit('show-search-address');
                    return false;
                }
                if(!scope.canProcessOrder){
                    scope.$emit('restaurant-rest');
                    return false;
                }
                var options_sets = scope.orderObj[key];
                if(options_sets.length<=0){
                    return false;
                }
                if(commonApi.isIE.ie8() || commonApi.isIE.ie9()){
                        scope.ordermenuClick(scope.orderObj[key]);
                }else{
                    var elemObj= document.createElement("span");
                    elemObj.className="badge";
                    elemObj.innerHTML = "&nbsp;";
                    elemObj.style.position = 'absolute';
                    
                    var oA = elem[0];
                    var oli=oA.parentNode.parentNode;
                    var oAleft=oA.offsetLeft;
                    var oAtop=oA.offsetTop;
                    var olleft=oli.offsetLeft;
                    var oltop=oli.offsetTop;
                    elemObj.style.marginRight="20px";
                    elem[0].appendChild(elemObj);
                    var parabola = funParabola(elemObj, target, {
                        curvature: 0.003,
                        speed: 400,
                        complete: function () {
                            scope.ordermenuClick(scope.orderObj[key]);
                            elemObj.style.display = "none"
                            scope.$apply();
                        }
                    }).mark();
                    parabola.init(); 
                }
            });
            if(!commonApi.isMobile.any()){
                if(!commonApi.isMobile.any()){
                    elem.on("mouseover",function(e){
                        if(angular.element(this).hasClass("eatingBtn")){
                            var $this = angular.element(this);
                            $this.addClass("eating-btn-hover");
                            return false;
                        }
                    }).on("mouseout",function(){
                        angular.element(this).removeClass('eating-btn-hover');
                        return false;
                    })
                }
            }
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

app.directive('personSex',function(){
    return {
        restrict:"C",
        link:function(scope,elem,attrs){
            var random=function(){
                var num=Math.random()*3;
                return Math.ceil(num);
            }
            angular.element(elem).addClass("person-sex"+random());
        }
    }
});
app.directive("orderItem",['commonApi',function(commonApi){
    return{
        restrict:'A',
        link: function(scope,elem,attrs){
            if(!commonApi.isMobile.any()){
                elem.on("mouseover",function(e){
                    var $this = angular.element(this);
                    $this.addClass("order-body-item-hover");
                    return false;
                }).on("mouseout",function(){
                    angular.element(this).removeClass('order-body-item-hover');
                    return false;
                })
            }

            elem.on('click', function () {
                if(attrs['accessorykey']){
                    if (scope.grid_locationId == "") {
                        scope.$emit('show-search-address');
                        return false;
                    }
                    if(!scope.canProcessOrder){
                        scope.$emit('restaurant-rest');
                        return false;
                    }
                    if(commonApi.isIE.ie8() || commonApi.isIE.ie9()){
                         scope.menuClick(scope.accessoryObj[attrs['accessorykey']],attrs['itemnum']);
                    }else{
                        var elemObj= document.createElement("span");
                        elemObj.className="badge";
                        elemObj.innerHTML = "&nbsp;";
                        elemObj.style.position = 'absolute';
                        elemObj.style.marginLeft="150px";
                        var oA = elem[0];
                        var oli=oA.parentNode.parentNode;
                        var oAleft=oA.offsetLeft;
                        var oAtop=oA.offsetTop;
                        var olleft=oli.offsetLeft;
                        var oltop=oli.offsetTop;
                        elem[0].appendChild(elemObj);

                         var parabola = funParabola(elemObj, target, {
                            curvature: 0.003,
                            speed: 400,
                            complete: function () {
                                scope.menuClick(scope.accessoryObj[attrs['accessorykey']],attrs['itemnum']);
                                elemObj.style.display = "none"
                                scope.$apply();
                            }
                        }).mark();
                        parabola.init();
                    }
                }
            });
        }
    };
}]);