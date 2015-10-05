var app = angular.module('app.projects.list',[]);

app.controller('ProjListCtrl',ProjListCtrl)
   .factory('updateTask',updateTask)
   .factory('addTaskToProject',addTaskToProject)
   .controller('QuickAddCtrl',QuickAddCtrl)
   .factory('deleteTask',deleteTask);


deleteTask.$inject = ['$http'];

function deleteTask($http){
    return function(task){
        return $http.post('/api/v1/tasks/delete',{item_id:task.id});
    };
}


QuickAddCtrl.$inject = ['$scope','$modalInstance','addTaskToProject'];

function QuickAddCtrl($scope,$modalInstance,addTaskToProject){
    var self = this;
    self.project = $scope.project;

    resetTask();

    
    function resetTask(){
        self.task = {
            name:'',
            priority:'5',
            due_date:'',
            project_id:$scope.project_id
        };
    }
}

addTaskToProject.$inject = ['$http'];

function addTaskToProject($http){
    return function(task){
        return $http.post('/api/v1/tasks/add',task);
    };
}

updateTask.$inject = ['$http'];

function updateTask($http){
    return function(task){
        return $http.post('/api/v1/tasks/update',task);
    };
}

ProjListCtrl.$inject = ['project','$rootScope','$scope','updateTask','$q','$timeout','$modal','addTaskToProject','deleteTask','socket'];

function ProjListCtrl(project,$rootScope,$scope,updateTask,$q,$timeout,$modal,addTaskToProject,deleteTask,socket){
    var self = this;

    self.needSave = false;
    
    self.project = project;
    self.saved = {}
    self.originalTasks = {};
    self.editing = {};
    self.deletedTasks = [];
    

    $rootScope.$on('DELETE',function(id){
        console.log('WILL NOW REMOVE ',id);
        angular.forEach(self.project.tasks,function(itm,idx){
            if(itm.id==id){
                self.project.tasks.splice(idx,0);
            }
        });
        self.deletedTasks.push(id);
    });
    socket.on('delete:task',function(data){
        console.log('deleting an item');
        if(self.deletedTasks.indexOf(data.item)==-1){
            self.deletedTasks.push(data.item);
        }
    });

    self.deleteTask = function(task){
        deleteTask(task).then(function(res){
            self.deletedTasks.push(task.id);
        });
    };
    self.quickAddSubmit = function(task){
        addTaskToProject(task).then(function(res){
            self.project.tasks.push(res.data);
            $rootScope.incrementCount(self.project.id);
            console.log(res);
            console.log('saving');
        },      
        function(err){
            console.log('error');
        });
    }
    self.quickAdd = function(){
        var modal = $modal.open({
             animation: true,
             templateUrl: 'myFormModal.html',
             controller: 'QuickAddCtrl',
             controllerAs:'ctrl',
             size: 'lg',
             scope:$scope,
         });
         modal.result.then(function(task){
             self.quickAddSubmit(task);
            console.log('done adding to pid: ',self.project_id);        
         },function(){
            console.log('Aborting');
         });
            
    };
    
    $q.when(self.project.$promise).then(function(){
        $scope.project_id = self.project.id;
        $scope.project = self.project.name;
        self.project.tasks.map(function(itm){
            self.editing[itm.id] = false;    
            self.originalTasks[itm.id] = {};
            self.saved[itm.id] = false;
            angular.copy(itm,self.originalTasks[itm.id])
        });
    });
    self.addCount = function(){
        $rootScope.counts[self.project.id]++;
    };
    self.subCount = function(){
        $rootScope.counts[self.project.id]--;
    };
    self.completeTask = function(task){
        var idx = self.project.tasks.indexOf(task);
        self.project.tasks[idx].complete = !task.complete;
        setNeedSave(self.project.tasks[idx]);
        if(self.project.tasks[idx].complete){
            self.subCount();
        }else{
            self.addCount();
        }
    };  
    self.save = function(){
        save();
    };

    self.setNeedSave = function(task){
            setNeedSave(task);
    };
    function resetEdits(){
        angular.forEach(self.project.tasks,function(itm){
            self.editing[itm.id] = false;
        });
    }
    function setNeedSave(task){
        self.needSave = self.changedItems ? true : false;
        self.changedItems = self.changedItems||[];        
        angular.forEach(self.changedItems,function(itm,idx){
            if(itm.id==task.id){
                self.changedItems.splice(idx,1);  
            }
        });        
        
        console.log(self.originalTasks[task.id],task);
        if(!angular.equals(self.originalTasks[task.id],task)){
            console.log('changing');
            self.changedItems.push(task);                
            self.needSave = true;
        }
    }
    function save(){
        if(!self.changedItems){
            return;   
        }
        var promises = [],
            saved = [],
            changes = {};
        angular.forEach(self.changedItems,function(itm){
            self.saved[itm.id] = false;
            saved.push(itm.id);
            changes[itm.id] = itm;
            promises.push(updateTask(itm));
        });
        $q.when($q.all(promises)).then(function(res){
            console.log('DONE SAVING');
            self.changedItems = [];
            self.needSave = false;
            resetEdits();
            angular.forEach(saved,function(itm){
                function doAction(){
                    self.saved[itm] = true;
                    self.originalTasks[itm] = {};
                    angular.copy(changes[itm],self.originalTasks[itm])
                    $timeout(function(){
                        self.saved[itm] = false;
                    },5000);
                }
                $scope.$$phase ? doAction() : $scope.$applyAsync(doAction);
                
            });
        });
    }
}
