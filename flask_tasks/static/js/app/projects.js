'use strict';

var app = angular.module('app.projects',[]);

app.factory('projectFactory',projectFactory)
    .factory('getProject',getProject)
    .factory('getActiveProjects',getActiveProjects)
    .service('projectManager',projectManager)
    .controller('HomeCtrl',HomeCtrl);

HomeCtrl.$inject = ['projects','$window'];

function HomeCtrl(projects,$window){
    var self = this;

    self.projects = projects;
}

projectManager.$inject = ['getProject','getActiveProjects'];

function projectManager(getProject,getActiveProjects){
    var self = this;

    self.getActiveProjects = function(){
        return getActiveProjects();
    };
    self.getProject = function(pid){
        return getProject(pid);
    };
}

getActiveProjects.$inject = ['projectFactory'];

function getActiveProjects(projectFactory){
    return function getActive(){
        return projectFactory.query();
    };
}

getProject.$inject = ['projectFactory'];

function getProject(projectFactory){
    return function getProject(pid){
        return projectFactory.get({id:pid});
    };
}


projectFactory.$inject = ['$resource'];

function projectFactory($resource){
    return $resource('/api/v1/projects/view/:id',{id:'@id'},{
        query:{
            method:"GET",
            url:"/api/v1/projects/list",
            isArray:false,
        },
        getTasks:{
            method:"GET",
            url:"/api/v1/projects/view/:id/tasks",
            params:{id:"@id"},
            useList:false
        },
        get:{
            url:'/api/v1/projects/view/:id',
            params:{id:"@id"},
            transformResponse:[
                function(data,headers) {
                    return angular.fromJson(data).project,headers;
                },
            ]
        }
    });
}
