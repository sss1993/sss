@extends('admin.layout.index')
@section('content')
<section id="content">
                <div class="container">
                    <div class="block-header">
                        <h2>Form Components</h2>
                    
                        <ul class="actions">
                            <li>
                                <a href="">
                                    <i class="zmdi zmdi-trending-up"></i>
                                </a>
                            </li>
                            <li>
                                <a href="">
                                    <i class="zmdi zmdi-check-all"></i>
                                </a>
                            </li>
                            <li class="dropdown">
                                <a href="" data-toggle="dropdown">
                                    <i class="zmdi zmdi-more-vert"></i>
                                </a>
                    
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li>
                                        <a href="">Refresh</a>
                                    </li>
                                    <li>
                                        <a href="">Manage Widgets</a>
                                    </li>
                                    <li>
                                        <a href="">Widgets Settings</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    
                    </div>
                
                    <div class="card">
                        
                        
                        <div class="card-body card-padding">
                            <p class="c-black f-500 m-b-5"><h4>添加商铺</h4></p>
                            <small>请按规定填写相关信息.</small>
                            
                            <br><br>
                            <form action="/admin/user/add" method="post">
                            <div class="row">
                                <div class="col-sm-8">                       
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="zmdi zmdi-account"></i></span>
                                        <div class="fg-line">
                                                <input type="text" class="form-control" placeholder="请填写商铺名称">
                                        </div>
                                    </div><br>
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="glyphicon glyphicon-eye-close"></i></span>
                                        <div class="fg-line">
                                                <input type="password" class="form-control" placeholder="请填写密码">
                                        </div>
                                    </div>
                                    <br>
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="glyphicon glyphicon-eye-close"></i></span>
                                        <div class="fg-line">
                                                <input type="password" class="form-control" placeholder="确认密码">
                                        </div>
                                    </div>
                                    <br>
                                    
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="zmdi zmdi-local-phone"></i></span>
                                        <div class="fg-line">
                                            <input type="text" class="form-control" placeholder="请填写联系方式">
                                        </div>
                                    </div>
                                    
                                    <br>
                                    
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="zmdi zmdi-email"></i></span>
                                        <div class="fg-line">
                                            <input type="text" class="form-control" placeholder="请填写电子邮箱">
                                        </div>
                                    </div>
                                    
                                    <br>
                                    
                                    <div class="input-group">
                                        <span class="input-group-addon"><i class="zmdi zmdi-pin"></i></span>
                                        <div class="fg-line">    
                                            <input type="text" class="form-control" placeholder="请填写地址">
                                        </div>
                                    </div><br>
                                    <div class="input-group">
                                        <span class="input-group-addon"></span>
                                        <div class="fg-line">
                                          <!-- <button class="btn bgm-lightblue waves-effect form-control" >提交</button> -->
                                          <input type="submit" value=" 添 加 店 铺 " class="btn bgm-lightblue waves-effect form-control">
                                        </div>
                                    </div><br>
                                    
                                </div>
                                    <div class="col-sm-4">
                                    <div class="fileinput fileinput-new" data-provides="fileinput">
                                        <span class="btn btn-primary btn-file m-r-10 waves-effect">
                                            <span class="fileinput-new"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">选择文件</font></font></span>
                                            <span class="fileinput-exists">Change</span>
                                            <input type="hidden"><input type="file" name="..." multiple >
                                        </span>
                                        <span class="fileinput-filename"></span>
                                        <a href="#" class="close fileinput-exists" data-dismiss="fileinput">×</a>
                                    </div>
                                </div>


                            </div>
                            
                            <br><br>
                            
                            <br>
                            <br>
                            <br>
                        
                        <br>
                    </div>

                  </form>
<!--       <div class="card">
                        <div class="card-header">
                            <h2>Simple File Input <small>The file input plugin allows you to create a visually appealing file or image input widgets</small></h2>
                        </div>
                        
                        <div class="card-body card-padding">
                            <div class="row">
                                <div class="col-sm-4">
                                    <p class="f-500 c-black m-b-20">Basic Example</p>
                                    
                                    <div class="fileinput fileinput-new" data-provides="fileinput">
                                        <span class="btn btn-primary btn-file m-r-10 waves-effect">
                                            <span class="fileinput-new">Select file</span>
                                            <span class="fileinput-exists">Change</span>
                                            <input type="file" name="...">
                                        </span>
                                        <span class="fileinput-filename"></span>
                                        <a href="#" class="close fileinput-exists" data-dismiss="fileinput">×</a>
                                    </div>
                                </div>
                            </div>
                            
                            <br>
                            <br>
                            
                            <p class="f-500 c-black m-b-20">Image Preview</p>
                            
                            <div class="fileinput fileinput-new" data-provides="fileinput">
                                <div class="fileinput-preview thumbnail" data-trigger="fileinput"></div>
                                <div>
                                    <span class="btn btn-info btn-file waves-effect">
                                        <span class="fileinput-new">Select image</span>
                                        <span class="fileinput-exists">Change</span>
                                        <input type="file" name="...">
                                    </span>
                                    <a href="#" class="btn btn-danger fileinput-exists waves-effect" data-dismiss="fileinput">Remove</a>
                                </div>
                            </div>
                            
                            <br>
                            <br>
                            <p><em>Image preview only works in IE10+, FF3.6+, Safari6.0+, Chrome6.0+ and Opera11.1+. In older browsers the filename is shown instead.</em></p>
                        </div>
                    </div>
            </section> -->
@endsection