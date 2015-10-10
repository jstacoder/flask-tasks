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


QuickAddCtrl.$inject = ['$scope','$modalInstance','addTaskToProject','$routeParams','$rootScope','project','$location'];

function QuickAddCtrl($scope,$modalInstance,addTaskToProject,$routeParams,$rootScope,project,$location){
    var self = this;
    self.project = project;

    resetTask();

    function getProjFromRoot(pid){
        var projects = $rootScope.projects;
        angular.forEach(projects,function(itm){
            if(pid==itm.id){
                return itm;
            }
        });
        return false;
    }

    function submit(task){
        if(task.p_choices){
            task = extractTask(task);
        }
        addTaskToProject(task).then(function(res){
            self.project.tasks.push(res.data);
            $rootScope.incrementCount(self.project.id);
            console.log(res);
            console.log('saving');
            resetTask();
            $location.path('/app/list/'+self.project.id);
        },      
        function(err){
            console.log('error');
        });
    }
    self.submit = function(){
        return submit(extractTask(self.task));    
    };
    function extractTask(task){
        return {
            name:task.name,
            priority:task.priority,
            due_date:task.due_date,
            project_id:task.project_id
        };
    }
    function resetTask(){
        self.task = {
            p_choices:['1','2','3','4','5'],
            name:'',
            priority:'',
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
    self.listTasks = [];

    self.saved = {}
    self.originalTasks = {};
    self.editing = {};
    self.deletedTasks = [];

    var ctxColors = {
        '1':'danger',
        '2':'warning',
        '3':'success',
        '4':'info',
        '5':'primary'
    };
    

    self.getCtxColor = function(n){
        return Object.keys(ctxColors).indexOf(n) > -1 && ctxColors[n];
    }
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
        $scope = resetListTasks($scope);
    });
    socket.on('create:task',function(data){
        console.log('RECEIVED CREATE SIGNAL',data);
        var found = false;
        angular.forEach(self.project.tasks,function(itm){
            if(itm.id==data.id){
                found = true;
            }
        });
        if(!found){
            self.project.tasks.push(data);
        }
        $scope = resetListTasks($scope);
    });
    socket.on('complete:task',function(data){
        console.log('RECEIVED COMPLETE SIGNAL',data);
        $scope = resetListTasks($scope);
    });
    socket.on('update:task',function(data){
        console.log('RECEIVED UPDATE SIGNAL',data);
        var updated = false,
            idx;

        angular.forEach(self.project.tasks,function(itm,i){
            if(itm.id==data.id){
                self.project.tasks[i] = data;
            }
        });
        $scope = resetListTasks($scope);
    });

    self.deleteTask = function(task){
        deleteTask(task).then(function(res){
            self.deletedTasks.push(task.id);
        });
    };
    self.quickAddSubmit = function(task){
        addTaskToProject(task).then(function(res){
            self.project.tasks.push(res.data);
            $scope = resetListTasks($scope);
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
             resolve:{
                project:['$location','launchModal',function($route,launchModal){ 
                    if(self.project){
                        return self.project;
                    }
                    launchModal('not found','sorry').then(function(){
                        $location.path('/app');                            
                    });
                }]
             }
         });
         modal.result.then(function(task){
             self.quickAddSubmit(task);
            console.log('done adding to pid: ',self.project.id);        
         },function(){
            console.log('Aborting');
         });
            
    };
    
    $q.when(self.project.$promise).then(function(){
        angular.forEach(self.project.tasks,function(itm){
            console.log(itm);
            self.listTasks.push(itm);
            console.log(self.listTasks);
        });
        $scope = resetListTasks($scope);
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
    function resetListTasks($scope,coll){
        var tasks = [],
            count = 0,
            showAll,
            coll = coll ? coll : $scope.priority_values;

        angular.forEach(coll,function(itm){
            console.log(itm);
            console.log(count);
            console.log(coll.length);
            if(!itm){
                count++;
            }
        });
        if(count==Object.keys(coll).length){
            $scope.listTasks = self.project.tasks;
            return $scope;
        }
    
        angular.forEach(self.project.tasks,function(itm){                
            if(coll[itm.priority]){
                tasks.push(itm);
            }
        });
        $scope.listTasks = tasks;
        return $scope;
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
    $scope.$watchCollection('priority_values',function(newcoll,oldcoll,scope){
        console.log(arguments);  
        if(!angular.equals(newcoll,oldcoll)){
            console.log(newcoll);
            $scope = resetListTasks($scope,newcoll);
        }
    });
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
