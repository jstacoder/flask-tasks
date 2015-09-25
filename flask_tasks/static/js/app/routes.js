'use strict';

var app = angular.module('app.routes',[]);

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
            project:['projectManager','$routeParams',function(projectManager,$routeParams){
                return projectManager.getProject($routeParams.projId);
            }]
        },
        controller:'ProjCtrl',
        controllerAs:'ctrl'
    })
    .otherwise({
        redirectTo:'/'            
    });
    $locationProvider.html5Mode(true);
}
