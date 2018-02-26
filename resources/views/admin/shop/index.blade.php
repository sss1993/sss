@extends('admin.layout.index')
@section('content')
<form action="" method="post" name="myform">
    {{ csrf_field() }}
    {{ method_field('delete') }}
</form>
<section id="content">

                <div class="container">

                    <div class="block-header">
                        <h2><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">联系人</font></font><small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">管理您的联系信息</font></font></small></h2>
                
                        <ul class="actions m-t-20 hidden-xs">
                            <li class="dropdown">
                                <a href="" data-toggle="dropdown">
                                    <i class="zmdi zmdi-more-vert"></i>
                                </a>
                
                                <ul class="dropdown-menu dropdown-menu-right">
                                    <li>
                                        <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">隐私设置</font></font></a>
                                    </li>
                                    <li>
                                        <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">帐号设定</font></font></a>
                                    </li>
                                    <li>
                                        <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">其他设置</font></font></a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    
                    <!-- Add button -->
                    <button class="btn btn-float btn-danger m-btn waves-effect waves-circle waves-float" onclick="refresh()"><i class="zmdi zmdi-plus"></i></button>
                
                    
                    <div class="card">
                        <div class="lv-header-alt clearfix m-b-5">
                            <h2 class="lvh-label hidden-xs"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">19,453条记录</font></font></h2>
                            
                            <div class="lvh-search">
                                <input type="text" placeholder="Start typing..." class="lvhs-input">
                                
                                <i class="lvh-search-close"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">×</font></font></i>
                            </div>
                            
                            <ul class="lv-actions actions">
                                <li>
                                    <a href="" class="lvh-search-trigger">
                                        <i class="zmdi zmdi-search"></i>
                                    </a>
                                </li>
                                <li>
                                    <a href="">
                                        <i class="zmdi zmdi-time"></i>
                                    </a>
                                </li>
                                <li class="dropdown">
                                    <a href="" data-toggle="dropdown" =""="" aria-expanded="false" aria-haspopup="true">
                                        <i class="zmdi zmdi-sort"></i>
                                    </a>
                
                                    <ul class="dropdown-menu dropdown-menu-right">
                                        <li>
                                            <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">上一次更改</font></font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">最后编辑</font></font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">名称</font></font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">日期</font></font></a>
                                        </li>
                                    </ul>
                                </li>
                                <li>
                                    <a href="">
                                        <i class="zmdi zmdi-info"></i>
                                    </a>
                                </li>
                                <li class="dropdown">
                                    <a href="" data-toggle="dropdown" =""="" aria-expanded="false" aria-haspopup="true">
                                        <i class="zmdi zmdi-more-vert"></i>
                                    </a>
                
                                    <ul class="dropdown-menu dropdown-menu-right">
                                        <li>
                                            <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">刷新</font></font></a>
                                        </li>
                                        <li>
                                            <a href=""><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">设置</font></font></a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        
                        
                        <div class="card-body card-padding">
                            
                            <div class="contacts clearfix row">
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="{{ url('admin/shop/1/edit') }}" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="javascript:void(0)" onclick="doDel(1)" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-2 col-sm-4 col-xs-6">
                                    <div class="c-item">
                                        <a href="" class="ci-avatar">
                                            <img src="/d/img/contacts/1.jpg" alt="">
                                        </a>
                
                                        <div class="c-info">
                                            <strong><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">凯茜谢尔顿</font></font></strong>
                                            <small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">cathy.shelton31@example.com</font></font></small>
                                        </div>
                
                                        <div class="c-footer">
                                            <button class="waves-effect"><i class="zmdi zmdi-person-add"></i><font style="vertical-align: inherit;"><font style="vertical-align: inherit;"> <a href="#" class="btn btn-info waves-effect">修改</a>&nbsp;&nbsp;<a href="#" class="btn btn-danger waves-effect">删除</a></font></font></button>
                                        </div>
                                    </div>
                                </div>
                
                            </div>

                
                        </div>
                    </div>
                </div>  

            </section>
            <script type="text/javascript">
                function doDel(id)
                {
                    var form = document.myform;
                    form.action = '{{ url("/admin/shop") }}/'+id;
                    form.submit();
                }
                function refresh()
                {
                    window.location.href="{{ url('admin/shop/create') }}";
                }
            </script>

@endsection