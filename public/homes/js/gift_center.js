app.controller('bodyCtrl',["$scope","$timeout","$http","$interval","formVaildate",function(scope,timeout,http,$interval,fem){
    var reloadFunc = function(){window.location.reload()};
    loginObj.init(scope,$interval,reloadFunc,reloadFunc).bind();
    scope.$on("giftMessage-Cancel",function(){
        scope.giftMessageStatus = false;
    });
    scope.$on("giftMessage-callback",function(d){
        scope.giftError=true;
        scope.giftErrormMsg=d.targetScope.callbackmMsg;
    });
    scope.$on("giftMessage-true",function(d){
        scope.giftOk=true;
        scope.giftOkmMsg="恭喜您兑换成功，3个工作日左右会有超人客服联系您，请耐心等待";
        timeout(function(){window.location.reload()},500);
    });
    scope.gitGift=function(name,id){
        scope.giftMessage = {};
        scope.giftMessage.phone=userPhone;
        scope.giftId=id;
        scope.giftName=name;
        scope.giftMessageStatus=true;
    };
    scope.giftNum=giftNum;
    scope.gitDisable=function(num){
        if(parseInt(num)<=scope.giftNum){
            return false;
        }else{
             return true;
        }
    }
    scope.giftConvert=function(){
        scope.gitConvertStatus=true;
        var data={"10":"待处理","20":"成功","30":"失败"};
        http.get("/api/userpoint/exchange_history/").success(function(d){
            if(d.code==0){
                if(d.exchange_list.length>0){
                    scope.lists=[];
                    for(var i=0;i<d.exchange_list.length;i++){
                        var time=d.exchange_list[i].create_date;
                        var status=d.exchange_list[i].status;
                        var name=d.exchange_list[i].gift_name;
                        var arrObj={};
                        time=new Date(parseFloat(time)*1000);
                        arrObj.create_date=time.getFullYear()+"-"+(time.getMonth()+1)+"-"+time.getDate();
                        arrObj.status=data[status];
                        arrObj.gift_name=name;
                        scope.lists.push(arrObj);
                    }
                }else{
                    scope.lists=[];
                    scope.showHistroy=true;
                }
                var timer = timeout(function(){scope.giftHistroy=true;},10);
            }else{
               scope.giftError=true;
               scope.giftErrormMsg=d.msg; 
            }
            scope.gitConvertStatus=false;
        }).error(function(d){
           scope.giftError=true;
           scope.giftErrormMsg="访问失败，请稍后再试。";
           scope.gitConvertStatus=false;
        });

    }
}]);

app.controller('giftMessageCtr',['$scope','$http','$timeout','formVaildate',function(scope,http,timeout,fem){
    scope.giftMessageCancel = function(){
        scope.$emit("giftMessage-Cancel");
    }
    scope.userNameFocus=function(){
        scope.giftMessage.userNameMessage = "";
    }
     scope.phoneMessageFocus=function(){
        scope.giftMessage.phoneMessage = "";
    }

    scope.giftMessageSubmit = function(){
        var vaildate = true;
        var mes = fem.vaildate.empty(scope.giftMessage.userName);
        if (mes) {
            scope.giftMessage.userNameMessage = "联系姓名不能为空";
            vaildate = false;
        } else {
            scope.giftMessage.phoneMessage = ''
        }
        mes = fem.vaildate.username(scope.giftMessage.phone);
        if(mes){
            scope.giftMessage.phoneMessage = mes;
            vaildate = false;
        }else{
             scope.giftMessage.phoneMessage = "";
        }
        if (vaildate) {
            var data={
                "gift_id":scope.giftId,
                "customer_name":scope.giftMessage.userName,
                "customer_phone":scope.giftMessage.phone,
                "address":scope.giftMessage.adress
            };
            http.post("/api/userpoint/create_exchange/",data).success(function(d){
                if(d.code==0){
                    scope.$emit("giftMessage-Cancel");
                    scope.$emit("giftMessage-true");
                }else{
                     scope.callbackmMsg=d.msg;
                     scope.$emit("giftMessage-Cancel");
                     scope.$emit("giftMessage-callback");
                }
            }).error(function(d){
                 scope.callbackmMsg="访问失败，请稍后再试。";
                 scope.$emit("giftMessage-Cancel");
                 scope.$emit("giftMessage-callback");
            })
        }
    }
}]);
