<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

class a_user extends Model
{
    public $table = 'a_user';

    public $timestamps = false; 

    protected $fillable = ['id','phone','password'];
    
    
     // public function a_user()
     // {

     //     return $this->hasOne('App\Http\Models\a_user','uid');
     // }
    public function h_addr()
    {

        return $this->hasMany('App\Http\Models\h_addr','aid','uid');
    }

}
