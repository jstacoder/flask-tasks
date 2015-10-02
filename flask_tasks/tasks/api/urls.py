from . import api
from .views import ListTaskView, AddTaskView, CompleteTaskView,DeleteTaskView


routes = [
            (
                (api),
                ('/list','list_tasks',ListTaskView),
                ('/view/<item_id>','view_task',ListTaskView),
                ('/add','add_task',AddTaskView),
                ('/complete','complete_task',CompleteTaskView),
                ('/delete','delete_task',DeleteTaskView),
            )
]
