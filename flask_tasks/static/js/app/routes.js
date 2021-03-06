'use strict';

var app = angular.module('app.routes',[]);

app.filter('fixdate',fixdate);

function fixdate(){
    return function(d){
        var D = new Date(d);
        return D.toDateString();
    };
}

function getActiveProjFunc() {
    return [
        'projectManager','$route','$q',function(projectManager,$route,$q){
            return $q.when(projectManager.getProject($route.current.params.projId)).then(function(res){
               var def = $q.defer(),
                res = [];
               angular.forEach(res.tasks,function(itm){
                    if(!itm.complete){
                        res.push(itm);
                    }
               });
               def.resolve(res);
               return def.promise;
            });

        }
    ];
}
function getProjFunc() {
    return [
        'projectManager','$route',function(projectManager,$route){
            return projectManager.getProject($route.current.params.projId);
        }
    ];
}

function getTaskFunc() {
    return [
        'projectManager','$route',function(projectManager,$route){
            var proj = projectManager.getProject($route.current.params.projId),
                result;
            angular.forEach(proj.tasks,function(itm){
                if(itm.id==parseInt($route.current.params.taskId)){
                    result = itm;
                }
            });
            return result;
        }
    ];
}

app.config(routeConfigFn);

routeConfigFn.$inject = ['$routeProvider','$locationProvider'];

function routeConfigFn($routeProvider,$locationProvider){
    $routeProvider.when('/app',{
        templateUrl:'/static/partials/home.html',
        resolve:{
            projects:['projectManager',function(projectManager){
                return projectManager.getActiveProjects();
            }]
        },
        controller:'HomeCtrl',
        controllerAs:'ctrl'
    })
    .when('/app/project/:projId',{
        templateUrl:'/static/partials/project.html',
        resolve:{
            project:getProjFunc()
        },
        controller:'ProjCtrl',
        controllerAs:'ctrl'
    })
    .when('/app/project/:projId/:taskId',{
        templateUrl:'/static/partials/task.html',
        resolve:{
            project:getProjFunc(),
            task:getTaskFunc(),
            activeTasks:getActiveProjFunc()
        },
        controller:'TaskCtrl',
        controllerAs:'ctrl'
    })
    .when('/app/edit/project/:projId',{
        templateUrl:'/static/partials/editproj.html',
        resolve:{
            project:getProjFunc()
        },
        controller:'EditProjCtrl',
        controllerAs:'ctrl'
    }).when('/app/add/task/mobile/:projId',{
        templateUrl:'/static/partials/mobile-add.html',
        controller:'QuickAddCtrl',
        controllerAs:'ctrl',
        resolve:{
            $modalInstance:function(){ return {};},
            project:getProjFunc()
        }
    }).when('/app/add/task',{
        templateUrl:'/static/partials/add-task.html',
        controller:'AddTaskCtrl',
        controllerAs:'ctrl'
    }).when('/app/add/project',{
        templateUrl:'/static/partials/add-project.html',
        resolve:{
            projects:['projectFactory',function(projectFactory){
                return projectFactory.query(); //getActiveProjects().map(function(itm){console.log(itm,'  ',itm.name); return itm.name;});
            }]
        },
        controller:'AddProjCtrl',
        controllerAs:'ctrl'
    }).when('/app/list/:projId',{
        templateUrl:'/static/partials/project-list.html',
        resolve:{
            project:['projectFactory','$route',function(projectFactory,$route){
                return projectFactory.get({id:$route.current.params.projId});
            }]
        },
        controller:'ProjListCtrl',
        controllerAs:'ctrl'
    }).otherwise({
        redirectTo:'/app'     
    });
    $locationProvider.html5Mode(true);
}
