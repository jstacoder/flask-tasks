from . import api
from .views import ListProjectView,ListTasksByProjectView,AddProjectView


routes = [
            (
            (api),
                ('/list','list_projects',ListProjectView),
                ('/view/<item_id>','view_project',ListProjectView),
                ('/view/<item_id>/tasks','view_tasks_by_project',ListTasksByProjectView),
                ('/add','add_project',AddProjectView),
            )
]
