from flask import views,render_template
from ..tasks.models import Task
from ..projects.models import Project


class IndexView(views.MethodView):
    def get(self):
        pcount = Project.query.count()
        tcount = Task.query.count()
        projects = [p for p in Project.get_all() if p.tasks.count()]
        return render_template('index.html',project_count=pcount,tasks=tcount,projects=projects)
