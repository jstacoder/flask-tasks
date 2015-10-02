'use strict';

var app = angular.module('app.projects',[]);

app.factory('projectFactory',projectFactory)
    .factory('getProject',getProject)
    .factory('getActiveProjects',getActiveProjects)
    .factory('sortByPriority',sortByPriority)
    .factory('completeTask',completeTask)
    .service('projectManager',projectManager)
    .controller('HomeCtrl',HomeCtrl)
    .controller('ProjCtrl',ProjCtrl)
    .controller('TaskCtrl',TaskCtrl);


function sortByPriority(){
    return function(tasks){
        console.log('PRI: ',tasks);
        var rtn = {
            1:[],
            2:[],
            3:[],
            4:[],
            5:[]
        };
        angular.forEach(tasks,function(task){
            rtn[task.priority].push(task);
        });
        return rtn;
    };
}

TaskCtrl.$inject = ['project','task','activeTasks','$routeParams','$route','$location','$window','$interpolate','$scope'];

function TaskCtrl(project,task,activeTasks,$routeParams,$route,$location,$window,$interpolate,$scope){
    var self = this,
        projectUrlFunc = $interpolate('/app/project/{{ pid }}'),
        changeFunc = $interpolate('/app/project/{{ pid }}/{{ tid }}');

    self.project = project;
    self.task = task;
    self.activeTasks = activeTasks;

    self.getTask = function(){
        var rtn;
        angular.forEach(self.project.tasks,function(itm){
            if(itm.id==self.tid){
                rtn = itm;
            }
        });
        return rtn;
    };

    $scope.$on('$routeChangeStart',function(){
    });
    
    self.tid = parseInt($routeParams.taskId);
    self.taskIdx = getTaskIndex(self.tid);

    self.lastTask = function(){
        var rtn = changeFunc({pid:self.project.id,tid:getLastTask(self.tid)});
        return rtn;
    };
    self.nextTask = function(){
        var rtn = changeFunc({pid:self.project.id,tid:getNextTask(self.tid)});
        return rtn;
    };

    self.hasNext = function(id){
        var active = [],
            idx;
        angular.forEach(self.project.tasks,function(itm){
            if(!itm.complete){
                active.push(itm);
                if(parseInt(id)==itm.id){
                    idx = active.length-1;
                }
            }   
        });
        return (idx+1) && idx != active.length-1;
    }
    self.hasLast = function(id){
        var active = [],
            idx;
        angular.forEach(self.project.tasks,function(itm){
            if(!itm.complete){
                active.push(itm);
                if(parseInt(id)==itm.id){
                    idx = active.length-1;
                }
            }   
        });
        return idx && active.length && idx != 0;
    }
    function getLastTask(id){
        var rtn;
        angular.forEach(self.project.tasks,function(itm){
            if(itm.id<id&&!itm.complete){
                rtn = itm.id;
            }
        });
        return rtn;
    }
    function getNextTask(id){
        var rtn;
        angular.forEach(self.project.tasks,function(itm){
            if(itm.id>id&&!itm.complete&&!rtn){
                rtn = itm.id;
            }
        });
        return rtn;
    }
    self.projectPage = function(pid){
        projectPage(pid);
    };
    function getFromActiveTasks(idx){
        return self.activeTasks[idx];
    }
    function getTaskIndex(tid){
        var rtn;
        angular.forEach(self.project.tasks,function(itm,idx){
            if(itm.id==tid&&!itm.complete){
                rtn = itm.id;
            }
        });
        return rtn;
    }
    function updateActive(){
        activeTasks = self.project && self.project.tasks ? getActive(self.project.tasks) : activeTasks;
        self.activeTasks = activeTasks;
    }
    function getActive(){
        var rtn;
        angular.forEach(self.project.tasks,function(itm){
            if(!itm.complete){
                rtn.push(itm);
            }
        });
        return rtn;
    }
    function projectPage(pid){
        var projUrl = projectUrlFunc({pid:pid});
        $location.path(projUrl).replace();
    }
    function changeTask(n){
        var task = getFromActiveTasks(n);
        $route.updateParams({
            projId:self.project.id,
            taskId:task.id
        });
        if(!$scope.$digest){
            $scope.$apply();
        }
    }
}

ProjCtrl.$inject = ['project','$location','$interpolate','sortByPriority','completeTask','$window','$q','$rootScope'];

function ProjCtrl(project,$location,$interpolate,sortByPriority,completeTask,$window,$q,$rootScope){
    var self = this,
        urlFunc = $interpolate('/app/project/{{ pid }}/{{ tid }}');

    self.project = project;
    sortProj(self.project);
    self.ids = {pid:'',tid:''};
    self.changePage = function(tid,pid){
        setParams(tid,pid);
        changePage();
    };
    self.priorityName = function(n){
        return getPriorityName(n);
    };
    self.completeTask = function(task){
        console.log('priority ',task);
        console.log('tasks ',self.sortedTasks);
        var taskList = self.sortedTasks[task.priority],
            taskIdx = taskList.indexOf(task);        
        completeTask(task);
        taskList.splice(taskIdx,1);
        self.sortedTasks[task.priority] = taskList;
        $rootScope.decrementCount(self.project.id);
        //$rootScope.$emit('complete-task');
    };


    function sortProj(tasks){
        $q.when(tasks.$promise).then(function(tasks){
            console.log('PRI2: ',tasks);
            var rtn = {
                1:[],
                2:[],
                3:[],
                4:[],
                5:[]
            };
            angular.forEach(tasks.tasks,function(task){
                if(!task.complete){
                    rtn[task.priority].push(task);
                }
            });
            self.sortedTasks = rtn;
        });
    }
    function setParams(pid,tid){
        self.ids = {pid:pid,tid:tid};
    }

    function changePage(){
        var pageUrl = urlFunc({pid:self.ids.pid,tid:self.ids.tid});
        $location.url(pageUrl).replace();
        //$window.location.href = pageUrl;
    }
    function getPriorityName(n){
        var prefix = ' Priority Tasks';
        return [
            'High',
            'Medium-High',
            'Medium',
            'Medium-Low',
            'Low'
        ][parseInt(n)-1]+prefix;
    }
}

HomeCtrl.$inject = ['projects','$rootScope'];

function HomeCtrl(projects,$rootScope){
    var self = this;

    self.projects = projects;
    $rootScope.projects = $rootScope.projects || self.projects;
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
    return function getActive(){
        var projects = [];
        projectFactory.query(function(res){
            res.forEach(function(itm){
                var proj = getProject(itm.id);
                if(projects.indexOf(proj)==-1){
                    projects.push(proj);
                }
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

completeTask.$inject = ['projectFactory'];

function completeTask(projectFactory){
    return function(task){
        projectFactory.completeTask({task_id:task.id});
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
        completeTask:{
            method:"POST",
            url:"/api/v1/tasks/complete",
            params:{
                task_id:'task_id'
            }
        }
    });
}
