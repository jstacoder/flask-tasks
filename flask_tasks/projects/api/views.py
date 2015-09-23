from flask import views,jsonify,request
import requests
from inflection import pluralize
import json
from ..models import Project
from ...views import PostView

class ListProjectView(views.MethodView):
    result_key = 'project'

    def get(self,item_id=None):
        if item_id is None:
            rtn = [p.to_json() for p in Project.get_all() if any(filter(lambda t: (not t.complete), p.tasks))]
            result_key = pluralize(self.result_key)
        else:
            rtn = Project.get_by_id(item_id)
            if rtn:
                rtn = rtn.to_json()
            result_key = self.result_key
        return jsonify({result_key:rtn})

class ListTasksByProjectView(views.MethodView):

    def get(self,item_id):
        proj = Project.get_by_id(item_id)
        result = dict(project=proj.to_json(),tasks=[])
        if proj is not None:
            tasks = proj.tasks.all()
            if request.args:
                if int(request.args.get('complete')):
                    tasks = [t for t in tasks if t.complete]
                else:
                    tasks = [t for t in tasks if not t.complete]
            result['tasks'] = map(lambda x: x.to_json(),tasks)
        return jsonify(**result)

def AddProjectView(PostView):

    def post(self):
        self._process_post()
        proj = Project(**self.data).save().to_json()
        return jsonify(**proj)


        
'''
class PostView(views.MethodView):
    def _process_post(self):
        self.data = ((request.data and json.loads(request.data)) if not request.form else dict(request.form.items())) if not request.mimetype == 'application/json' else request.json

class AddTaskView(PostView):
    def post(self):
        self._process_post()
        data = Task(**self.data).save().to_json()
        return jsonify(res=data)

class CompleteTaskView(PostView):
    def post(self):
        result = dict(success=True,error=None)
        self._process_post()
        task = Task.get_by_id(self.data.get('task_id'))
        if task is not None:
            if not task.complete:
                task.complete = True
                task.save()
            else:
                result = dict(success=False,error='task already complete')
        else:
            result = dict(success=False,error='task with id {} not found'.format(self.data.get('task_id')))
        return jsonify(result)


            


'''
