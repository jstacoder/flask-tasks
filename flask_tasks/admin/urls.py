from . import admin
from .views import IndexView


routes = [
        (
            (admin),
            ('/','index',IndexView),
        )
]
