<?php

namespace App\Http\Models;

use Illuminate\Database\Eloquent\Model;

class h_addr extends Model
{
    public $table = 'h_user';

    public $timestamps = false; 

    protected $fillable = ['id','phone','password'];
    
    
    public function h_addr()
    {

        return $this->hasMany('App\Http\Models\h_addr','aid','uid');
    }
}
