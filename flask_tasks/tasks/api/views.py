from flask import views,jsonify,request
from inflection import pluralize
import json
from ..models import Task
from ...views import PostView


class ListTaskView(views.MethodView):
    result_key = 'task'

    def get(self,item_id=None):
        if item_id is None:
            rtn = [t.to_json() for t in Task.get_all() if not t.complete]
            result_key = pluralize(self.result_key)
        else:
            rtn = Task.get_by_id(item_id)
            if rtn:
                rtn = rtn.to_json(in_list=False)
            result_key = self.result_key
        return jsonify({result_key:rtn})


class AddTaskView(PostView):
    def post(self):
        self._process_post()
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


            


