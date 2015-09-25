from . import admin
from .views import IndexView, AdminAddProjectView,AdminAddTaskView


routes = [
        (
            (admin),
            ('/','index',IndexView),
            ('/add-project','admin_add_project',AdminAddProjectView),
            ('/add-task','admin_add_task',AdminAddTaskView),
        )
]
