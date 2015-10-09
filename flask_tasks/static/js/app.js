'use strict';

var app = angular.module('app',[
        'ngRoute','ipCookie','ngResource','app.socket',
        'ui.bootstrap','app.routes','app.projects',
        'app.projects.edit','app.tasks','app.projects.add',
        'app.projects.delete','app.projects.list','ngTouch'
]);

app.run(['$rootScope','projectFactory','getProject','$q',function($rootScope,projectFactory,getProject,$q){
    $rootScope.counts = {};

    $rootScope.decrementCount = function(pid){
        $rootScope.counts[pid]--;
    };
    $rootScope.incrementCount = function(pid){
        $rootScope.counts[pid]++;
    };
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

app.controller('MainCtrl',MainCtrl)
   .directive('closingAlert',closingAlert)
   .directive('hoverColor',hoverColor)
   .directive('bsPanel',bsPanel)
   .directive('bsAlert',bsAlert)
   .directive('hoverBg',hoverBg)
   .directive('hoverIcon',hoverIcon)
   .directive('bsCheckBox',bsCheckBox)
   .factory('launchModal',launchModal);


launchModal.$inject = ['$modal','$rootScope'];

function launchModal($modal,$rootScope){
    return function(title,content,confirmation){
        var $scope = $rootScope.$new();
        $scope.content = content;
        $scope.title = title;
        $scope.confirmation = confirmation;
        return $modal.open(
            {
                animation: true,
                templateUrl: 'ModalContent.html',
                controller: 'GenericModalInstanceCtrl',
                size: 'lg',
                scope:$scope
            }
        ).result;
    };
}

function GenericModalInstanceCtrl(){
    var self = this;
}

bsCheckBox.$inject = [];

function bsCheckBox(){
    return {
        restrict:"A",
        require:"?^ngModel",
        link:bsCheckBoxLinkFn,
    };
    function bsCheckBoxLinkFn(scope,ele,attrs,ctrl){
            console.log(arguments);
            var cls = ele.attr('class'),
                newEl = angular.element(document.createElement('span'))
                           .addClass('fa')
                           .addClass('fa-circle-o')                           
                           .addClass('radio-inline')
                           .addClass('fa-2x')
                           .attr('value',attrs.value)                                   
                           .css('margin-left','-10px'),
                    par = ele.parent(),
                    newCls = newEl.attr('class');
        newEl.attr('class',newCls+' '+cls);
        ele.addClass('hidden');
        if(ctrl.$viewValue==scope.name){
            newEl.removeClass('fa-circle-o')
                .addClass('fa-dot-circle-o');

        }
        replaceEl(ele,newEl);

        newEl.on('click',function(e){
            var els = [];
            angular.forEach(document.querySelectorAll('input[type=radio]'),function(itm){ 
                console.log(itm);
                console.log(angular.element(itm).next()); 
                els.push(angular.element(itm).next()); 
            });
            console.log(els);
            console.log('CURRENT: ',ctrl.$viewValue);
            if(ctrl.$viewValue==scope.name){
                console.log(scope);
                ctrl.$setViewValue(null,e.type);
                newEl.removeClass('fa-dot-circle-o')
                     .addClass('fa-circle-o');
            }else{
                ctrl.$setViewValue(scope.name,e.type);
                newEl.removeClass('fa-circle-o')
                     .addClass('fa-dot-circle-o');
            }
                angular.forEach(els,function(itm){
                    console.log(itm);
                    var scopeVal = parseInt(scope.name),
                        itmVal = parseInt(itm.attr('value'));

                    console.log(itmVal);
                    console.log(scopeVal);
                    if(itmVal!=scopeVal){
                        console.log('found******');
                        if(itm.hasClass('fa-dot-circle-o')){
                            itm.removeClass('fa-dot-circle-o')
                            .addClass('fa-circle-o');
                        }
                    }
                });
            
            console.log('CURRENT: ',ctrl.$viewValue);
            console.log(ele,newEl,scope,ctrl);
            //replaceEl(ele,newEl);
        });
        function replaceEl(oldEl,newEl){
            var parent = oldEl.parent();
            oldEl.addClass('hidden');
            parent.append(newEl);            
        }
    }
}

MainCtrl.$inject = ['socket','$rootScope','$scope'];

function MainCtrl(socket,$rootScope,$scope){
    var self = this;
    $scope.priority_values = {
            '1':false,
            '2':false,
            '3':false,
            '4':false,
            '5':false
    };

    $scope.prioritys = function(n){
        return $scope.priority_values[n]; 
    };
    $scope.setPriority = function(n){
        var func = function(){$scope.priority_values[n] = !$scope.priority_values[n];};
        $scope.$$phase ? func() : $scope.$apply(func);        
    };
    $scope.priorityClass = function(n){
            return $scope.priority_values[n] ? 'active' : '';
    };
    $scope.needsFilter = function(){
        var res = [];
        angular.forEach($scope.priority_values,function(itm){
            if($scope.priority_values[itm]){
                res.push(itm);
            }
        });
        return res.length;
    };

    
    socket.on('msg',function(data){
        console.log(data);
        console.log(angular.fromJson(data));
    });
}

hoverIcon.$inject = [];

function hoverIcon(){
    return {
        restrict:"E",
        scope:{
            icon:"@"
        },
        link:hoverIconLinkFn
    };
    function hoverIconLinkFn(scope,ele,attrs){
        function getSpan(){
            return angular.element(document.createElement('span'));
        }
        var noHoverEl  = getSpan().addClass('fa').addClass('fa-circle-thin').addClass('fa-2x'),
            hoverEl =getSpan().addClass('fa-stack').addClass('fa-lg'),
            outerHoverEl = getSpan().addClass('fa').addClass('fa-circle-thin').addClass('fa-stack-2x'),
            innerHoverEl = getSpan().addClass('fa').addClass('fa-remove').addClass('text-danger').addClass('fa-stack-1x'),
            old;
        hoverEl.append(outerHoverEl.append(innerHoverEl));
        ele.append(noHoverEl);
        ele.on('mouseover',function(){
            ele.replaceWith(hoverEl);
            ele = hoverEl;
        });
        ele.on('mouseleave',function(e){
            console.log('mouse out',e);

            ele.replaceWith(noHoverEl);
            ele = noHoverEl;

        });
    }
}


bsAlert.$inject = ['$timeout'];

function bsAlert($timeout){
    return {
        restrict : "E",
        scope:{
            type:"@",
            msg:"@"
        },
        template:'<div class="alert alert-{{ type }}">'
                    +'{{ msg }}'
                +'</div>',
        link:function bsAlertLinkFn(scope,ele,attrs){
            scope.type = attrs.type;
            scope.msg = attrs.msg;
            $timeout(function(){
                ele.remove();
            },2500);
        }
    };
}

bsPanel.$inject = [];

function bsPanel(){
    return {
        restrict:"E",
        transclude:true,
        //replace:true,
        template:'<div>'
                    +'<div class="panel panel-{{ type }}">'
                        +'<div class="panel-heading" ng-if=title>'
                            +'<h3 class=panel-title>{{ title }}</h3>'
                        +'</div>'
                        +'<div ng-if="usebody" class="panel-body">'
                            +'<ng-transclude></ng-transclude>'
                        +'</div>'
                        +'<ng-transclude ng-if="!usebody"></ng-transclude>'
                    +'</div>'
                +'</div>',
        scope:{
            title:"@",
            useBody:"@",
            type:"="
        },
        link:bsPanelLinkFn
    };
}

function bsPanelLinkFn(scope,ele,attrs){
    scope.type = attrs.type;
    scope.title = attrs.title;
    scope.usebody = attrs.useBody;
    //ele.addClass('panel').addClass('panel-'+scope.type);
}

function hoverBg(){
    return {
        restrict:"A",
        link:hoverBgLinkFn
    };
}

function hoverBgLinkFn(scope,ele,attrs){    
    var bgColor = getContextClass(attrs.bgColor) || 'success',
        bgClass = 'bg-'+bgColor;
    ele.on('mouseover',function(e){
        ele.addClass(bgClass)
           .css('cursor','pointer');
    });
    ele.on('mouseout',function(e){
        ele.removeClass(bgClass);
    });
    
}

function getContextClass(ctx){
    return {
        'green':'success',
        'blue':'primary',
        'yellow':'warning',
        'red':'danger',
        'teal':'info'
    }[ctx];
}

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


