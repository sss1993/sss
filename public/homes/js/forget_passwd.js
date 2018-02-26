(function($,w){
    var errorMessage = {
        phoneEmpty : "手机号码不能为空！",
        phoneError : "请输入正确的手机号码！",
        phoneNotRegister : '该手机号码尚未注册！<a href="/account/register">立即注册</a>',
        phoneIsRegister : '该手机号码已经注册！您可以<a href="/account/login">立即登录</a>',
        mailAddressEmpty:'邮箱地址不能为空',
        mailAddressError:'请输入正确的邮箱格式',
        mailAddressNotLink:'该邮箱尚未关联账号',
        lPassEmpty : "登录密码不能为空！",
        lPassError : "您输入的密码有误，请确认后重新输入！",
        captchaEmpty : "验证码不能为空",
        captchaError : '无效验证码！',
        rPassEmpty : '密码不能为空！',
        rPassError : '密码为6 - 10位字符',
        passAgain : '二次密码输入不一致',
        requestOften : '验证码请求太频繁',
        otherError : '未知错误，请稍后再尝试'
    },
    registerToken = false,
    timeId = null,
    timeoutVal = null,
    imgCaptchaTimeoutId = null,
    reg = {
        mobile : /^(13[0-9]|15[012356789]|18[0-9]|14[57]|17[0-9])[0-9]{8}$/,
        email : /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    },
    captchaUrl = function(){ return captcha_url + '?r=' + Math.random(); },
    $step = {
        mailAddress : $("#mailAddress"),
        captcha : $("#captcha")
    },
    $step1 = {
        phone : $("#phone"),
        captcha2 : $("#captcha2"),

        captchaBox: $("#captchaBox"),
        imgCaptcha: $('#imgCaptcha'),
        phoneCaptchaImg: $('#phoneCaptchaImg')
    },
    $step2 = {
        pass : $("#pass"),
        pass2 : $("#pass2")
    }
    $obj = {
        mailStep : $("#mailStep"),
        phoneStep : $("#phoneStep"),
        getCaptcha: $("#getCaptcha"),
        mailNextStep : $("#mailNextStep"),
        phoneNextStep : $("#phoneNextStep"),
        confirm : $("#confirm"),
        passStep :$("#passStep"),
        againSendMail : $("#againSendMail"),
        captchaImg : $("#captchaImg")
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
            isSuccess = showErrorMessage($step1.phone, errorMessage.phoneEmpty);
        }else if(!reg.mobile.test(val)){
            isSuccess = showErrorMessage($step1.phone, errorMessage.phoneError);
        }
        return isSuccess;
    },
    vaildateClientData = function(obj, isStep2){
        var ovs = null , isSuccess = true;
        ovs = getFormDatas(obj);
        if (!registerToken && !isStep2) {
            var imgCaptchaVal = $step1.imgCaptcha.val();
            if (!imgCaptchaVal) {
                showErrorMessage($step1.imgCaptcha, '图片验证码不能为空');
                isSuccess = false;
            } else {
                if (imgCaptchaVal.length < 4) {
                    showErrorMessage($step1.imgCaptcha, '图片验证码不正确');
                    isSuccess = false;
                } else {
                    $step1.imgCaptcha.trigger('keyup');
                    return false;
                }
            }
        }

        if(ovs.phoneVal != undefined){
            isSuccess =  vaildatePhone(ovs.phoneVal);
        }
        if(ovs.mailAddressVal != undefined){
            if(ovs.mailAddressVal == ""){
                isSuccess = showErrorMessage(obj["mailAddress"],errorMessage.mailAddressEmpty);
            }else if(!reg.email.test(ovs.mailAddressVal)){
                isSuccess = showErrorMessage(obj["mailAddress"],errorMessage.mailAddressError);
            }
        }
        if(ovs.captchaVal != undefined && ovs.captchaVal == ""){
            isSuccess = showErrorMessage(obj["captcha"],errorMessage.captchaEmpty);
        }
        if(ovs.captcha2Val != undefined && ovs.captcha2Val == ""){
            isSuccess = showErrorMessage(obj["captcha2"],errorMessage.captchaEmpty);
        }
        if(ovs.passVal != undefined){
            if (ovs.passVal == ""){
                isSuccess = showErrorMessage(obj["pass"],errorMessage.rPassEmpty);
            }else if(ovs.passVal.length < 6 || ovs.passVal.length > 10){
                isSuccess = showErrorMessage(obj["pass"],errorMessage.rPassError);
            }
        }
        if(ovs.passVal != undefined && ovs.pass2Val != undefined){
            if(ovs.passVal !== ovs.pass2Val){
                isSuccess = showErrorMessage(obj["pass2"],errorMessage.passAgain);
            }
        }
        return isSuccess;
    },
    ajaxRequest = function(url,d,success,error){
        $.ajax({
            url: url,
            type:'POST',
            dataType:'JSON',
            data: d,
            success:function(d){
                if(d){
                    success(d);
                }
                return false;
            },
            error:function(d){
                if($.isFunction(error)){
                    error();
                }
            }
        });
    }

    $step1.phoneCaptchaImg.on('click', function() {
        clearTimeout(imgCaptchaTimeoutId);
        imgCaptchaTimeoutId = setTimeout(function() {
            $step1.phoneCaptchaImg.attr('src', $step1.phoneCaptchaImg.attr('_src') + '?r=' + Math.random());
        }, 200);
    });
    function countDown(that) {
        clearInterval(timeId);
        var i = 59;
        that.value = '60秒后可获取';
        that.disabled = true;
        $(that).attr("disabled",true);
        timeId = setInterval(function(){
            that.value = (i--) + '秒后可获取';
            if(i <= 0){
                that.value = '获取验证码';
                $(that).attr("disabled",false);
                clearInterval(timeId);
            }
        },1000)
    }
    $obj.getCaptcha.on("click", function(){
        countDown(this);
        sendSMSCode(null, function(d) {
            showErrorMessage($step1.captcha2, d.failed_msg);
        });
        return false;
    })

    $obj.phoneNextStep.on("click", function(){
        $obj.phoneStep.find(".form-error").removeClass("form-error");
        if(vaildateClientData($step1)){
            customPost(mobile_validate_url,
                '{"request_type": "reset_customer_password", "sms_code": "' + $step1.captcha2.val() + '"}',
                function(d){
                    if(d.status == 'ok'){
                        location.href = password_reset_url;
                        return false;
                    }else{
                        error(d);
                    }
            }, function(d) {error(d)});
            function error(d) {
                if (d){
                    showErrorMessage($step1.captcha2, d.failed_msg);
                }
            }
        }
        return false;
    })
    $obj.confirm.on('click',function(){
        $obj.passStep.find(".form-error").removeClass("form-error");
        if(vaildateClientData($step2, true)){
            customPost(reset_password_url,
                '{"password":"' + $step2.pass.val() + '"}',
                function(d) {
                    if(d.status == 'ok'){
                        location.href = password_reset_done;
                    }else{
                        error(d);
                    }
            }, function(d) {error(d)});
            function error(d) {
                if (d){
                    showErrorMessage($step2["phone"], d.failed_msg);
                }
            }
        }
        return false;
    })
    $obj.againSendMail.on("click",function(){
        var that =this , i = 59;
        that.value = '60秒后可再次获取';
        that.disabled = true;
        var timeId = setInterval(function(){
            that.value = (i--) + '秒后可再次获取';
            if(i == 0){
                that.value = '再发一封验证邮件';
                that.disabled = false;
                clearInterval(timeId);
            }
        },1000)
        return false;
    })
    $obj.captchaImg.on("click",function(){
        this.src = captchaUrl();
        return false;
    })

    $(".form-group input").on("focus",function(){
        hideErrorMessage($(this));
    })

    $step1.imgCaptcha.on('keyup', function() {
        var value = this.value;
        if (!registerToken && value && value.length >= 4) {
            customPost(ajax_password_reset_via_mobile_start, '{"mobile": "' + $step1.phone.val() + '", "captcha": "' + value + '" }', function(d) {
                if (d.status == 'ok') {
                    sendSMSCode(function(d) {
                        if (d.status == 'ok') {
                            imgCaptchaSuccess();
                        } else {
                            error(d)
                        }
                    }, function(d) {
                        error(d)
                    });
                } else {
                    error(d);
                }
            }, function(d) {error(d)} );
            function error(d) {
                if (d) {
                    showErrorMessage($step1.imgCaptcha, d && d.failed_msg);
                    $step1.phoneCaptchaImg.click();
                }
            }
        }
    });
    $step1.phone.on('keyup input', function() {
        var that = this;
        clearTimeout(timeoutVal);
        timeoutVal = setTimeout(function() {
            if (vaildatePhone(that.value, $step1.phone)) {
                if ($step1.phone.oldVal != that.value && registerToken) {
                    gotoImgCaptcha();
                }
                $step1.imgCaptcha.attr('disabled', false);
                hideErrorMessage($step1.phone);
            } else {
                $step1.imgCaptcha.attr('disabled', true);
            }
        }, 200);
    });
    $step1.captcha2.on('focus', function() {
        if (!vaildatePhone($step1.phone.val(), $step1.phone)) {
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
        customPost(common_sms_code, '{"request_type": "reset_customer_password"}', function(d) {
            if (d.status == 'ok') {
                $.isFunction(success) && success(d);
            } else {
                $.isFunction(error) && error(d);
            }
        }, function(d) {
            $.isFunction(error) && error(d);
        })
    }
    function gotoImgCaptcha() {
        clearInterval(timeId);
        registerToken = false;
        $step1.imgCaptcha.val('');
        $step1.phoneCaptchaImg.click();
        $step1.captchaBox.animate({'marginLeft': '-300px'}, 300);
    }
    function imgCaptchaSuccess() {
        $step1.phone.oldVal = $step1.phone.val();
        countDown($obj.getCaptcha[0]);
        registerToken = true;
        $step1.captchaBox.animate({'marginLeft': '0'}, 300);
        $step1.captcha2.val('').focus();
        hideErrorMessage($step1.imgCaptcha);
    }
})($,window);