var app = angular.module('app.projects.add',[]);

app.controller('AddProjCtrl',AddProjCtrl);

AddProjCtrl.$inject = ['projects','deleteProject','removeProjectFromRoot'];

function AddProjCtrl(projects,deleteProject,removeProjectFromRoot){
    var self = this;
    self.projects = projects;
    self.deleteProj = function(pid){
        deleteProject(pid);
        removeProjectFromRoot(pid);
        removeProjectFromPage(pid);
        self.msg = 'deleted '+pid;
        console.log('done removing pid: ',pid);
    };
    self.getmsg = function(){
        return self.msg && self.msg;
    };

    function removeProjectFromPage(pid){
        var projects = self.projects,
            proj = projects.filter(function(itm){ return itm.id==pid;})[0],
            idx = projects.indexOf(proj);
        self.projects.splice(idx,1);
    }

}




