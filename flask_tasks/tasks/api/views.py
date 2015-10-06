from flask import views,jsonify,request
from inflection import pluralize
from flask import json
from gevent import spawn
from ..models import Task
from ...views import PostView,_jsonify
from ...socket import socket,emit_message


class ListTaskView(views.MethodView):
    def get(self,item_id=None):
        data = dict(msg='testing')
        res = send_event(data)
        print res.content
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

class UpdateTaskView(PostView):
    def post(self):
        default_result = jsonify(success=False,error='there was an error')
        updated = False
        result = None
        self._process_post()
        task = Task.get_by_id(self.data.get('id'))
        if task is not None:
            for itm in self.data:
                print itm
                print type(self.data.get(itm))
                if not itm.startswith('_') and type(self.data.get(itm)) != dict:
                    if hasattr(task,itm) and self.data.get(itm) != getattr(task,itm):
                        setattr(task,itm,self.data.get(itm))
                        if not updated:
                            updated = True
                            result = jsonify(success=True,error=None)
            emit_message('update:task',task.save().to_json())
        else:
            result = jsonify(success=False,error='task not found')
        return result or default_result




class AddTaskView(PostView):
    def post(self):
        self._process_post()
        if type(self.data) == str:
            print self.data
            
            self.data = json.loads(self.data)
        data = Task(**self.data).save().to_json()
        t = spawn(lambda: emit_message('create:task',data))
        t.start()
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
                #send_event(dict(event='complete',type='task',data=task.to_json()))
                t = spawn(lambda: emit_message('complete:task',task.to_json()))
                t.start()
            else:
                result = dict(success=False,error='task already complete')
        else:
            result = dict(success=False,error='task with id {} not found'.format(self.data.get('task_id')))
        return jsonify(result)


        
class DeleteTaskView(PostView):
    def post(self):
        self._process_post()
        success = None
        try:
            task = Task.query.get(self.data.get('item_id'))
            if task is not None:
                task.delete()
                success = True
        except:
            success = False
        if success is not None and success:
            rtn = dict(result='success',action='deleted a task',item=self.data.get('item_id'))
        elif success is not None:
            rtn = dict(result='error',action='somthing went wrong when i tried deleting a task',item=None)
        else:
            rtn = dict(result='error',action='could not load task',item=None)
        #send_event(rtn)
        t = spawn(lambda: emit_message('delete:task', rtn,'/test'))
        t.start()
        return jsonify(**rtn)



