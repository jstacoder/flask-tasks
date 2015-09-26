'use strict';

var app = angular.module('app.projects',[]);

app.factory('projectFactory',projectFactory)
    .factory('getProject',getProject)
    .factory('getActiveProjects',getActiveProjects)
    .service('projectManager',projectManager)
    .controller('HomeCtrl',HomeCtrl)
    .controller('ProjCtrl',ProjCtrl);


ProjCtrl.$inject = ['project'];

function ProjCtrl(project){
    var self = this;

    self.project = project;
}

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

getActiveProjects.$inject = ['projectFactory','getProject'];

function getActiveProjects(projectFactory,getProject){
    var projects = [];
    return function getActive(){
        projectFactory.query(function(res){
            res.forEach(function(itm){
                projects.push(getProject(itm.id));
            });
        });
        return projects;
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
    return $resource('/api/v1/projects/view/:id/tasks',{id:'@id'},{
        query:{
            method:"GET",
            url:"/api/v1/projects/list",
            isArray:true,
        },
    });
}
