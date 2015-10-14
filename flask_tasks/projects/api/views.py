from flask import views,jsonify,request,make_response
from psycogreen import eventlet as ev
ev.patch_psycopg()
from inflection import pluralize
import json
from ..models import Project
from ...views import PostView,_jsonify

class ListProjectView(views.MethodView):

    def get(self,item_id=None):
        if item_id is None:
            rtn = [p.to_json() for p in Project.get_all() if any(filter(lambda t: (not t.complete), p.tasks))]
            result = _jsonify(rtn)
        else:
            rtn = Project.get_by_id(item_id)
            if rtn:
                rtn = rtn.to_json(add_tasks=True)
            else:
                rtn = {}
            result = jsonify(**rtn)
        return result

class ListTasksByProjectView(views.MethodView):
    def get(self,item_id):
        proj = Project.get_by_id(item_id)
        if proj is not None:
            result = proj.to_json(add_tasks=True)
            tasks = proj.tasks.all()            
            if request.args:
                if int(request.args.get('complete')):
                    result['tasks'] = [t.to_json() for t in tasks if t.complete]
                else:
                    result['tasks'] = [t for t in tasks if not t.complete]
            else:
                result['tasks'] = map(lambda x: x.to_json(),tasks)
        else:
            result = {'error':'no project with id {0} found'.format(item_id)}
        return jsonify(**result)

class AddProjectView(PostView):
    def post(self):
        self._process_post()
        proj = Project(**self.data).save().to_json()
        return jsonify(**proj)

class DeleteProjectView(PostView):
    def post(self):
        self._process_post()
        proj = Project.query.get(self.data['item_id'])
        success = None
        if proj:
            print dir(proj)
            try:
                proj.delete()
                success = True
            except:
                success = False
            if success is not None and success:
                rtn = jsonify(**dict(result='success',action='delete',item=self.data.get('item_id')))
            elif success is not None:
                rtn = jsonify(**dict(result='error',action='error when attempting delete',item=self.data.get('item_id')))
            else:
                rtn = jsonify(**dict(result='error',action='could not find item',item=self.data.get('item_id')))
        return rtn


