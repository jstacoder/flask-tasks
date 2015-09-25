from wtforms import Form,fields
from wtforms.fields import html5
from ..projects.models import last_project_id

class AddProjectForm(Form):
    name = fields.StringField('Project Name',description='The name of the project to add',id='name')


class AddTaskForm(Form):
    name = fields.StringField('Task Name',description='The name of the task to add',id='name')
    due_date = html5.DateTimeField('due_date')
    project_id = fields.HiddenField('project_id',default=last_project_id())
    
