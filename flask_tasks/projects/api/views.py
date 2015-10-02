from flask import views,jsonify,request,make_response
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


