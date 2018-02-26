var bodyCtrl = (function(window){
    var scope = null,
        $interval = null,
        mapApi = null,
        ajaxData = null,
        cache = null,
        getStreet = function(val) {
            scope.searchBtnName = '查找地址中...';
            scope.searchBtnDisabled = true;
            mapApi.byKeywords(val, scope.city_name).then(function (data) {
                scope.searchResultIsShow = false;
                if (data && data.list && data.list.length > 0) {
                    scope.isNotFindStreet = false;
                    scope.shreets = data.list;
                    scope.addressShow = true;
                } else {
                    scope.isNotFindStreet = true;
                }
                scope.searchBtnName = '查找餐厅';
                scope.searchBtnDisabled = false;
            })
        };
        arrayIndex=function(index,obj){
            if(typeof obj=="object"){
                var indexNum=0;
                for(var i=1;i<=obj.length;i++){
                    if(obj[i-1]==index){
                        indexNum=i;  
                        return indexNum;
                    }
                }
            }
        }
    return {
        init : function(_scope,_$interval,_mapApi,_ajaxData,_cache){
            scope = _scope;
            $interval = _$interval;
            mapApi = _mapApi;
            ajaxData = _ajaxData;
            cache = _cache;
            scope.searchBtnName = '查找餐厅';
        },
        searchAddress : function(){
            scope.datas = [];
            scope.addressShow = false;
            scope.keyword = '';
            scope.keywordChange = function (data) {
                data = data && data.list;
                if (data && data.length > 0) {
                    scope.searchResultIsShow = true;
                    scope.datas = data;
                }
            };
            scope.searchResultSelect = function (index) {
                getStreet(scope.datas[index]);
            };
            scope.searachRestaurant = function () {
                getStreet(scope.keyword);
            }

            scope.resetStreet = function () {
                scope.addressShow = false;
                scope.keyword = '';
                scope.autocompleteFocus();
            }
            scope.resultClick = function (list) {
                if(!list){return false;}
                var loactionUrl = '/restaurants/000000/';
                var get_grid_location_data = {
                    lat: list.y,
                    lng: list.x,
                    description: list.name,
                    street: '',
                    street_number: '',
                    xstreet: ''
                };
                ajaxData.getGridLocationId(get_grid_location_data).then(function (grid_location_id) {
                    scope.keyword = '';
                    //记录历史记录
                    if(cache.judgeMode()){
                        var city=cache.getValue("city_name")||angular.lowercase(document.getElementById("cityName").getAttribute("cityName"));
                        var history_adress=angular.fromJson(cache.getValueJson("_"+city+"_adress"))||[];
                        var adressArr=[],adressObj={};
                        if(history_adress){
                            var typeObj=arrayIndex(get_grid_location_data.description,history_adress);
                            if(history_adress.length>=5){
                                if(!typeObj){
                                    history_adress.pop();
                                    history_adress.unshift(get_grid_location_data.description);
                                }else{
                                    history_adress.splice(typeObj-1,1);
                                    history_adress.unshift(get_grid_location_data.description);
                                }
                            }else{
                                if(!typeObj){
                                    history_adress.unshift(get_grid_location_data.description);
                                }else{
                                    history_adress.splice(typeObj-1,1);
                                    history_adress.unshift(get_grid_location_data.description);
                                }
                            }
                            cache.setValueJson("_"+city+"_adress",history_adress);
                        }else{
                            adressArr[0]=get_grid_location_data.description;
                            cache.setValueJson("_"+city+"_adress",adressArr);
                        }
                    }
                  window.location = loactionUrl.replace('000000', grid_location_id);
                });
            }
        },
        changeCity : function(){
            scope.isKeywordChange = true;
            scope.setCityAndRedirect = function (city_name, redirect_url) {
                cache.setValue('city_name', city_name);
                window.location = redirect_url;
            }
            scope.hostAreaClick = function (address) {
                scope.isKeywordChange = false;
                scope.keyword = address;
                getStreet(address);
                setTimeout(function () {
                    scope.isKeywordChange = true;
                    scope.$apply();
                }, 1000)
            }
        },
        listenEvent : function(){
            scope.$on("merchants-success", function () {
                scope.merchantsShow = false;
                scope.requestSuccess = true;
            })
            scope.$on("merchants-error", function () {
                scope.requestError = true;
            })
            scope.$on("change-city-cancel", function () {
                scope.welcomeDh = false;
                window.location.href = 'shanghai';
            })
            scope.$on("merchant-hide",function(){
                scope.merchantsShow = false;
            })
        }
    }
})(window);
app.config(['$interpolateProvider',function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);

app.controller("bodyCtrl", ["$scope", "$interval", "mapApi", "ajaxData", "$timeout", "cache",
                                    function (scope, $interval, mapApi, ajaxData, timeout, cache) {
    bodyCtrl.init(scope,$interval,mapApi,ajaxData,cache);
    timeout(function () {
        scope.welcomeDh = true;
    }, 0);
    scope.keyword = '';
    /*address search*/
    bodyCtrl.searchAddress(scope,mapApi,ajaxData);
    //change city
    bodyCtrl.changeCity(scope,cache);
    /*callback*/
    bodyCtrl.listenEvent(scope);
    loginObj.init(scope,$interval).bind();
}]);
app.controller("merchantCtrl", ["$scope", "formVaildate", "$http","commonApi", function (scope, fem, http,commonApi) {
/*    scope.citys = commonApi.merchantData.citys;
    scope.zones = commonApi.merchantData.zones;
    scope.city = scope.citys[0];
    scope.zone = scope.zones[scope.city];
    scope.area = scope.zone[0];
    scope.zoneSelect=true;
    scope.cityChange = function () {
        scope.zone = scope.zones[scope.city];
        alert(scope.city)
        alert(scope.zone.length)
       if(scope.city=="请选择城市"){
             scope.zoneSelect=true;
        }else{
           scope.zoneSelect=false;
        }
        scope.area = scope.zone[0];
    }*/
    scope.merchantSubmit = function () {
        var vaildate = true;
        var mes = fem.vaildate.empty(scope.merchants.name);
        if (mes) {
            scope.merchants.nameMessage = "商户名称不能为空";
            vaildate = false;
        } else {
            scope.merchants.nameMessage = ''
        }
        mes = fem.vaildate.city(scope.city);
        if(mes){
            scope.merchants.cityMessage = "所属城市不能为空";
            vaildate = false;
        }else{
             scope.merchants.cityMessage = "";
        }
        mes = fem.vaildate.empty(scope.merchants.username);

        if (mes) {
            scope.merchants.usernameMessage = "联系人名称不能为空";
            vaildate = false;
        } else {
            scope.merchants.usernameMessage = ''
        }
        mes = fem.vaildate.username(scope.merchants.phone);
        scope.merchants.phoneMessage = mes;
        if (mes !== '') {
            vaildate = false;
        }
        if (vaildate) {
            var data = {
                merchants_name: scope.merchants.name,
                merchants_city: scope.city,
                merchants_zone: scope.area,
                shopkeeper_name: scope.merchants.username,
                shopkeeper_phone: scope.merchants.phone
            }
            http({method: 'GET',url: '/ajax/merchants/',params : data}).
                success(function (d) {
                    if (d != 'failed') {
                        scope.$emit('merchants-success');
                    } else {
                        scope.$emit('merchants-error');
                    }
                }).
                error(function () {
                    scope.$emit('merchants-error');
                })
        }
    }
    scope.merchantCancel = function () {
        scope.$emit('merchant-hide');
    }
}])
app.controller("citySelectorCtrl", ['$scope', 'cache', function (scope, cache) {
   scope.changeCurrentCity = function (index) {
        scope.current_city_en = scope.citysObj[index].id;
        scope.current_city = scope.citysObj[index].text;
    }
    scope.citysObj = citysObj;
    scope.currentIndex = 0;
    scope.changeCurrentCity(0);
    scope.changeCitySubmit = function (index) {
        scope.changeCurrentCity(index);
        cache.setValue('city_name', scope.current_city_en);
        window.location = '/' + scope.current_city_en;
    }
    scope.changeCityCancel = function () {
        scope.$emit('change-city-cancel');
    }
}]);
app.directive('ngInitial', function() {
  return {
    restrict: 'A',
    controller: [
      '$scope', '$element', '$attrs', '$parse', function($scope, $element, $attrs, $parse) {
        var getter, setter, val;
        val = $attrs.ngInitial || $attrs.value;
        getter = $parse($attrs.ngModel);
        setter = getter.assign;
        setter($scope, val);
      }
    ]
  };
});
//选择城市 延迟处理
app.directive('dropdownBox', ['$timeout',function(timeout) {
  return {
    restrict: 'C',
    link : function(scope,elem,attrs){
        var timer=null;
        var $dropdownMenu=elem.children()[1];
        elem.on("mouseover" , function(){
            if(timer){
                timeout.cancel( timer );
            }
            $dropdownMenu.style.display = "block";
        });
        elem.on("mouseout" , function(){
            timer=timeout(function(){
                $dropdownMenu.style.display = "none";   
            },400);
        });
    }
  };
}]);

app.directive("autocomplete", ["$timeout", 'mapApi','cache', function (timeout, mapApi,cache) {
    return{
        restrict: "A",
        link: function (scope, elem) {
            var currentTimeout = null , menuListCount = 0;
            scope.$watch("keyword", function (val) {
                if (scope.isKeywordChange) {
                    val = val && val.replace(/(^\s*)|(\s*$)/g, "");
                    if (!val || (val.length < 2)) {
                        scope.searchResultIsShow = false;
                        scope.datas = [];
                        return false;
                    }
                    if (currentTimeout) {
                        timeout.cancel(currentTimeout);
                    }
                    /*elem.addClass("loading");*/
                    currentTimeout = timeout(function () {
                        mapApi.inputPrompt(val, scope.city_name).then(function (data) {
                            /*elem.removeClass("loading");*/
                            try{menuListCount = data.list.length - 1;}catch(e){menuListCount=null}
                            scope.keywordChange(data);
                        });
                    }, 300);
                }
            });
            scope.autocompleteFocus = function () {
                elem[0].focus();
            }
            elem.on("keypress", function (e) {
                if (e.keyCode == 13) {
                    if(!isNaN(scope.currentActiveIndex) && scope.currentActiveIndex != -1){
                        scope.searchResultSelect(scope.currentActiveIndex)
                    }else{
                        scope.searachRestaurant();
                    }
                    scope.currentActiveIndex = -1;
                }
            }).on("keydown",function(e){
                var code = e.keyCode , currentActiveIndex = 0;
                if(menuListCount != null && (code == 40 || code == 38)){
                    if(isNaN(scope.currentActiveIndex)){
                        currentActiveIndex = -1;
                    }else{
                        currentActiveIndex = scope.currentActiveIndex;
                    }
                    if(code == 38){
                        currentActiveIndex -= 1;
                        currentActiveIndex = currentActiveIndex < 0 ? menuListCount : currentActiveIndex;
                    }else if(code == 40){
                        currentActiveIndex += 1;
                        currentActiveIndex = currentActiveIndex > menuListCount ? 0 : currentActiveIndex;
                    }
                    scope.currentActiveIndex = currentActiveIndex;
                    scope.$apply();
                    e.preventDefault();
                    e.returnValue = false;
                }
            }).on('focus',function(){
                setTimeout(function(){
                    if(cache.judgeMode()){
                        if(elem.val()==""){
                            var city=cache.getValue("city_name")||angular.lowercase(document.getElementById("cityName").getAttribute("cityName"));
                            var history_adress=angular.fromJson(cache.getValueJson("_"+city+"_adress"));
                            if(history_adress){
                                scope.searchResultIsShow=true;
                                scope.datas=history_adress;
                                scope.$apply();
                            }
                        }
                    }
                },100);
            });
            elem.next().on("mouseover",function(){
                angular.element(this).children().removeClass("active");
                scope.currentActiveIndex = -1;
            })
            angular.element(document).on('click', function (e) {
                if (e.target.className.indexOf('search-result-box') != -1||e.target.className.indexOf('search-input') != -1) {
                    return false;
                }
                scope.searchResultIsShow = false;
                scope.$apply();
            })
        }
    }
}]);
app.directive("cityChange",["commonApi",function(commonApi){
    return {
        restrict:"C",
        scope: {
            model: '=',
            areaModel: '='
        },
        "link":function(scope,elem,attrs){
             var zones = commonApi.merchantData.zones;
            var citys = commonApi.merchantData.citys,
                html = "",
                zone = [],
                zoneHtml = "",
                areaObj= window.document.getElementById("areaSelect");
                scope.model = "请选择城市";
                scope.areaModel = "";
            for (var item in citys) {
                html += '<option value="' + citys[item] + '">' + citys[item] + '</option>';
            }
            elem.append(html);
            var option = new Option(zones[citys[0]][0], zones[citys[0]][0]);
            areaObj.options[0] = option;
            areaObj.disabled=true;
            elem.on('change', function() {
                var val = this.value;
                scope.model = val;
                zone = zones[val];
                if (val =="请选择城市"){
                    areaObj.disabled=true;
                }else{
                    areaObj.disabled=false;
                }
                zoneHtml = "";

                zone = zones[val];
                areaObj.options.length=0;
                for (var item in zone) {
                    var option = new Option(zone[item], zone[item]);

                    areaObj.options[item] = option;

                }
                 scope.areaModel = zone[0];
            })

            angular.element(areaObj).on('change', function() {
                scope.areaModel = this.value;
            })





            //scope.zones =
        }
    }
}]);
app.directive("hotArea", ['cache',function (cache) {
    return{
        restrict: 'C',
        link: function (scope, elem, attrs) {
            var manually = manually_locations;
            elem.on('click', function (e) {
                var target = e.target,$this = angular.element(target) , html = "" , h3 = '';
                if (target.nodeName == 'A' && target.className == 'back') {
                    elem.removeClass("location");
                    h3 = '<h3 class="fl"><span>' + scope.city_name + '</span></h3>';
                    for (var i = 0; i < manually.length; i++) {
                        var obj = manually[i]
                        html += '<li data-index="' + (i + 1) + '">' + obj.district_name + '</li>';
                    }
                    elem.html(h3 + '<ul>' + html + '</ul>');
                }else if (target.nodeName == 'A' && target.className == 'location-name') {
                    var obj = {};
                    obj[target.href] = $this.text();
                    if(cache.judgeMode()){
                        cache.setValue("tmpLocationName",angular.toJson(obj));
                    }
                }
                if (target.nodeName == 'LI') {
                    elem.addClass("location");
                    var index = $this.attr('data-index');
                    if (!isNaN(index) && manually[index - 1]) {
                        var locations = manually[index - 1].name_with_urls;
                        if (locations) {
                            h3 = '<h3 class="fl"><span class="active"><i class="icon arrow-icon"></i>' +
                                '<a class="back" href="javascript:;">' + scope.city_name + '</a></span><span class="district-arrow"> > </span>' +
                                '<span>' + manually[index - 1].district_name + '</span></h3>';
                            for (var i = 0; i < locations.length; i++) {
                                var arr = locations[i]
                                html += '<li><a class="location-name" target="_blank" href="' + arr[1] + '">' + arr[0] + '</a></li>';
                            }
                            elem.html(h3 + '<ul>' + html + '</ul>');
                        }
                    }
                }
            })
        }
    }
}])
app.directive("iphone5Img",["commonApi",function(commonApi){
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            elem.next().removeClass("disnone");
            if(!commonApi.isMobile.any()){
                elem.on('mouseover',function(){
                    elem.addClass("hover")
                }).on("mouseout",function(){
                    elem.removeClass("hover")
                })
            }else{
                elem.on('click',function(){
                    elem.toggleClass("hover")
                })
            }
        }
    }
}]);
app.directive("indexBanner",["cache",function(cache){
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            var elemObj=angular.element(elem)[0];
            var bigImg=elem.children()[0];
            var smallImg=elem.children()[1];
            var closeBtn=elem.children()[2];
            var url=window.document.getElementById("cacheImg").getAttribute("src");
            if(cache.judgeMode()){
                var city=cache.getValue("city_name")||angular.lowercase(document.getElementById("cityName").getAttribute("cityName"));

                if( cache.getValue(city+"_bannerCache")!=""&&cache.getValue(city+"_bannerCache")!=null){
                    if(url==cache.getValue(city+"_bannerCache")){
                        return false;
                    }else{
                         startMove(elemObj,{height:"200"},function(){
                          setTimeout(function(){
                               startMove(elemObj,{height:"40"},function(){
                                   bigImg.style.display="none";
                                   smallImg.style.display="block";
                               },"",10);
                           },2500);
                       },"",10);
                    }
                }else{
                     startMove(elemObj,{height:"200"},function(){
                          setTimeout(function(){
                               startMove(elemObj,{height:"40"},function(){
                                   bigImg.style.display="none";
                                   smallImg.style.display="block";
                               },"",10);
                           },2500);
                       },"",10);
                }
                angular.element(closeBtn).on("click",function(){
                    elemObj.style.display="none";
                    cache.setValue(city+"_bannerCache",url);
                });
            }
        }
    }
}]);



