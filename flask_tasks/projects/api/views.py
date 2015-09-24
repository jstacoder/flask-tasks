from flask import views,jsonify,request
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

class AddProjectView(PostView):
    def post(self):
        self._process_post()
        proj = Project(**self.data).save().to_json()
        return jsonify(**proj)


