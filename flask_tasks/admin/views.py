from flask import views,render_template
from flask_xxl.baseviews import AddModelView
from ..tasks.models import Task
from ..projects.models import Project
from .forms import AddProjectForm,AddTaskForm


class IndexView(views.MethodView):
    def get(self):
        pcount = Project.query.count()
        tcount = Task.query.count()
        projects = [p for p in Project.get_all() if p.tasks.count()]
        return render_template('index.html',project_count=pcount,tasks=tcount,projects=projects)


class AdminAddProjectView(AddModelView):
    _model = Project
    _template = 'add_project.html'
    _form = AddProjectForm    
    _success_endpoint = '.admin_add_task'
    _success_message = 'You successfullt added a new project, now add at least one task'



class AdminAddTaskView(AddModelView):
    _model = Task
    _template = 'add_task.html'
    _form = AddTaskForm
    _success_message = 'You added a new task'



