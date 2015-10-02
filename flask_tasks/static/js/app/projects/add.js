var app = angular.module('app.projects.add',[]);

app.controller('AddProjCtrl',AddProjCtrl);

AddProjCtrl.$inject = ['projects'];

function AddProjCtrl(projects){
    var self = this;
    self.projects = projects;
}




