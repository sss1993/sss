<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// Route::get('/', function () {
//     return view('welcome');
// });
// 后台模块
Route::group(['prefix' => 'admin'],function(){
	Route::get('/',function(){
		return view('admin.layout.index');
	});
	// 后台用户模块
	Route::resource('user','admin\UserController');
	Route::get('user/{id}/info','admin\UserController@info');
	// 后台管理员模块
	Route::resource('administrator','admin\AdministratorController');
	Route::get('administrator/{id}/info','admin\AdministratorController@info');
	// 后台店铺分类模块
	Route::resource('shopcate','admin\ShopcateController');
	// 后台商铺模块
	Route::resource('shop','admin\ShopController');
	// 后台订单模块
	Route::resource('order','admin\OrderController');
	Route::get('order/{id}/info','admin\OrderController@info');
	// 后台活动模块
	Route::resource('activity','admin\activityController');
	// 后台投诉模块
	Route::resource('complain','admin\ComplainController');
	// 后台审核模块
	Route::resource('audit','admin\AuditController');
	// 后台广告管理
	Route::resource('advert','admin\AdvertController');
});
//前台模块
Route::group(['prefix' => '/'],function(){
	Route::get('/',function(){
		return view('home.layout.index');
	});
	//前台用户登录模块
	Route::resource('login','home\LoginController');
	//前台用户个人中心
	Route::resource('user','home\UserController');
});
