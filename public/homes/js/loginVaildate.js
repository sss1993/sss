/*登入*/
(function($,w){
    var errorMessage = {
        phoneEmpty : "手机号码不能为空！",
        phoneError : "请输入正确的手机号码！",
        phoneNotRegister : '该手机号码尚未注册！<a onclick="locationDialog();return false;" href="#">立即注册</a>',
        phoneIsRegister : '该手机号码已经注册！您可以<a onclick="locationDialog(true);return false;" href="#">立即登录</a>',

        phonePageNotRegister : '该手机号码尚未注册！<a href="/account/register">立即注册</a>',
        phonePageIsRegister : '该手机号码已经注册！您可以<a href="/account/login">立即登录</a>',

        lPassEmpty : "登录密码不能为空！",
        lPassError : "您输入的密码有误，请确认后重新输入！",
        captchaEmpty : "验证码不能为空",
        captchaOfter : "验证码请求太频繁",
        captchaError : '验证码错误！',
        rPassEmpty : '注册密码不能为空！',
        rPassError : '密码为6 - 10位字符',
        passAgain : '二次密码输入不一致',
        agree : '请同意外卖超人"注册条款"',
        otherError : '未知错误，请稍后再尝试'
    },
    agreeClickFunc = null,
    timeId = null,
    logErrorCount = 0,
    timeoutVal = null,
    registerToken = false,
    imgCaptchaTimeoutId = null,
    reg = {
        mobile : /^(13[0-9]|15[012356789]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/
    },
    $obj = {
        login : $("#login_dialog"),
        loginBox : $("#login_dialog").children(".mpopup_box"),
        register : $("#register_dialog"),
        registerBox : $("#register_dialog").children(".mpopup_box"),
        registerBtn : $("#registerBtn"),
        getCaptcha : $("#getCaptcha"),
        userArea : $("#userArea"),
        captcha : $("#captchaImg")
    },
    $loginObj = {
        phone : $("#lPhone"),
        pass : $("#lPass"),
        captcha : $("#lCaptcha"),
        remember : $("#lRemember")
    },
    $registerObj = {
        phone : $("#rPhone"),
        pass : $("#rPass"),
        pass2 : $("#rPass2"),
        captcha : $("#rCaptcha"),
        agree : $("#rAgree"),
        captchaBox: $("#captchaBox"),
        imgCaptcha: $("#imgCaptcha")
    },
    init = function(obj,isClearData){
        var item = '';
        if(obj){
            obj.find(".form-error").removeClass("form-error");
            if(obj[0].id == 'register_dialog'){
                clearInterval(timeId);
                $obj.registerBtn.attr("disabled",false);
                $registerObj.agree[0].checked = true;
                $obj.getCaptcha.val('获取验证码');
                $obj.getCaptcha.attr("disabled",false);
            }
        }else{
            $obj.register.find(".form-error").removeClass("form-error");
            $obj.login.find(".form-error").removeClass("form-error");
        }
        if(isClearData){
            for(item in $loginObj){
                if(item == 'remember'){
                    $loginObj[item].attr("checked",false);
                    continue;
                }
                $loginObj[item].val('');
            }
            for(item in $registerObj){
                if(item == 'agree'){
                    $registerObj[item].attr("checked",true);
                    continue;
                }
                $registerObj[item].val('');
            }
        }
    },
    getFormDatas = function(obj){
        var ovs = {} ;
        for(var item in obj){
            ovs[item+'Val'] = $.trim(obj[item].val());
        }
        return ovs;
    },
    showErrorMessage = function(obj,message){
        obj.parent().addClass("form-error").next().html(message);
        return false;
    },
    hideErrorMessage = function(obj){
        obj.parent().removeClass("form-error").next().html('');
        return false;
    },
    vaildatePhone = function(val,obj){
        var isSuccess = true;
        if(val == ""){
            isSuccess = showErrorMessage(obj,errorMessage.phoneEmpty);
        }else if(!reg.mobile.test(val)){
            isSuccess = showErrorMessage(obj,errorMessage.phoneError);
        }
        return isSuccess;
    },
    vaildateClientLoginData = function(obj){
        var ovs = null , isSuccess = true;
        ovs = getFormDatas(obj);
        isSuccess = vaildatePhone(ovs.phoneVal, obj["phone"]);
        if (ovs.passVal == ""){
            isSuccess = showErrorMessage(obj["pass"],errorMessage.lPassEmpty);
        }
        if(obj.captcha.is(":visible") && ovs.captchaVal == ""){
            isSuccess = showErrorMessage(obj["captcha"],errorMessage.captchaEmpty);
        }
        return isSuccess;
    },
    vaildateClientRegisterData = function(obj){
        var ovs = null , isSuccess = true;
        if (!registerToken) {
            var imgCaptchaVal = $registerObj.imgCaptcha.val();
            if (!imgCaptchaVal) {
                showErrorMessage($registerObj.imgCaptcha, '图片验证码不能为空');
                isSuccess = false;
            } else {
                if (imgCaptchaVal.length < 4) {
                    showErrorMessage($registerObj.imgCaptcha, '图片验证码不正确');
                    isSuccess = false;
                } else {
                    $registerObj.imgCaptcha.trigger('keyup');
                    return false;
                }
            }
        }
        ovs = getFormDatas(obj);
        if(ovs.phoneVal == ""){
            isSuccess = showErrorMessage(obj["phone"],errorMessage.phoneEmpty);
        }else if(!reg.mobile.test(ovs.phoneVal)){
            isSuccess = showErrorMessage(obj["phone"],errorMessage.phoneError);
        }
        if(ovs.captchaVal == ""){
            isSuccess = showErrorMessage(obj["captcha"],errorMessage.captchaEmpty);
        }

        if (ovs.passVal == ""){
            isSuccess = showErrorMessage(obj["pass"],errorMessage.rPassEmpty);
        }else if(ovs.passVal.length < 6 || ovs.passVal.length > 10){
            isSuccess = showErrorMessage(obj["pass"],errorMessage.rPassError);
        }
        if(ovs.passVal !== ovs.pass2Val){
            isSuccess = showErrorMessage(obj["pass2"],errorMessage.passAgain);
        }
        if(!obj.agree[0].checked){
            isSuccess = showErrorMessage(obj["agree"],errorMessage.agree);
        }
        return isSuccess;
    },
    commitBtnStyle = function($this,isLogin){
        var text = $this[0].id.indexOf("login") < 0 ? "确认注册" : "登录";
        $this.attr("disabled",isLogin);
        $this.text(isLogin ? text + "中，请稍后..." : text);
    },
    rotateAnimation = function (id1,id2){
        var box1 = id1 + "Box",box2 = id2 + "Box";
        //box1 隐藏的
        //box2 当前显示的
        $obj[id1].show().css("visibility","hidden");
        $obj[box1].addClass("rotateY-90");

        $obj[box2].removeClass("scale100").addClass("rotateY90");
        setTimeout(function(){
            $obj[id2].hide();
            $obj[box2].removeClass("rotateY90");
            $obj[id1].css("visibility","visible")
            $obj[box1].removeClass("rotateY-90");
        },300)
    },
    closeLoginDialog = function ($this){
        var $box = $this.parent().parent(),$dialog = $box.parent();
        $box.removeClass("scale100").addClass("scale50");
        setTimeout(function(){
            $dialog.hide();
            $box.removeClass("scale50");
        },200)
        return false;
    },
    openLoginDialog = function (name){
        init();
        $obj[name].show();
        $obj[name + 'Box'].removeClass("scale50 scale100").addClass("scale50");
        setTimeout(function(){
            $obj[name + 'Box'].removeClass("scale50").addClass("scale100");
        },10);
    },
    loginCallback = function(d,func,isFast){
        if(d.captcha == 1){
            $loginObj.captcha.val('').parent().show();
            $obj.captcha.click();
        }
        if(d.status == "ok"){
            func();

        }else{
            switch(d.failed_code){
                case '1017':
                case '1022':
                    showErrorMessage($loginObj["phone"],(isFast ? errorMessage.phoneNotRegister : errorMessage.phonePageNotRegister));
                    break;
                case '1015':
                    showErrorMessage($loginObj["pass"],errorMessage.lPassError);
                    break;
                case '1021':
                    if ($loginObj["captcha"].val() && $loginObj["captcha"].val().length > 0) {
                        showErrorMessage($loginObj["captcha"], errorMessage.captchaError);
                    }
                    break;
                default:
                    showErrorMessage($loginObj["phone"],errorMessage.otherError);
            }
        }
    },
    loginFunc = function($this,func){
        if(vaildateClientLoginData($loginObj)){
           commitBtnStyle($this,true);
            $.ajax({
                url: userVaildate,
                type:'POST',
                dataType:'JSON',
                data: { 'username':$loginObj.phone.val(),'password':$loginObj.pass.val(),'captcha':$loginObj.captcha.val(),'remember':$loginObj.remember[0].checked ? 1 : 0 },
                success:function(d){
                    if(d){
                        func(d);
                    }
                    commitBtnStyle($this,false);
                    return false;
                },
                error:function(d){
                    commitBtnStyle($this,false);
                }
            });
        }
    },
    registerCallback = function(d,func,isFast){
        if(d.status == "ok" ){
            func();
        }else{
            switch(d.failed_code){
                case '1023':
                case '1026':
                    showErrorMessage($registerObj["phone"],(isFast ? errorMessage.phoneIsRegister : errorMessage.phonePageIsRegister));
                    break;
                case '1019':
                    showErrorMessage($registerObj["pass"],errorMessage.lPassError);
                    break;
                case '1025':
                    showErrorMessage($registerObj["captcha"],errorMessage.captchaError);
                    break;
                default:
                    showErrorMessage($registerObj["phone"],errorMessage.otherError);
            }
        }
    },
    registerFunc = function($this,func){
        if(vaildateClientRegisterData($registerObj)){
            commitBtnStyle($this,true);
            customPost(common_validate_sms_code, '{"request_type": "customer_user_register", "sms_code":"' + $registerObj.captcha.val() + '"}',
                function(d){ successSMS(d)},
                function(d){ errorSMS(d)}
            );
            function successSMS(d) {
                if (d && d.status == 'ok') {
                    customPost(ajax_customer_user_register_register, '{"password":"' + $registerObj.pass2.val() + '"}',success, error);
                } else {
                    errorSMS(d);
                }
            }
            function errorSMS(d) {
                commitBtnStyle($this, false);
                showErrorMessage($registerObj.captcha, d && d.failed_msg);
            }
            function success(d) {
                if(d && d.status == 'ok'){
                    $.isFunction(func) && func(d);
                    commitBtnStyle($this, false);
                } else {
                    error(d);
                }
            }
            function error(d) {
                commitBtnStyle($this, false);
                showErrorMessage($registerObj.phone, d && d.failed_msg);
            }
        }
    },
    bindEvent = function (){
        $("#login").on('click',function(){
           openLoginDialog('login');
            init($obj.login,true);
            return false;
        })
        $("#register").on("click",function(){
            openLoginDialog("register");
            init($obj.register,true);
            return false;
        })
        $("#logout").on('click',function(){
            $.get(userLogout,function(d){
                if(d.status == 'ok'){
                    $loginObj.captcha.val('').parent().hide();
                    $obj.userArea.html('<a href="#" id="login">立即登录</a><a href="#" id="register">快速注册</a>');
                    bindEvent();
                }
            });
            return false;
        })
    },
    userAreaHtml = function(d){
      return '<span class="username">Hey，' + d.username + ' !</span><span class="my_account"><a target="_black" href="' + user_center_url + '">个人中心</a></span><span class="logout"><a id="logout" href="/account/logout/">退出</a></span>'
    };
    //绑定打开事件
    bindEvent();
    //首页登录
    $("#loginBtn").removeAttr("disabled").on('click',function(){
        var $this = $(this);
        $obj.captcha.click();
        init();
        //通过客户端验证
        loginFunc($this,function(d){
            loginCallback(d,function(){
                closeLoginDialog($("#login_dialog").find(".mpopup_remove"));
                $obj.userArea.html(userAreaHtml(d));
                 bindEvent();
            },true);
        });
        return false;
    }).next().children().on("click",function(){
        locationDialog();
        return false;
    });
    //首页注册
    $("#registerBtn").on("click",function(){
        var $this = $(this);
        init();
        registerFunc($this,function(d){
            registerCallback(d,function(){
                closeLoginDialog($("#register_dialog").find(".mpopup_remove"));
                $obj.userArea.html(userAreaHtml(d));
                bindEvent();
            },true);
        });
        return false;

    });
    function redirectUrl(){
        var arr = location.search.substr(1).split('&'),temp = null,oSearch = {};
        for(var i = 0, len = arr.length; i < len; i++){
            temp = arr[0].split("=");
            oSearch[temp[0]] = temp[1];
        }
        if(oSearch.redirect_url){
            location.href = decodeURIComponent(oSearch.redirect_url)
        }else{
            location.href = "/";
        }
    }
    //登陆页
     $("#loginPageBox input").keydown(function(e){
        var e=e||window.event;
        if(e.keyCode=="13"){
            $("#loginPageBtn").click();
        }
    });
    $("#loginPageBtn").removeAttr("disabled").on("click",function(){
        var $this = $(this);
        $("#loginPageBox").find(".form-error").removeClass("form-error");
        //通过客户端验证
        loginFunc($this,function(d){
            loginCallback(d,function(){
                redirectUrl();
            },false);
        });
    })
    //注册页
    $("#registerPageBox input").keydown(function(e){
        var e=e||window.event;
        if(e.keyCode=="13"){
            $("#registerPageBtn").click();
        }
    });
    $("#registerPageBtn").on('click',function(){
        var $this = $(this);
         $("#registerPageBox").find(".form-error").removeClass("form-error");
        //通过客户端验证
        registerFunc($this,function(d){
            registerCallback(d,function(){
                redirectUrl();
            },false);
        });
    })

    if( $obj.registerBtn[0]){
        agreeClickFunc = function (){
            $registerObj.agree.is(':checked') ? $obj.registerBtn.removeAttr("disabled") : $obj.registerBtn.attr("disabled","disabled");
        }
    }else{
        agreeClickFunc = function (){
            $registerObj.agree.is(':checked') ? $("#registerPageBtn").removeAttr("disabled") : $("#registerPageBtn").attr("disabled","disabled");
        }
    }
    $registerObj.agree.on("click",agreeClickFunc)
    $obj.captcha.on('click', function() {
        var $this = $(this);
        clearTimeout(imgCaptchaTimeoutId)
        imgCaptchaTimeoutId = setTimeout(function() {
            $this.attr('src', $this.attr('_src') + '?r=' + Math.random());
        }, 200)
    });

    function countDown(that) {
        clearInterval(timeId);
        that.disabled = true;
        var  i = 59;
        that.value = '60秒后可获取';
        that.disabled = true;
        timeId = setInterval(function(){
            that.value = (i--) + '秒后可获取';
            if(i <= 0){
                that.value = '获取验证码';
                that.disabled = false;
                clearInterval(timeId);
            }
        },1000)
    }
    $obj.getCaptcha.on("click", function(){
        countDown(this);
        sendSMSCode(null, function() {
            showErrorMessage($registerObj.captcha, d.failed_msg);
        });
        return false;
    })
    w.locationDialog = function (toLogin){
        if(toLogin){
            init($obj.login,true);
            rotateAnimation("login","register");
        }else{
            init($obj.register,true);
            rotateAnimation("register","login");
        }
        return false;
    }
    /*$obj.captcha.on('click',function(){
        this.src = captchaUrl();
    })*/
    $("#login_dialog,#register_dialog").find(".mpopup_remove").on("click",function(){
        closeLoginDialog($(this));
        return false;
    })

    init(null,true);

    $(".form-group input").on("focus",function(){
        hideErrorMessage($(this));
    });
    /*$obj.getCaptcha.attr('disabled', false);*/
    ///////
    $registerObj.imgCaptcha.on('keyup', function() {
        var value = this.value;
        if (!registerToken && value && value.length >= 4) {
            customPost(ajax_customer_user_register_start, '{"mobile": "' + $registerObj.phone.val() + '", "captcha": "' + value + '" }', function(d) {
                if (d.status == 'ok') {
                    sendSMSCode(function(d) {
                        if (d.status == 'ok') {
                            imgCaptchaSuccess();
                        } else {
                            error(d);
                        }
                    }, function(d) {
                        error(d);
                    });
                } else {
                    error(d);
                }
            }, function(d) {error(d)});
            function error(d) {
                showErrorMessage($registerObj.imgCaptcha, d && d.failed_msg);
                $obj.captcha.click();
            }
        }
    });
    $registerObj.phone.on('keyup input', function() {
        var that = this;
        clearTimeout(timeoutVal);
        timeoutVal = setTimeout(function() {
            if (vaildatePhone(that.value, $registerObj.phone)) {
                if ($registerObj.phone.oldVal != that.value && registerToken) {
                    gotoImgCaptcha();
                }
                $registerObj.imgCaptcha.attr('disabled', false);
                hideErrorMessage($registerObj.phone);
            } else {
                $registerObj.imgCaptcha.attr('disabled', true);
            }
        }, 200);
    });
    $registerObj.captcha.on('focus', function() {
        if (!vaildatePhone($registerObj.phone.val(), $registerObj.phone)) {
            gotoImgCaptcha();
        }
    });
    function customPost(url, data, success, error) {
        $.ajax({
            type: 'POST',
            url: url,
            data: data,
            success: function(data) { if ($.isFunction(success)) success(data) },
            error: function(data) { if ($.isFunction(error)) error(data)},
            contentType: "application/json",
            dataType: 'json'
        });
    }
    function sendSMSCode(success, error) {
        customPost(common_sms_code, '{"request_type": "customer_user_register"}', function(d) {
            if (d.status == 'ok') {
                $.isFunction(success) && success(d);
            } else {
                $.isFunction(error) && error(d);
            }
        }, function(d) {
            $.isFunction(error) && error(d);
        });
    }
    function gotoImgCaptcha() {
        clearInterval(timeId);
        registerToken = false;
        $registerObj.imgCaptcha.val('');
        $obj.captcha.click();
        $registerObj.captchaBox.animate({'marginLeft': '-300px'}, 300);
    }
    function imgCaptchaSuccess() {
        $registerObj.phone.oldVal = $registerObj.phone.val();
        countDown($obj.getCaptcha[0]);
        registerToken = true;
        $registerObj.captchaBox.animate({'marginLeft': '0'}, 300);
        $registerObj.captcha.val('').focus();
        hideErrorMessage($registerObj.imgCaptcha);
    }

})($,window);
