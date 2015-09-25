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
    _success_args = {}


    post_data = None

    def get(self,project_id=None):
        if project_id is not None:
            self._form_args = {'project_id':project_id}
        return super(AdminAddTaskView,self).get()


    def _process_post(self):
        if self.post_data is None:
            super(AdminAddTaskView,self)._process_post()
        return self.post_data

    def post(self,project_id=None):
        self._process_post()
        add_more = self.post_data.pop('add_another_task',None)
        if add_more:
            self._success_endpoint = '.admin_add_task'
            self._success_args = {'project_id':project_id}
        self._context['obj'] = self._model(**self.post_data).save()
        self.success(self._success_message)
        return self.redirect(self._success_endpoint or '.index',**self._success_args)




