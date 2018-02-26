@extends('admin.layout.index')
@section('content')
<form action="" method="post" name="myform">
    {{ csrf_field() }}
    {{ method_field('delete') }}
</form>
<section id="content">
<div class="container">
    <div class="block-header">
        <h2><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">表</font></font></h2>
    </div>
    <div class="card">
        <div class="card-header">
            <h2><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">悬停行在</font></font><small><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">tbody中的表行上启用悬停状态</font></font></small></h2>
            <br>
            <div class="row">
                <div class="col-sm-2">
                <div class="input-group fg-float">
                    <span class="input-group-addon"><i class="zmdi zmdi-account"></i></span>
                    <div class="fg-line">
                        <input type="text" class="form-control">
                        <label class="fg-label"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">搜获用户</font></font></label> 
                    </div>

                </div>
                </div>
                <div class="col-sm-1">
                    <select name="" id="" class="form-control">
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                    </select>                    
                </div>
            </div>
            <br><br><br>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>#</h4></font></font>
                        </th>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>用户名</h4></font></font>
                        </th>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>年 龄</h4></font></font>
                        </th>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>性别</h4></font></font>
                        </th>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>注册时间</h4></font></font>
                        </th>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>注册IP</h4></font></font>
                        </th>
                        <th>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;"><h4>修改 &nbsp; / &nbsp; 详情 &nbsp; / &nbsp;删除</h4></font></font>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;">1</font></font>
                        </td>
                        <td>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;">亚历山德拉</font></font>
                        </td>
                        <td>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;">克里斯托弗</font></font>
                        </td>
                        <td>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;">@makinton</font></font>
                        </td>
                        <td>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;">鸭子</font></font>
                        </td>
                        <td>
                            <font style="vertical-align: inherit;"><font style="vertical-align: inherit;">127.0.0.1</font></font>
                        </td>
                        <td>
                            <font style="vertical-align: inherit;"><a href="{{ url('admin/order/1/edit') }}" class="btn btn-info"><font style="vertical-align: inherit;">修改</font></a>
                        </font>&nbsp;
                        <font style="vertical-align: inherit;"><a href="{{ url('admin/order/1/info') }}" class="btn btn-success">
                            <font style="vertical-align: inherit;">详情</font></a></font> &nbsp;
                        <font style="vertical-align: inherit;"><a href="javascript:void(0)" onclick="doDel(1)" class="btn btn-danger">
                            <font style="vertical-align: inherit;">删除</font></a></font>
                        </td>


                    </tr>
                    </tr>
                </tbody>
            </table>
            <nav>
  <ul class="pagination">
    <li>
      <a href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    <li>
      <a href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>

        </div>
    </div>



        <script type="text/javascript">
            function doDel(id)
            {
                var form = document.myform;
                form.action = '{{ url("/admin/order") }}/'+id;
                // alert(form.action);
                form.submit();
            }



            /*
             * Notifications
             */
            function notify(from, align, icon, type, animIn, animOut){
                $.growl({
                    icon: icon,
                    title: ' Bootstrap Growl ',
                    message: 'Turning standard Bootstrap alerts into awesome notifications',
                    url: ''
                },{
                        element: 'body',
                        type: type,
                        allow_dismiss: true,
                        placement: {
                                from: from,
                                align: align
                        },
                        offset: {
                            x: 20,
                            y: 85
                        },
                        spacing: 10,
                        z_index: 1031,
                        delay: 2500,
                        timer: 1000,
                        url_target: '_blank',
                        mouse_over: false,
                        animate: {
                                enter: animIn,
                                exit: animOut
                        },
                        icon_type: 'class',
                        template: '<div data-growl="container" class="alert" role="alert">' +
                                        '<button type="button" class="close" data-growl="dismiss">' +
                                            '<span aria-hidden="true">&times;</span>' +
                                            '<span class="sr-only">Close</span>' +
                                        '</button>' +
                                        '<span data-growl="icon"></span>' +
                                        '<span data-growl="title"></span>' +
                                        '<span data-growl="message"></span>' +
                                        '<a href="#" data-growl="url"></a>' +
                                    '</div>'
                });
            };
            
            $('.notifications > div > .btn').click(function(e){
                e.preventDefault();
                var nFrom = $(this).attr('data-from');
                var nAlign = $(this).attr('data-align');
                var nIcons = $(this).attr('data-icon');
                var nType = $(this).attr('data-type');
                var nAnimIn = $(this).attr('data-animation-in');
                var nAnimOut = $(this).attr('data-animation-out');
                
                notify(nFrom, nAlign, nIcons, nType, nAnimIn, nAnimOut);
            });


            /*
             * Dialogs
             */

            //Basic
            $('#sa-basic').click(function(){
                swal("Here's a message!");
            });

            //A title with a text under
            $('#sa-title').click(function(){
                swal("Here's a message!", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lorem erat, tincidunt vitae ipsum et, pellentesque maximus enim. Mauris eleifend ex semper, lobortis purus sed, pharetra felis")
            });

            //Success Message
            $('#sa-success').click(function(){
                swal("Good job!", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed lorem erat, tincidunt vitae ipsum et, pellentesque maximus enim. Mauris eleifend ex semper, lobortis purus sed, pharetra felis", "success")
            });

            //Warning Message
            $('#sa-warning').click(function(){
                swal({   
                    title: "Are you sure?",   
                    text: "You will not be able to recover this imaginary file!",   
                    type: "warning",   
                    showCancelButton: true,   
                    confirmButtonColor: "#DD6B55",   
                    confirmButtonText: "Yes, delete it!",   
                    closeOnConfirm: false 
                }, function(){   
                    swal("Deleted!", "Your imaginary file has been deleted.", "success"); 
                });
            });
            
            //Parameter
            $('#sa-params').click(function(){
                swal({   
                    title: "Are you sure?",   
                    text: "You will not be able to recover this imaginary file!",   
                    type: "warning",   
                    showCancelButton: true,   
                    confirmButtonColor: "#DD6B55",   
                    confirmButtonText: "Yes, delete it!",   
                    cancelButtonText: "No, cancel plx!",   
                    closeOnConfirm: false,   
                    closeOnCancel: false 
                }, function(isConfirm){   
                    if (isConfirm) {     
                        swal("Deleted!", "Your imaginary file has been deleted.", "success");   
                    } else {     
                        swal("Cancelled", "Your imaginary file is safe :)", "error");   
                    } 
                });
            });

            //Custom Image
            $('#sa-image').click(function(){
                swal({   
                    title: "Sweet!",   
                    text: "Here's a custom image.",   
                    imageUrl: "img/thumbs-up.png" 
                });
            });

            //Auto Close Timer
            $('#sa-close').click(function(){
                 swal({   
                    title: "Auto close alert!",   
                    text: "I will close in 2 seconds.",   
                    timer: 2000,   
                    showConfirmButton: false 
                });
            });

        </script>
@endsection