import json
from flask_tasks.messages import socket
from unittest import TestCase
from flask_tasks import get_app,settings,models
from flask_tasks.tasks.models import Task
from flask_tasks.projects.models import Project
from seed import seed

class TestTaskApiTestCase(TestCase):
    def setUp(self):
        self.app = get_app(settings.TestConfig,extensions=[socket])
        self.client = self.app.test_client()
        with self.app.test_request_context():
            models.BaseMixin.metadata.bind = models.BaseMixin.engine
            models.BaseMixin.engine.echo = True
            models.BaseMixin.metadata.drop_all()
            models.BaseMixin.metadata.create_all()
            seed()

    def tearDown(self):
        with self.app.test_request_context():
            models.BaseMixin.metadata.bind = models.BaseMixin.engine
            models.BaseMixin.engine.echo = True
            models.BaseMixin.metadata.drop_all()

    def test_list_all_tasks(self):
        res = self.client.get('/api/v1/tasks/list').data
        res = json.loads(res)
        self.assertEquals(res,{'tasks':map(lambda x: x.to_json(),Task.get_all())})

    def test_list_all_projects(self):
        res = self.client.get('/api/v1/projects/list').data
        res = json.loads(res)
        self.assertEquals(res,{'projects':map(lambda x: x.to_json(),Project.get_all())})

    def test_view_one_task(self):
        res = self.client.get('/api/v1/tasks/view/2').data
        self.assertEqual(json.loads(res),{
                                        "task": {
                                            "complete": False, 
                                            "id": 2, 
                                            "name": "task2", 
                                            "priority": "5"
                                        }
                                    }
                        
        )

    def test_view_one_project(self):
        res = self.client.get('/api/v1/projects/view/1').data
        self.assertEqual(json.loads(res),{
                                        "project": {
                                            "id": 1, 
                                            "name": "test", 
                                        }
                                    }
        )
                        
    def test_add_form(self):
        data = dict(name='task11')
        res = self.client.post('/api/v1/tasks/add',data=data).data
        expecting = {'res':{
                        "complete": False, 
                        "id": 11, 
                        "name": "task11", 
                        "priority": "5"
                    }
        }
        self.assertEquals(json.loads(res),expecting)

    def test_add_data(self):
        data = dict(name='task12')
        res = self.client.post('/api/v1/tasks/add',data=json.dumps(data)).data
        expecting = {'res':{
                        "complete": False, 
                        "id": 11, 
                        "name": "task12", 
                        "priority": "5"
                    }
        }
        self.assertEquals(json.loads(res),expecting)


    def test_add_json(self):
        data = json.dumps(dict(name='task12'))
        res = self.client.post('/api/v1/tasks/add',data=data,content_type='application/json',content_length=len(data)).data
        expecting = {'res':{
                        "complete": False, 
                        "id": 11, 
                        "name": "task12", 
                        "priority": "5"
                    }
        }
        self.assertEquals(json.loads(res),expecting)

    def test_complete_task(self):
        data = dict(task_id=5)
        res = self.client.post('/api/v1/tasks/complete',data=data).data
        self.assertEqual(json.loads(res),dict(success=True,error=None))

    def test_task_completed(self):
        data = dict(task_id=5)
        org = self.client.get('/api/v1/tasks/list').data
        org = json.loads(org)
        map(lambda x: x.get('id') == 5 and org.get('tasks').pop(org.get('tasks').index(x)),org.get('tasks'))
        self.client.post('/api/v1/tasks/complete',data=data)
        res = self.client.get('/api/v1/tasks/list').data
        self.assertEquals(org,json.loads(res))

    

