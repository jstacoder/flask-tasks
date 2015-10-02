var app = angular.module('app.tasks',[]);

app.controller('AddTaskCtrl',AddTaskCtrl)
   .factory('addTask',addTask);

addTask.$inject = ['$http','$q'];

function addTask($http,$q){
    return function(task){
        var def = $q.defer();
        $http.post('/api/v1/tasks/add',task).then(function(res){
            def.resolve(res.data);
        });
        return def.promise;
    };
}

AddTaskCtrl.$inject = ['addTask','$timeout','$rootScope'];

function AddTaskCtrl(addTask,$timeout,$rootScope){
    var self = this;
    self.task = {};
    self.submitting = false;
    self.submitTask = function(){
        self.task.project_id = $rootScope.projects[self.task.project_id].id;
        console.log('PID: ',self.task.project_id);        
        submitTask(self.task);
    }

    function submitTask(task){
        self.submitting = true;        
        addTask(task).then(function(res){
            $timeout(function(){
                console.log(res);
                self.submitting = false;
                self.submitted = true;
                self.task = {};
                $rootScope.projects.filter(function(itm){
                    return itm.id==res.project.id;
                })[0].tasks.push(res);
                $rootScope.counts[res.project.id]++;
            },2500);
        });
    }
}
