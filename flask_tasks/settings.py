import os.path as op

class Config(object):
    REGISTER_BLUEPRINTS = False

    SECRET_KEY = 'xxxxx'

    URL_MODULES = [
        'flask_tasks.tasks.urls.routes',
        'flask_tasks.projects.urls.routes',
        'flask_tasks.admin.urls.routes',
        'flask_tasks.tasks.api.urls.routes',
        'flask_tasks.projects.api.urls.routes',
        'flask_tasks.front.urls.routes',
    ]

    VERBOSE = True

    ROOT_PATH = op.abspath(op.dirname(__file__))

    INSTALLED_BLUEPRINTS = [
        'flask_tasks.tasks',
        'flask_tasks.projects',
        'flask_tasks.projects.api',
        'flask_tasks.admin',
        'flask_tasks.tasks.api',
        'flask_tasks.front',
    ]

    #DATABASE_URI = 'postgresql://tasks:tasks@localhost/tasks'
    #DATABASE_URI = 'mysql+pymysql://t:tasks@localhost/tasks'
    DATABASE_URI = 'sqlite:///production.db'

class TestConfig(Config):
    DATABASE_URI = 'sqlite:///testing.db'
    REGISTER_BLUEPRINTS = False
