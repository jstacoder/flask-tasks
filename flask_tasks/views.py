from flask import views,request,make_response,json


def _jsonify(data):
    data = json.dumps(data)
    response = make_response(data)
    response.headers['Content-Type'] = 'application/json'
    response.headers['Content-Length'] = len(data)
    return response

class PostView(views.MethodView):
    def _process_post(self):
        self.data = ((request.data and json.loads(request.data)) if not request.form else dict(request.form.items())) if not request.mimetype == 'application/json' else request.json
