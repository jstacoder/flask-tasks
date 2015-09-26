'use strict';

var app = angular.module('app',['ngRoute','ipCookie','ngResource','ui.bootstrap','app.routes','app.projects']);

app.directive('closingAlert',closingAlert)
   .directive('hoverPanel',hoverPanel);


hoverPanel.$inject = [];


function hoverPanel(){
    return {
        restrict:"A",
        link:hoverLinkFn
    };
}

function hoverLinkFn(scope,ele,attrs){
    var bgClass = attrs.hoverPanel && 'bg-'+attrs.hoverPanel || 'bg-primary';
    ele.on('mouseover',function(e){
        if(!ele.hasClass(bgClass)){
            ele.addClass(bgClass);
        }
    });
    ele.on('mouseout',function(e){
        if(ele.hasClass(bgClass)){
            ele.removeClass(bgClass);
        }
    });
}


closingAlert.$inject = ['$timeout'];

function closingAlert($timeout){
    return {
        restrict:'EA',
        template:'<div ng-class="thisAlert.cls">' 
                    +'<span ng-click="thisAlert.close()" class=close>X</span>'
                    +'{{ thisAlert.msg }}'
                    +'</div>',
        scope:{
            alertCls:"@",
            alertMsg:"@"
        },
        replace:true,
        link:closingAlertLinkFn.apply(null,arguments)
    };
}

//closingAlertLinkFn.$inject = ['$timeout'];


function closingAlertLinkFn($timeout){
    return function(scope,ele,attrs){
        scope.thisAlert = {};
        scope.thisAlert.msg = attrs.alertMsg;
        scope.thisAlert.cls = "alert alert-"+attrs.alertCls;
        scope.thisAlert.close = closeFn;

        $timeout(function() {
            closeFn();
        }, 5000);

        function closeFn(){
            return ele.remove();
        }
    };
}


