from . import front, handle_app_request

routes = [
        ((front),
            ('/','app_index',handle_app_request),
            ('/<path:static_pth>','app_project',handle_app_request),
        )
]
