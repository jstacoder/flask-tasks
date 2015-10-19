
var tape = require('tape'),
    q = require('q'),
    mainTest = function(){ /*var document = require('jsdom').jsdom('<html><head></head><body></body></html>'), window = document.defaultView; require('angular'); require('./socket.io.js'); window.io = require('socket.io-client');*/
    require('./flask_tasks/static/js/app.js'); 
    require('./flask_tasks/static/js/app/projects.js'); 
    require('./flask_tasks/static/js/app/tasks.js');
    require('./flask_tasks/static/js/app/routes.js');
    require('./flask_tasks/static/js/app/socket.js');
    require('./pusher.min.js');
    require('pusher-angular');
    require('./flask_tasks/static/js/app/projects/add.js');
    require('./flask_tasks/static/js/app/projects/list.js');
    require('./flask_tasks/static/js/app/projects/edit.js');
    require('./flask_tasks/static/js/app/projects/delete.js');
    require('./flask_tasks/static/vendor/angular-route/angular-route.js');
    require('./flask_tasks/static/vendor/angular/angular-touch.js');
    require('./flask_tasks/static/vendor/angular-cookie/angular-cookie.js');
    require('./flask_tasks/static/vendor/angular-resource/angular-resource.js');
    require('./flask_tasks/static/vendor/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js');

    var angular = require('angular-node-updated');
    var inject = ng_bootstrap('app');
    var $inject = ng_injector('app');
    //var $injector = angular.injector([angular.module('app',[]).name]);
    var addTaskToProj = ng_load('addTaskToProject',['app']),
        sortByPriority = ng_load('sortByPriority'),
        $q = ng_load('$q');

    tape.test('sortTasks',function(t){
        var tasks = [
            {
                name:'test1',
                priority:4
           },
            {
                name:'test2',
                priority:1
            },
            {
                name:'test3',
                priority:2
            }
        ],
            sortedTasks = sortByPriority(tasks);
        t.equals(sortedTasks['1'].length,1);
        t.equals(sortedTasks['2'].length,1);
        t.equals(sortedTasks['4'].length,1);
        t.equals(sortedTasks['3'].length,0);
        t.equals(sortedTasks['5'].length,0);
        t.end();
    });
        $inject(function($controller,$rootScope,$window,$interpolate){
    tape.test('MainCtrl',function(t){
            var $scope = $rootScope.$new();
            var ctrl = $controller('MainCtrl',{socket:{on:function(){}},$rootScope:$rootScope,$scope:$scope});
            console.log($interpolate('{{ aVar }}')({aVar:55}));
            console.log(ctrl.getPrioritys());
            ctrl.setPriorityValue(2);
            ctrl.setPriorityValue(3);
            t.equals(ctrl.getPrioritys(2),true);
            t.equals(ctrl.getPrioritys(3),true);
            t.equals(ctrl.needsFilter(),false);
            t.end();
        });
    });
        $inject(function($compile,$rootScope){
    tape.test('dirs',function(t){
            var e = '<bs-panel type=default use-body=0 title="my title"></bs-panel>',
                scope = $rootScope.$new(),
            dom = $compile(e)(scope);
            var isolatedScope = dom.isolateScope();
            scope.$digest();
            t.equals(isolatedScope.type,'default');
            console.log(dom.html());
            console.log(document.COMMENT_NODE);
            console.log(document.ELEMENT_NODE);
            scope.$destroy();
        t.end();
        });
    });
};

module.exports = mainTest;

tape.test('main',function(t){
    q.when(mainTest()).then(function(){
        t.end();
    });
});
