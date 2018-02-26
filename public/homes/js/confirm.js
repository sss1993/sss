app.controller('bodyCtrl',['$scope','cache',function(scope,cache){
    //积分
    try{
        var olayer=document.getElementById("layer-tip"),opoint=document.getElementById("gift-tip");
        if(olayer){
            if(cache.getValue("_giftShow")==""||cache.getValue("_giftShow")==null){
                cache.setValue("_giftShow",1);
                olayer.style.display="block";
                opoint.style.display="block";
            }
            scope.closeTip=function(){ 
                cache.setValue("_giftShow",1);
                olayer.style.display="none";
                opoint.style.display="none";
            }
        }
    }catch(e){}
}]);