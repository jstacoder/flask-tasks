var app = angular.module('app.projects.add',[]);

app.controller('AddProjCtrl',AddProjCtrl)
   .factory('addProjectToRoot',addProjectToRoot)
   .factory('addProject',addProject)
   .controller('ModalInstanceCtrl',ModalInstanceCtrl)
   .factory('projectPage',projectPage);


projectPage.$inject = ['$interpolate','$location'];

function projectPage($interpolate,$location){
    var urlFunc = $interpolate('/app/project/{{ pid }}');
    return function(pid){
        return $location.path(urlFunc({pid:pid})).replace();
    };
}


addProject.$inject = ['$http'];

function addProject($http){
    return function(project){
        return $http.post('/api/v1/projects/add',project);
    };
}


addProjectToRoot.$inject = ['$rootScope'];

function addProjectToRoot($rootScope){
    return function(project){
        var projects = $rootScope.projects;
        if(!projects.filter(function(itm){
            return itm.name == project.name;
        }).length){
            if(!project.tasks){
                project.tasks = [];
            }
            $rootScope.projects.push(project);
            $rootScope.counts[project.id] = 0;
        }
            
    };
}

AddProjCtrl.$inject = ['projects','deleteProject','removeProjectFromRoot','addProjectToRoot','addProject','$modal','$scope','projectPage'];

function AddProjCtrl(projects,deleteProject,removeProjectFromRoot,addProjectToRoot,addProject,$modal,$scope,projectPage){
    var self = this;
    self.projects = projects;
    self.project = {};

    self.goToProject = function(pid){
        console.log('pressed!!!');
        return projectPage(pid);
    };

    self.deleteProj = function(pid){
         $scope.project_id = pid;
         $scope.project = self.projects[getProjectIndexById(pid)];
         $scope.title = 'confirm project deletion';
         $scope.content = 'Are you Sure you want to delete '+ $scope.project.name +'?';
         var modalInstance = $modal.open({
             animation: true,
             templateUrl: 'myModalContent.html',
             controller: 'ModalInstanceCtrl',
             size: 'lg',
             scope:$scope,
             resolve: {
                 items: function () {
                     return ['a','b','c'];
                 }
             }
         });
         modalInstance.result.then(function(){
            deleteProject(pid);
            removeProjectFromRoot(pid);
            removeProjectFromPage(pid);
            self.msg = 'deleted '+pid;
            console.log('done removing pid: ',pid);        
         },function(){
            console.log('Aborting');
         });
    };
    self.submit = function(){
        addProject(self.project).then(function(res){
            self.project = res.data;
            addProjectToRoot(self.project);
            addProjectToPage(self.project);
            self.project = {};
        });
    };
    self.getmsg = function(){
        return self.msg && self.msg;
    };

    function getProjectIndexById(pid){
        var projects = self.projects,
            proj = projects.filter(function(itm){ return itm.id==pid;})[0],
            idx = projects.indexOf(proj);
        return idx;
    }
    function removeProjectFromPage(pid){
        self.projects.splice(
            getProjectIndexById(pid)
        ,1);
    }
    function addProjectToPage(project){
        self.projects.push(project);
    }
}

ModalInstanceCtrl.$inject = ['$scope','$modalInstance','items'];

function ModalInstanceCtrl($scope,$modalInstance,items){
      $scope.items = items;
        $scope.selected = {
            item: $scope.items[0]
        };
        
        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
}



