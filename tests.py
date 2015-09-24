import json
try:
    from flask import _app_ctx_stack as ctx
except:
    from flask import _request_ctx_stack as ctx
from flask_tasks.messages import socket
from unittest import TestCase
from flask_tasks import get_app,settings,models
from flask_tasks.tasks.models import Task
from flask_tasks.projects.models import Project
from seed import seed

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

process_tasks = lambda tasks: map(lambda x: x.get('url') and x.pop('url'),tasks) and map(lambda x: x.get('due_date') and x.pop('due_date'),tasks) and map(lambda x: x.get('project') and x.get('project').get('url') and x.get('project').pop('url'),tasks) and tasks



class TestTaskApiTestCase(TestCase):
    maxDiff = None
    def setUp(self):
        self.app = get_app(settings.TestConfig,extensions=[socket])
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
        print res
        self.assertEquals(res,{'tasks':process_tasks(map(lambda x: x.to_json(add_urls=False),Task.get_all()))})

    def test_list_all_projects(self):
        res = self.client.get('/api/v1/projects/list').data
        res = json.loads(res)
        print res
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
                        
    def test_add_form(self):
        data = dict(name='task12')
        res = self.client.post('/api/v1/tasks/add',data=data).data
        res = json.loads(res)
        res.pop('url')
        expecting = ADD_TASK_API_RESPONSE
        self.assertEquals(res,expecting)

    def test_add_data(self):
        data = dict(name='task12')
        res = self.client.post('/api/v1/tasks/add',data=json.dumps(data)).data
        res = json.loads(res)
        res.pop('url')
        expecting = ADD_TASK_API_RESPONSE
        self.assertEquals(res,expecting)


    def test_add_json(self):
        data = json.dumps(dict(name='task12'))
        res = self.client.post('/api/v1/tasks/add',data=data,content_type='application/json',content_length=len(data)).data
        res = json.loads(res)
        res.pop('url')
        expecting = ADD_TASK_API_RESPONSE
        self.assertEquals(res,expecting)

    def test_complete_task(self):
        data = dict(task_id=5)
        res = self.client.post('/api/v1/tasks/complete',data=data).data
        self.assertEqual(json.loads(res),dict(success=True,error=None))

    def test_task_completed(self):
        data = dict(task_id=5)
        self.client.post('/api/v1/tasks/complete',data=data)
        res = self.client.get('/api/v1/tasks/view/5').data
        self.assertTrue(json.loads(res)['task']['complete'])
