import os.path as op

class Config(object):
    REGISTER_BLUEPRINTS = False

    URL_MODULES = [
        'flask_tasks.tasks.urls.routes',
        'flask_tasks.projects.urls.routes',
        'flask_tasks.admin.urls.routes',
        'flask_tasks.tasks.api.urls.routes',
        'flask_tasks.projects.api.urls.routes',
    ]

    VERBOSE = True

    ROOT_PATH = op.abspath(op.dirname(__file__))

    INSTALLED_BLUEPRINTS = [
        'flask_tasks.tasks',
        'flask_tasks.projects',
        'flask_tasks.projects.api',
        'flask_tasks.admin',
        'flask_tasks.tasks.api'
    ]

    DATABASE_URI = 'sqlite:///production.db'

class TestConfig(Config):
    DATABASE_URI = 'sqlite:///testing.db'
    REGISTER_BLUEPRINTS = False
