from flask_tasks import get_app,settings,models
from flask_tasks.tasks.models import Task
from flask_tasks.projects.models import Project
from datetime import timedelta,datetime
from random import choice, shuffle

def get_days_due():
    factors = [1,2,3,4,5,6,7,8,9]
    ft = [1,7,30,365]
    return choice(factors) * choice(ft)

def get_due_date():
    td = timedelta(days=get_days_due())
    return datetime.now() + td

def seed(tasks=True,project=True):
    tasks = [Task(name='task{}'.format(i+1),due_date=get_due_date()).save() for i in range(10)] if tasks else []
    project = Project(name='test',tasks=tasks).save() if project else ''
