from wtforms import Form,fields
from wtforms.fields import html5
from ..projects.models import last_project_id

class AddProjectForm(Form):
    name = fields.StringField('Project Name',description='The name of the project to add',id='name')


class AddTaskForm(Form):
    name = fields.StringField('Task Name',description='The name of the task to add',id='name')
    due_date = html5.DateTimeField('due_date',description='The date the task will be due')
    priority = fields.SelectField('Priority',description='The tasks priority, the lower the number, the more important it is',choices=((1,'high'),(2,'medium-high'),(3,'medium'),(4,'medium-low'),(5,'low')))
    add_another_task = fields.BooleanField('Add More Tasks',default=True,description='continue adding tasks after finished with this one')
    project_id = fields.HiddenField('project_id',default=last_project_id())
    
