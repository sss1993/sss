app.directive("navRightCollect",["$rootScope","commonApi","$window",'$http',function(rootScope, commonApi,window,http){
    return{
        restrict:'C',
        link: function(scope,elem,attrs){
            var collectError = function(msg){
                scope.errorMsg = msg;
                scope.errorIcon = 'error';
                isCollect = true;
                scope.$emit('collect-callback');
            }
            var collectSuccess = function(collectMsg,collectMsgText,oTarget,isCancel){
                var title = '取消收藏餐厅',
                    msg = '取消收藏',
                    msgText="已收藏",
                    className = 'collect';
                if(isCancel){
                    title = '已收藏餐厅';
                     msgText="未收藏";
                    msg = '收藏成功';
                    className = 'collect not-collect';
                }
                collectMsg.addClass('active');
                collectMsgText.text(msgText);
                startMove(collectMsg[0],{'opacity':0,bottom:45},function(){
                    collectMsg.text(msg).removeAttr('style').toggleClass('collect-success cancel-collect active');
                    isCollect = true;
                },null,10);
                oTarget.title = title;
                oTarget.className = className;
            }
            var isCollect = true;
            elem.on('click',function(e){
                var oTarget = e.target , collectMsg = angular.element(oTarget).next() ,collectMsgText=angular.element(oTarget).next().next(), rid = angular.element(oTarget).attr('data-rid');
               // collectSuccess(collectMsg,collectMsgText,oTarget);
                if(oTarget.nodeName == 'DIV' && oTarget.className.indexOf('collect') != -1 && rid){
                    if(isCollect){
                        if(scope.loginInfo){
                            isCollect = false;
                            var url = favoriteUrl.replace('/0/','/' + rid + '/');
                            if(oTarget.className.indexOf('not-collect') != -1){
                                http.put(url).success(function(d){
                                    if(d.status == 'ok'){
                                        collectSuccess(collectMsg,collectMsgText,oTarget);
                                    }else{
                                        collectError(d.failed_msg);
                                    }
                                }).error(function(){
                                    collectError('未知错误，请稍后在重试。');
                                })
                            }else{
                               http['delete'](url).success(function(d){
                                    if(d.status == 'ok'){
                                        collectSuccess(collectMsg,collectMsgText,oTarget,true);
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
                }
                e.preventDefault();
                e.returnValue = false
            })
        }
    };
}]);
app.directive("reviewOrder",["commonApi","$window",'$http',function(commonApi,window,http){
    return{
        restrict:'C',
        link:function(scope,elem,attrs){
            var detailKey=elem.attr('detailKey');
            var next=elem.next();
            var ajaxReg=true;
            var ajaxFunc=function(){
                    scope.loadError[detailKey]=false;
                    next.css("display","block");
                   if(!elem.attr('detailKey')){
                        return false;
                    }
                    if(ajaxReg){
                       ajaxReg=false;
                       http.get("/ajax/get_dish_names_by_detail_key/?detail_key=" + detailKey).success(function (d) {
                            if (d && d.code == 0) {
                                scope.loadStatus[detailKey]=true;
                                scope.menuItenmenus[detailKey]=d.dish_names;
                                elem.removeAttr('detailKey');
                            } else {
                               ajaxReg=true;
                               scope.errorText="访问服务器错误，请重试！";
                               scope.loadStatus[detailKey]=true;
                               scope.loadError[detailKey]=true;
                            }
                        }).error(function (d) {
                           ajaxReg=true;
                           scope.errorText="访问服务器错误，请重试！";
                            scope.loadStatus[detailKey]=true;
                            scope.loadError[detailKey]=true;
                        });
                    }
                }
                

            if(commonApi.isMobile.any()){
                next.addClass("api");
                var close = next[0].lastElementChild;
                close.style.display = 'block';
                close.onclick = function(){
                    next.css("display","none");
                }
                elem.on("click",function(){
                    var menuInfos = document.getElementsByClassName('order-menu-info');
                    for(var i = 0, len = menuInfos.length; i < len; i++){
                        menuInfos[i].style.display = 'none';
                    }
                   ajaxFunc();
                })
            }else{
              elem.parent().on("mouseover",function(e){ 
                       ajaxFunc();  

                }).on("mouseout",function(){
                     elem.next().css("display","none");
                });  
            }
            
        }
    };
}]);
