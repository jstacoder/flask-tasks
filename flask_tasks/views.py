from flask import views,request
import json

class PostView(views.MethodView):
    def _process_post(self):
        self.data = ((request.data and json.loads(request.data)) if not request.form else dict(request.form.items())) if not request.mimetype == 'application/json' else request.json
