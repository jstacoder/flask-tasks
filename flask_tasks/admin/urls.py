from . import admin
from .views import IndexView, AdminAddProjectView,AdminAddTaskView


routes = [
        (
            (admin),
            ('/','index',IndexView),
            ('/add-project','admin_add_project',AdminAddProjectView),
            ('/add-task','admin_add_task',AdminAddTaskView),
            ('/add-task/<int:project_id>','admin_add_task_by_id',AdminAddTaskView),
        )
]
