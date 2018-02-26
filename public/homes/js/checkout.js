var bindModule = (function(){
    var scope = {},
        http = {},
        cache = {},
        requestData = {},
        totalPrice = 0 ,
        interval = {},
        intervalId = null,
        updateForm = function(addressObj){
            scope.name = addressObj.customer_name;
            scope.address = addressObj.delivery_address;
            scope.phone = addressObj.customer_phone;
        },
        copyAddressData  = function(index){
            scope.currentSelectedAddress = angular.copy(scope.userAddressList[index]);
            scope.currentSelectedAddress['index'] = index;
        },
        setLastAddr = function() {
            var activeAddrId = '';
            var url = '';
            if (!scope.userAddressList) {
                return;
            }
            if (!_isAuthenticated) {
                return;
            }
            for (var i = 0, len = scope.userAddressList.length; i < len; ++i) {
                if (scope.userAddressList[i].active) {
                    activeAddrId = scope.userAddressList[i].id;
                }
            }
            if (activeAddrId) {
                url = setLastAddrUrl.replace('/0/','/' + activeAddrId + '/');
                http.post(url);
            }
        };
    return {
        init : function(_scope,_http,_cache,_requestData,_interval,_postJson){
            scope = _scope;
            http = _http;
            cache = _cache;
            requestData = _requestData;
            interval = _interval;
            postJson = _postJson;
        },
        bindCoupon : function(){
            scope.submitCoupon = function(){
                if(scope.couponForm.$valid){
                    totalPrice = scope.orderTotal;
                    scope.couponErrorMessage = "";
                    scope.submitBtnDisabled = true;
                    scope.couponCheck=false;
                    http.post(check_coupon_url,{coupon_code : scope.couponCode, email : '', phone : scope.phone})
                        .success(function(d){
                            if(d.status == 'ok'){
                                var validCoupon = parseFloat(d.threshold) - parseFloat(scope.orderTotal);
                                if(validCoupon > 0){
                                    scope.couponErrorMessage = (d.threshold - scope.orderTotal) < 0 ? '' : ('您的订单金额不足' + d.threshold + '元，无法使用本优惠券。');
                                }else{
                                    var orderTotal = totalPrice - parseFloat(d.discount);
                                    scope.coupon_code = scope.couponCode;
                                    scope.isVaildateCouponSuccess = true;
                                    scope.orderTotal = orderTotal >= 0 ? orderTotal : 0;
                                    scope.couponMoney = parseFloat(d.discount);
                                    scope.couponStatus = false;
                                    scope.couponDisabled = true;
                                }
                            }else{
                                scope.couponErrorMessage = d.failed_msg;
                            }
                            scope.submitBtnDisabled = false;
                            scope.couponCheck=true;
                        })
                        .error(function(){
                            scope.couponErrorMessage = '访问异常，请稍后再试。';
                        })
                }else{
                    scope.couponErrorMessage = '优惠码不能为空。';
                }
            }
            scope.cancelCoupon = function(){
                scope.couponStatus = true;
                scope.couponDisabled = false;
                scope.isVaildateCouponSuccess = false;
                scope.orderTotal = totalPrice;
                scope.couponCode = "";
                scope.coupon_code = "";
            }
        },
        commitOrder : function(){
            scope.captchaMsgCountdown = function () {
                interval.cancel(scope.intervalMesId);
                var i = 59;
                scope.msgCaptchaVal =  i + '秒后可获取';
                scope.msgCaptchaDisabled = true;
                scope.intervalMesId = interval(function () {
                    scope.msgCaptchaVal = (i--) + '秒后可获取';
                    if (i <= 0) {
                        scope.msgCaptchaVal = '获取验证码';
                        scope.msgCaptchaDisabled = false;
                        interval.cancel(scope.intervalMesId);
                    }
                }, 1000);
            }
            scope.sendSMSCode = function(success, error) {
                    postJson(ajax_common_sms_code, {"request_type": "validate_order_mobile"}).success(function(d) {
                        if (d.status == 'ok') {
                            angular.isFunction(success) && success(d);
                        } else {
                            angular.isFunction(error) && error(d);
                        }
                    }).error(function(d) {
                        angular.isFunction(error) && error(d);
                    })
                }
            scope.getMsgCaptcha = function(){
                scope.captchaMsgCountdown();
                scope.sendSMSCode(null, function(d) {
                    scope.msg.captchaMessage = d.failed_msg;
                });
                return false;
            }
            //验证是否要短信验证 需要发送短信，不需要直接下单
            scope.locationMessage = function () {
                postJson(ajax_is_order_need_sms_validate,{"mobile": scope.phone}).success(function(d){
                    if(d.status == 'ok'){
                        if(d.need_validate == true){
                            scope.msgReg = true;
                            scope.mesDialogShow();
                        }else{
                            scope.commitedOrder();
                        }
                    }else{
                        scope.showError = true;
                        scope.errorMsg = d.failed_msg;
                    }
                }).error(function(d){
                    scope.showError = true;
                    scope.errorMsg = "请求失败，请重试。";
                });
            }
            scope.mesDialogShow = function () {
                scope.msg = {};
                scope.msgPhone = scope.phone;
                scope.msgCaptchaVal = '获取验证码';
                scope.msgCaptchaDisabled = true;
                interval.cancel(scope.intervalMesId);
                scope.imgCaptchaIsDisabled = true;
                scope.getMsgCaptcha();
            }
            //验证短信码 验证成功下单
            scope.submitMsg = function(){
                postJson(ajax_common_validate_sms_code,{ "request_type":"validate_order_mobile","sms_code":scope.msg.captcha})
                .success(function(d){
                    if(d.status == 'ok'){
                        scope.msgReg = false;
                        scope.commitedOrder();
                        interval.cancel(scope.intervalMesId);
                    }else{
                        scope.msg.captchaMessage = d.failed_msg;
                    }
                }).error(function(d){
                    scope.showError = true;
                    scope.errorMsg = "请求失败，请重试。";
                })
            }

            scope.commitOrder = function(){
                if(scope.orderForm.$invalid){
                    scope.orderForm.submit = true;
                }else{
                    //判断在线支付服务是否挂了
                    if(scope.payType == undefined){
                        scope.showError = true;
                        scope.errorMsg = '在线服务暂时不可用,请稍后再试';
                        return false;
                    }
                    //判断在线支付 订单总金额是否为0元
                    if(scope.orderTotal <= 0){
                        if(scope.payType){
                            scope.showError = true;
                            scope.errorMsg = '订单金额为0元时不能选择在线支付，请选择其他付款方式';
                            return false;
                        }
                    }
                    //判断是否为在线支付 有没有登录
                    if(scope.payType){
                        if(!scope.loginInfo){
                            scope.logoinDialogShow();
                            return false;
                        } 
                    }
                    scope.locationMessage();
                }
            }
            scope.commitedOrder = function(){
                
                    scope.commitCheck=false;
                    setLastAddr();
                    var selectedObj = scope.selectObj[scope.datetimeIndex];
                    var placeOrderData = {
                        order_id : orderId,
                        grid_location_id : grid_locationId,
                        order_source : 'desktop',
                        customer_name : scope.name || "" ,
                        mobile_number : scope.phone || "",
                        email_address : '',
                        delivery_address : scope.address || "",
                        xstreet : '',
                        comment : scope.comment || "",
                        coupon_code : scope.coupon_code || '',
                        preorder : selectedObj.id == 'no' ? 'no' : 'yes',
                        preorder_date : selectedObj.date,
                        preorder_time : selectedObj.id == 'no' ? '18:00' : selectedObj.id,
                        pay_type : scope.payType ? 'alipay' : 'cash'
                    }
                    scope.showFullLoading = true;
                    if(scope.userAddressList.length == 0){
                        requestData.firstAdd({
                            customer_name : placeOrderData.customer_name,
                            delivery_address:placeOrderData.delivery_address,
                            customer_phone:placeOrderData.mobile_number
                        })
                    }
                    http.post(place_order_url,placeOrderData)
                        .success(function(d){
                            if(d.status == 'ok' && d.order_id){
                                if(cache.judgeMode()){
                                    try{
                                        gaFunc(cart_items_json,placeOrderData.pay_type);
                                    }catch(e){}
                                    
                                    cache.removeItem(cache.buildCacheKey(restaurantId));
                                    setTimeout(function(){
                                        scope.commitCheck=true;
                                        locationConfirm(placeOrderData.pay_type);
                                    },2000)
                                }else{
                                    scope.commitCheck=true;
                                    locationConfirm(placeOrderData.pay_type);
                                }
                            }else{
                                scope.commitCheck=true;
                                if(d.failed_code==7006){
                                    scope.couponConfirm=true;
                                    scope.couponConfirmMsg=d.failed_msg;
                                    scope.showFullLoading = false;
                                }else{
                                    scope.showFullLoading = false;
                                    scope.showError = true;
                                    scope.errorMsg = d.failed_msg;
                                }
                            }      
                        })
                        .error(
                            function(){
                                scope.commitCheck=true;
                                scope.showFullLoading = false;
                                scope.showError = true;
                                scope.errorMsg = '访问异常，请稍后再试。';
                            }
                        )
            }
        },
        bindUserAddress : function(){
            scope.couponCheck=true;
            scope.commitCheck=true;
            scope.updateUserAddress = function(index){
                copyAddressData(index);
                scope.$broadcast("update-user-address");
                scope.editUserAddress = true;
            }
            scope.deleteUserAddress = function(index){
                copyAddressData(index);
                if(scope.currentSelectedAddress ){
                    scope.confirmMsg = '确认要删除吗?';
                    scope.confirm = true;
                }
            }
            scope.addUserAddress = function(){
                scope.editUserAddress = true;
                scope.$broadcast("add-user-address");
            }
            scope.submitConfirm = function(){
                requestData.del();
            }
            scope.errorConfirm = function(){
               scope.showError = false;
            }
            scope.submitcouponConfirm = function(){
                scope.couponConfirm = false;
                scope.cancelCoupon();
                scope.commitOrder();
            }
            scope.changeActiveAddress = function(index){
                for(var i = 0, len = scope.userAddressList.length; i < len; i++){
                    scope.userAddressList[i].active = false;
                }
                var activeAddress = scope.userAddressList[index];
                activeAddress.active = true;
                requestData.active(index);
                updateForm(activeAddress);
            }
            scope.cancelConfirm = function(){
                scope.confirm = false;
            }
            scope.cancelcouponConfirm = function(){
                scope.cancelCoupon();
                scope.couponConfirm = false;
            }
            scope.$on("update-submit-success",function(e){
                var updateObj = e.targetScope.userAddress;
                scope.userAddressList[updateObj.index] = updateObj;
                scope.editUserAddress = false;
                if(updateObj.active){
                    updateForm(updateObj);
                }
            })
            scope.$on("add-submit-success",function(e){
                var addObj = e.targetScope.userAddress;
                for(var i = 0, len = scope.userAddressList.length; i < len; i++){
                    scope.userAddressList[i].active = false;
                }
                var lastIndex = scope.userAddressList.push(addObj);
                scope.changeActiveAddress(lastIndex - 1);
                scope.editUserAddress = false;
            })
            scope.$on('cancel-user-address',function(){
                scope.editUserAddress = false;
            })
            scope.$on('request-error',function(e){
                scope.showError = true;
                scope.errorMsg = e.targetScope.errorMsg;
            })
        }
    }
})();
app.value('requestData',function(_scope , _http , _cache,_ajaxData){
    var scope = _scope, http = _http, cache = _cache ,ajaxData = _ajaxData, key = cache.buildCacheKey('delivery-address'),
        random = function(){return (Math.random()+"").substr(3)},
        clearForm = function(){
            if(scope.currentSelectedAddress.active){
                scope.name = '';
                scope.address = '';
                scope.phone = '';
            }
        };
    var request = {
        ajax : {
            get : function(func){
                ajaxData.addAllDeliveryAddress(ajax_add_all_delivery_addresses,key).then(
                    function(d){
                        func(d);
                    },
                    function(){
                        func(userAddress);
                    }
                )
            },
            firstAdd:function(data){
                http.post(ajax_add_delivery_address,data)
            },
            add : function(){
                http.post(ajax_add_delivery_address,scope.userAddress)
                .success(function(d){
                    if(d.status == 'ok'){
                        scope.userAddress.id = d.id;
                        scope.$emit("add-submit-success");
                    }else{
                        scope.errorMsg = d.failed_msg;
                        scope.$emit("request-error");
                    }
                })
                .error(function(){
                    scope.errorMsg = '未知错误，请稍后再试。';
                    scope.$emit("request-error");
                })
            },
            update : function(){
                var url = ajax_update_delivery_address.replace('/0/','/' + scope.userAddress.id + '/');
                http.post(url,scope.userAddress)
                .success(function(d){
                    if(d.status == 'ok'){
                        scope.$emit("update-submit-success");
                    }else{
                        scope.errorMsg = d.failed_msg;
                        scope.$emit("request-error");
                    }
                })
                .error(function(){
                    scope.errorMsg = '未知错误，请稍后再试。';
                    scope.$emit("request-error");
                })
            },
            del : function(){
                var url = ajax_update_delivery_address.replace('/0/','/' + scope.currentSelectedAddress.id + '/');
                http['delete'](url)
                .success(function(d){
                    if(d.status == 'ok'){
                        clearForm();
                        scope.userAddressList.splice(scope.currentSelectedAddress.index,1);
                    }else{
                        scope.showError = true;
                        scope.errorMsg = d.failed_msg;
                    }
                    scope.confirm = false;
                })
                .error(function(){
                    scope.confirm = false;
                    scope.showError = true;
                    scope.errorMsg = '未知错误，请稍后再试。';
                })
            },
            active:function(){}
        },
        local : {
            get : function(func){
                if(cache.judgeMode()){
                    var obj = cache.getValueJson(key);
                    obj = angular.isArray(obj) ? obj : [];
                    if(obj.length == 1){
                        obj[0].active = true;
                        func(obj);
                        scope.changeActiveAddress(0);
                        return false;
                    }
                    func(obj);
                    for (var i = 0, len = obj.length; i < len; i++){
                        if(obj[i].active){
                            scope.changeActiveAddress(i);
                            break;
                        }
                    }
               }else{
                    var obj = angular.isArray(obj) ? obj : [];
                    if(obj.length == 1){
                        obj[0].active = true;
                        func(obj);
                        scope.changeActiveAddress(0);
                        return false;
                    }
                    func(obj);
                    for (var i = 0, len = obj.length; i < len; i++){
                        if(obj[i].active){
                            scope.changeActiveAddress(i);
                            break;
                        }
                    }
               }
            },
            firstAdd:function(data){
                if(cache.judgeMode()){
                    cache.setValueJson(key,[data]);
                }
            },
            add : function(){
                if(cache.judgeMode()){
                    var data = cache.getValueJson(key);
                    scope.userAddress.active = false;
                    scope.userAddress.id = random();
                    data.push(scope.userAddress);
                    cache.setValueJson(key,data);
                    scope.$emit("add-submit-success");
               }
            },
            update : function(){
                if(cache.judgeMode()){
                    var data = cache.getValueJson(key);
                    scope.userAddress.id = random();
                    data[scope.userAddress.index] = scope.userAddress;
                    cache.setValueJson(key,data);
                    scope.$emit("update-submit-success");
                }
            },
            del : function(){
                if(cache.judgeMode()){
                    var data = cache.getValueJson(key);
                    data.splice(scope.currentSelectedAddress.index,1);
                    scope.userAddressList = data;
                    if(data.length == 1){
                        data[0].active = true;
                        scope.changeActiveAddress(0);
                    }
                    cache.setValueJson(key,data);
                    clearForm();
                    scope.confirm = false;
                }
            },
            active : function(index){
                if(cache.judgeMode()){
                    cache.setValueJson(key,scope.userAddressList);
                }
            }
        }
    }
    return request[_isAuthenticated];
});
app.controller('bodyCtrl',["$scope",'$http','$interval','cache','requestData','commonApi','ajaxData','postJson',function(scope,http,$interval,cache,requestData,commonApi,ajaxData,postJson){
    var requestObj = requestData(scope,http,cache,ajaxData);
    scope.isVaildateCouponSuccess = false;
    scope.couponMoney = 0;
    scope.couponErrorMessage = '';
    scope.selectObj = selectObj;
    scope.datetimeIndex = 0;
    scope.coupon_code = '';
    scope.msg = {};
    scope.couponStatus = true;
    bindModule.init(scope,http,cache,requestObj,$interval,postJson);
    bindModule.bindCoupon();
    bindModule.commitOrder();
    bindModule.bindUserAddress();
    /*user address*/
    requestObj.get(function(data){
        scope.userAddressList = data;
        for (var i = 0, len = scope.userAddressList.length; i < len; i++){
            if (scope.userAddressList[i].id == lastUsedAddressId) {
                scope.changeActiveAddress(i);
                break;
            }
        }
    });
    /*mobile*/
    scope.mobileAny=true;
    if(commonApi.isMobile.any()){
        scope.mobileAny=false;
    }

    //var reloadFunc = function(){window.location.reload()};
    loginObj.init(scope,$interval).bind();
}])
app.controller("userAddressCtrl",["$scope","$http","requestData",'cache','ajaxData',function(scope,http,requestData,cache,ajaxData){
    var isAdd = true , initForm = function(){scope.userAddressForm.submit = false;}
    var requestObj = requestData(scope,http,cache,ajaxData);
    scope.$on("update-user-address",function(e){
        initForm();
        var selectedObj = e.targetScope.currentSelectedAddress;
        scope.userAddress = selectedObj;
        isAdd = false;
    })
    scope.$on("add-user-address",function(){
        initForm();
        scope.userAddress = {};
        isAdd = true;
    })
    scope.submitUserAddress = function(){
        scope.userAddressForm.submit = true;
        if(scope.userAddressForm.$valid){
            if(isAdd){
                requestObj.add();
            }else{
                requestObj.update();
            }
        }
    }
    scope.cancelUserAddress = function(){
        scope.$emit("cancel-user-address");
    }
}]);
app.directive("userAddressList",["commonApi",function(commonApi){
    return{
        restrict:'C',
        link:function(scope,elem,attrs){
            if(commonApi.isMobile.any()){
                elem.find('span').addClass('disinbl');
            }
        }
    }
}])
function locationConfirm(payType){
    if(payType == 'alipay'){
        window.location.replace(online_pay.replace('/0/','/' + gaObj.orderId + '/')); 
    }else{
        window.location.replace(confirm_url.replace('/0/','/' + gaObj.orderId + '/'));   
    }
}
function gaFunc(cart_objects,payType){
    if (typeof(ga) != 'undefined') {
/*        ga_synchronize(function () {
            locationConfirm(payType);
        });*/
        var transactionObj ={
                'id': gaObj.orderId,                    // transaction ID
                'affiliation': gaObj.restaurantName,    // affiliation or store name
                'revenue': gaObj.order_total,            // order_total
                'shipping': gaObj.delivery_fee,          // shipping
                'tax': '0'                         // tax
            },
            cart_objects = angular.fromJson(cart_objects)||[];

        ga('ecommerce:addTransaction', transactionObj);
        for (var i = 0; i < cart_objects.length; i++) {
            var item = cart_objects[i];
            ga('ecommerce:addItem', {
                'id': transactionObj.id,                // Transaction ID. Required.
                'name': item.name,                      // Product name. Required.
                'sku': item.id,                         // SKU/code.
                'category': gaObj.main_cuisine,         // Category or variation.
                'price': item.price,                    // Unit price.
                'quantity': item.quantity               // Quantity.
            });
        }
        ga('ecommerce:send');
    }
}
