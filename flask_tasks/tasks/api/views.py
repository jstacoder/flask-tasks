from flask import views,jsonify,request
from inflection import pluralize
import json
from ..models import Task
from ...views import PostView,_jsonify


class ListTaskView(views.MethodView):
    def get(self,item_id=None):
        if item_id is None:
            rtn = [t.to_json() for t in Task.get_all() if not t.complete]
            result = _jsonify(rtn)
        else:
            rtn = Task.get_by_id(item_id)
            if rtn:
                rtn = rtn.to_json(in_list=False)
                result = jsonify(**rtn)
            else:
                rtn = jsonify(**{'error':'task with id {0} not found'.format(item_id)})
        return result


class AddTaskView(PostView):
    def post(self):
        self._process_post()
        if type(self.data) == str:
            print self.data
            
            self.data = json.loads(self.data)
        data = Task(**self.data).save().to_json()
        return jsonify(**data)

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


            


