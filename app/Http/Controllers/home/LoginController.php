<?php

namespace App\Http\Controllers\home;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Model\h_user;

class LoginController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('home.layout.index');  //用/也可以
    }

    public function store(Request $request)
    {
                $tel = $_POST['tel'];
                $passwd = $_POST['passwd'];
                
                $user = h_user::where('tel','=',$tel)->where('passwd','=',$passwd)->first();
                // dd($user);
                if(!empty($user)){
                    
                    // echo '登录成功';
                    return redirect('/user')->with('msg','登录成功');
                    // die;
                }else {
                    return redirect('/')->with('msg','账号或密码不正确，请重新输入');
                    // die('登录失败');
                }
            
    }

    public function dologin()
    {
        
    }

}
