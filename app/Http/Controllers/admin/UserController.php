<?php

namespace App\Http\Controllers\admin;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use App\Http\Model\h_user;
class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $list = h_user::all();
        // var_dump($res);
        // dd($res);
        
        return view('admin.user.index',['list'=>$list]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return view('admin.user.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
        $arr = $request->except('_token');
        $id = h_user::insertGetId($arr);

        if($id > 0){
            return redirect('/admin/user')->with('msg','添加成功');
        }else{
            return redirect('/admin/user')->with('msg','添加失败');
        }
        dd($id);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        '1111111111';
     }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($uid)
    {
         //===============================删除开始==========================================   
            // dd($uid);
        // $res = h_user::where('uid', $uid)->delete();
        // if($uid > 0){
        //     return redirect('/admin/user')->with('msg','删除成功');
        // }else{
        //     return redirect('/admin/user')->with('msg','删除失败');
        // }
        // dd($res);
        // ================================删除结束==========================================
        // dd($uid);
        $res = h_user::where('uid',$uid)->delete();
        // dd($res);
        if($res == 1){
            return $res;
        } 
    }
    /**
     * 用户详情
     * @return [type] [用户详情模版]
     */
    public function info()
    {
        return view('admin.user.info');
    }
}
