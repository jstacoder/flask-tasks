var app = angular.module('app.socket',[]);

app.factory('socket',socket);

socket.$inject = ['$rootScope','$window','$location'];

function socket($rootScope,$window,$location){
    var socket = $window.io.connect('http://'+$location.host()+":"+$location.port()+'/test');
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

