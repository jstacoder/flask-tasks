'use strict';

var app = angular.module('app',['ngRoute','ipCookie','ngResource','ui.bootstrap','app.routes','app.projects']);

app.run(['$rootScope','projectFactory','getProject','$q',function($rootScope,projectFactory,getProject,$q){
    $rootScope.counts = {};
    function addRootProjects(){
        $rootScope.projects = [];
        projectFactory.query(function(res){
            res.forEach(function(itm){
                var proj = getProject(itm.id);
                if($rootScope.projects.indexOf(proj)==-1){
                    $rootScope.projects.push(proj);
                }
                console.log($rootScope.projects);        
            });
                console.log($rootScope.projects);        
            return $q.all($rootScope.projects);
        }).$promise.then(function(res){
            console.log('updateing!!!!');
            console.log($rootScope.projects);        
            $rootScope.resetCounts(true);          
        });
    }
    $rootScope.getActiveCount = function(pid){
        $rootScope.setActiveCount(pid)
        return $rootScope.counts[pid];
    };
    $rootScope.setActiveCount = function(pid){
        var c = 0;
        var proj;
        angular.forEach($rootScope.projects,function(itm){
            if(itm.id==parseInt(pid)){
                proj = itm;
            }
        });
        angular.forEach(proj.tasks,function(itm){
            if(!itm.complete){
                c++;
            }
        });
        if(!$rootScope.counts){
            $rootScope.counts = {};
        }
        $rootScope.counts[pid] = c;
    };
    $rootScope.resetCounts = function(fromRoot){
        if(!fromRoot){
            addRootProjects();
        }
        console.log($rootScope.projects);
        angular.forEach($rootScope.projects,function(itm){
            $q.when(itm.$promise).then(function(res){
                console.log('setting active ',res,itm,itm.id);
                $rootScope.setActiveCount(itm.id);
            });
        });
    };
    $rootScope.$on('complete-task',function(e){
        console.log('EMITTING COMP{LETE');
        $rootScope.resetCounts();
    });
    $rootScope.resetCounts();
}]);

app.directive('closingAlert',closingAlert)
   .directive('hoverColor',hoverColor);

function hoverColor(){
    return {
        restrict:"A",
        link:hoverLinkFn
    };
}

function hoverLinkFn(scope,ele,attrs){
    var bgColor = attrs.hoverColor || 'green',
        oldColor = ele.css('background-color');
    ele.on('mouseover',function(e){
        ele.css('background-color',bgColor)
           .css('cursor','pointer');
    });
    ele.on('mouseout',function(e){
        ele.css('background-color',oldColor);
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


