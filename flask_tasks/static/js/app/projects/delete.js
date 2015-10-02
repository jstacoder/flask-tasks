var app = angular.module('app.projects.delete',[]);

app.factory('deleteProject',deleteProject)
   .factory('removeProjectFromRoot',removeProjectFromRoot);

removeProjectFromRoot.$inject = ['$rootScope'];

function removeProjectFromRoot($rootScope){
    return function(pid){
        var projects = $rootScope.projects,
            proj = projects.filter(function(itm){ return itm.id==pid;})[0],
            idx = projects.indexOf(proj);
        $rootScope.projects.splice(idx,1);
    };
}

deleteProject.$inject = ['$http','$q','$rootScope'];


function deleteProject($http,$q,$rootScope){
    return function(pid){
        return $http.post('/api/v1/projects/delete',{item_id:pid});
    };
}


