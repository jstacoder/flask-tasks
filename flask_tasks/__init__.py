from flask_router import FlaskRouter
from flask_template_loader import FlaskTemplateLoader
from flask_apps import FlaskApps
from flask import Flask,request
from flask_xxl.filters import date_pretty
from commands import getoutput
from . import models
import json
import os.path as op
from psycogreen import eventlet as ev
ev.patch_psycopg()

parent = op.realpath(op.dirname(__file__))

get_assets = lambda: json.loads(getoutput('cd {0} && bower list -r -j -p --allow-root'.format(parent)))

def assets(asset_types=None):
    default_asset_types = ['css','js','less']
    asset_types = asset_types if asset_types is not None else default_asset_types
    _js = '<script src="/{0}"></script>'
    _css = '<link rel=stylesheet href="/{0}" />'
    fix_asset = lambda name: dict(js=_js,css=_css)[op.splitext(name)[-1][1:]].format(name)
    assets = get_assets()
    return '\n'.join(map(str,reversed([fix_asset(assets[a]) for a in assets if filter(lambda x: map(lambda y: y.endswith(x),assets[a]),asset_types)])))

class NoSettingsObjectError(Exception):
    pass

def get_app(settings=None,extensions=None,add_default_extensions=True,*args,**kwargs):
    reset_db = None
    if 'reset_db' in kwargs:
        reset_db = kwargs.pop('reset_db')
    app = Flask(__name__,*args,**kwargs)
    if settings is not None:
        app.config.from_object(settings)
    else:
        raise NoSettingsObjectError
    if extensions:
        for e in extensions:
            e.init_app(app)
    if reset_db is not None:
        with app.test_request_context():
            models.BaseMixin.metadata.bind = models.BaseMixin.engine
            models.BaseMixin.engine.echo = True 
            models.BaseMixin.metadata.drop_all(checkfirst=True)
            models.BaseMixin.metadata.create_all(checkfirst=True)
    if add_default_extensions:
        router = FlaskRouter(app)
        apps = FlaskApps(app)
        #loader = FlaskTemplateLoader(app)

    app.jinja_env.globals['assets'] = assets
    app.jinja_env.filters['date_pretty'] = date_pretty

    #@app.after_request
    #def af(res):
    #    print request.environ['eventlet.input']
    #    return res

    return app

def main():
    app = get_app(settings.Config)
    app.debug = True
    return app

if __name__ == "__main__":  
    app = main()
    port = int(os.environ.get('PORT',5544))
    server = WSGIServer(('0.0.0.0',port),app)
    server.serve_forever()


