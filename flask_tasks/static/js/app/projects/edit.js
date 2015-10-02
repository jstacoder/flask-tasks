var app = angular.module('app.projects.edit',[]);

app.controller('EditProjCtrl',EditProjCtrl);

EditProjCtrl.$inject = ['project'];

function EditProjCtrl(project){
    var self = this;

    self.project = project;
}
