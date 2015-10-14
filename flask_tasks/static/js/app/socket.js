var app = angular.module('app.socket',[]),
    require;
app.factory('socket',socket)
   .service('p',pFunc);



pFunc.$inject = ['$pusher','$log','$rootScope'];

function pFunc($pusher,$log,$rootScope){
    var p = new Pusher('14d2f4c74704d4c4aadd',{encrypted:true});
    Pusher.log = $log.log;

    return $pusher(p);
}
socket.$inject = ['$rootScope','$window','$location'];

function socket($rootScope,$window,$location){
    var socket = {on:function(){},emit:function(){}};
    return {
        on:function(eventName,cb){
            socket.on(eventName,function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    cb.apply(socket,args);
                });
            });
        },
        emit:function(eventName,data,cb){
            socket.emit(eventName,data,function(){
                var args = arguments;
                $rootScope.$apply(function(){
                    if(cb){
                        cb.apply(socket,args);
                    }
                });
            });
        }
    };
}

