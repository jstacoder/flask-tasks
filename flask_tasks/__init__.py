from flask_router import FlaskRouter
from flask_template_loader import FlaskTemplateLoader
from flask_apps import FlaskApps
from flask import Flask

class NoSettingsObjectError(Exception):
    pass

def get_app(settings=None,extensions=[],*args,**kwargs):
    app = Flask(__name__,*args,**kwargs)
    if settings is not None:
        app.config.from_object(settings)
    else:
        raise NoSettingsObjectError
    if extensions:
        for e in extensions:
            e.init_app(app)
    apps = FlaskApps(app)
    router = FlaskRouter(app)
    loader = FlaskTemplateLoader(app)

    return app


