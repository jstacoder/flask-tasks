from flask_script import Manager,commands
from flask_tasks import get_app,settings
from flask import current_app
from flask_tasks.messages import socket

manager = Manager(get_app(settings.Config,extensions=[socket]))

manager.add_command('urls',commands.ShowUrls())

@manager.command
def show_ext():
    print get_app(settings.Config,extensions=[socket]).extensions.keys()


manager.run()
