'use strict';

var app = angular.module('app',['ngRoute','ipCookie','ngResource','ui.bootstrap','app.routes','app.projects']);

app.directive('closingAlert',closingAlert);

closingAlert.$inject = [];

function closingAlert(){
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
        link:closingAlertLinkFn
    };
}

//closingAlertLinkFn.$inject = ['

function closingAlertLinkFn(scope,ele,attrs){
    scope.thisAlert = {};
    scope.thisAlert.msg = attrs.alertMsg;
    scope.thisAlert.cls = attrs.alertCls;
    scope.thisAlert.close = closeFn;

    function closeFn(){
        return ele.remove();
    }
}


