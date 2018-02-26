app.config(['$interpolateProvider',function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
}]);
app.controller('bodyCtrl',["$scope",'mapApi',function(scope,mapApi){
    scope.city_name = '上海'
    scope.selectedResult = function(text){
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
    scope.resetStreet = function(){
        scope.addressShow = false;
        scope.$broadcast("clear-keyword","");
    }

    //list tabs
    scope.tabsAction=function(type){
       scope.tabsAction1=false;
       scope.tabsAction2=false;
       scope.tabsAction3=false;
       scope["tabsAction"+type]=true;
    }
    
}]);
app.controller("searchAddressCtrl",["$scope",function(scope){
    scope.$on("clear-keyword",function(data){
        scope.keyword = '';
    })
}])
app.directive("restaurantItem",function(){
    return{
        restrict:'C',
        link: function(scope,elem,attrs){
            elem.on('click',function(){
                var $div = elem.children()[0] ,
                    oA = angular.element($div).children()[0];
                oA.target = '_black';
                oA.click();
                //location.href = oA.href;
            })
        }
    };
});
