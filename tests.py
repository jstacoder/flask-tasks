import json
from flask import url_for
from flask_tasks.messages import socket
from unittest import TestCase
from flask_tasks import get_app,settings,models
from flask_tasks.tasks.models import Task
from flask_tasks.projects.models import Project
from seed import seed

excludes = [
    'url',
    'tasks'
]

TASK_VIEW_API_RESPONSE = { 
    u'task': {
        u'complete': False,
        u'id': 2,
        u'name': u'task2',
        u'priority': u'5',
        u'project': {
            u'id': 1,
        }
    }
}

ADD_PROJ_API_RESPONSE = {
    u'id': 2,
    u'name': u"test2",
}
        
ADD_TASK_API_RESPONSE = {
    u'complete': False,
    u'id': 11,
    u'name': u'task12',
    u'priority': u'5',
}

PROJ_VIEW_API_RESPONSE = {
    u'project': {
        u'id': 1,
        u'name': u'test',
    }
}

process_tasks = lambda tasks:\
                    map(
                        lambda x: x.get('url') and\
                                  x.pop('url'),tasks
                    ) and map(
                        lambda x: x.get('due_date') and\
                                  x.pop('due_date'),tasks
                    ) and map(
                        lambda x: x.get('project') and\
                                  x.get('project')\
                                   .get('url') and x\
                                   .get('project')\
                                   .pop('url'),tasks
                    ) and tasks

class TestTaskApiTestCase(TestCase):
    maxDiff = None

    def url_for(self,*args,**kwargs):
        rtn = ''
        with self.app.test_request_context():
            rtn = url_for(*args,**kwargs)
        return rtn

    def setUp(self):
        self.app = get_app(settings.TestConfig,extensions=[socket],reset_db=True)
        self.client = self.app.test_client()
        with self.app.test_request_context():
            models.BaseMixin.metadata.bind = models.BaseMixin.engine
            models.BaseMixin.engine.echo = False
            models.BaseMixin.metadata.drop_all()
            models.BaseMixin.metadata.create_all()
            seed()

    def tearDown(self):
        with self.app.test_request_context():
            models.BaseMixin.metadata.bind = models.BaseMixin.engine
            models.BaseMixin.engine.echo = False
            models.BaseMixin.metadata.drop_all()

    def test_list_all_tasks(self):
        res = self.client.get('/api/v1/tasks/list').data
        res = json.loads(res)
        res['tasks'] = process_tasks(res['tasks'])
        self.assertEquals(res,{'tasks':process_tasks(map(lambda x: x.to_json(add_urls=False),Task.get_all()))})

    def test_list_all_projects(self):
        res = self.client.get('/api/v1/projects/list').data
        res = json.loads(res)
        map(lambda proj: proj.pop('tasks'),res['projects'])
        self.assertEquals(res,{'projects':map(lambda x: x.to_json(add_urls=False),Project.get_all())})

    def test_view_one_task(self):
        res = self.client.get('/api/v1/tasks/view/2').data
        res = json.loads(res)
        res.get('task').pop('due_date')
        res.get('task').get('project').pop('url')        
        self.assertEqual(res,TASK_VIEW_API_RESPONSE)

    def test_view_one_project(self):
        res = self.client.get('/api/v1/projects/view/1').data
        res = json.loads(res)
        res.get('project').pop('tasks')
        self.assertEqual(res,PROJ_VIEW_API_RESPONSE)
                        
    def test_add_project_form(self):
        self._test_add_form('projects',ADD_PROJ_API_RESPONSE,excludes=excludes,name='test2')

    def test_add_project_data(self):
        self._test_add_data('projects',ADD_PROJ_API_RESPONSE,excludes=excludes,name='test2')

    def test_add_project_json(self):
        self._test_add_json('projects',ADD_PROJ_API_RESPONSE,excludes=excludes,name='test2')

    def test_add_task_form(self):
        self._test_add_form('tasks',ADD_TASK_API_RESPONSE,excludes=excludes,name='task12')

    def test_add_task_data(self):
        self._test_add_data('tasks',ADD_TASK_API_RESPONSE,excludes=excludes,name='task12')

    def test_add_task_json(self):
        self._test_add_json('tasks',ADD_TASK_API_RESPONSE,excludes=excludes,name='task12')

    def test_complete_task(self):
        data = dict(task_id=5)
        res = self.client.post('/api/v1/tasks/complete',data=data).data
        self.assertEqual(json.loads(res),dict(success=True,error=None))

    def _send_add_request(self,model,data,content_type=None):
        opts = {}
        if content_type:
            opts['content_type'] = content_type
            if 'json' in content_type:
                opts['content_length'] = len(data)
        return json.loads(self.client.post('/api/v1/{0}/add'.format(model),data=data,**opts).data)

    def _add_test(self,data_func,model,expected_response,excludes=None,content_type=None,*args,**kwargs):
        _kwargs = {}
        if content_type is not None:
            kwargs['content_type'] = content_type
            _kwargs['content_type'] = content_type
        res = self._send_add_request(
                                model = model,
                                data = data_func(*args,**kwargs),
                                **_kwargs
        )
        if excludes is not None:
            for itm in excludes:
                if itm in res:
                    res.pop(itm)
        self.assertEquals(res,expected_response)

    '''
    def _test_add_form(self,model,expected_response,excludes=None,**kwargs):
        def data_func(*args,**kwargs):
            return dict(**kwargs)
        return self._add_test(data_func,model,expected_response,excludes)
    '''
    def _test_add_form(self,model,expected_response,excludes=None,**kwargs):
        data = dict(**kwargs)
        res = self._send_add_request(model,data=data)        
        if excludes:
            for itm in excludes:
                if itm in res:
                    res.pop(itm)
        expecting = expected_response
        self.assertEquals(res,expecting)

    def test_add_project_then_task(self):
        data = json.dumps(dict(name='test'))
        res = self._send_add_request('projects',data,content_type='application/json')        
        proj_id = res.get('id')
        data = json.dumps(dict(name='test-task1',project_id=proj_id))
        res = self._send_add_request('tasks',data,content_type='application/json')
        task_id = res.get('id')
        res = self.client.get('/api/v1/tasks/view/{0}'.format(task_id)).data
        if res:
            res = json.loads(res)
            new_proj_id =  res['task']['project']['id']
        else:
            print 'no res', res
        self.assertEquals(new_proj_id,proj_id)

    def test_create_test_urls(self):
        self.assertEquals(self.url_for('tasks_api.complete_task'),'/api/v1/tasks/complete')

    def test_task_completed(self):
        data = dict(task_id=5)
        self.client.post('/api/v1/tasks/complete',data=data)
        res = self.client.get('/api/v1/tasks/view/5').data
        self.assertTrue(json.loads(res)['task']['complete'])

    def _test_add_data(self,model,expected_response,excludes=None,**kwargs):
        data = dict(**kwargs)
        res = self._send_add_request(model,json.dumps(data))                
        if excludes:
            for itm in excludes:
                if itm in res:
                    res.pop(itm)
        expecting = expected_response
        self.assertEquals(res,expecting)

    def _test_add_json(self,model,expected_response,excludes=None,**kwargs):
        data = json.dumps(dict(**kwargs))
        res = self._send_add_request(model,data,content_type='application/json')        
        if excludes:
            for itm in excludes:
                if itm in res:
                    res.pop(itm)
        expecting = expected_response
        self.assertEquals(res,expecting)

