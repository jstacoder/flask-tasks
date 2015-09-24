from flask_script import Manager,commands
from flask_tasks import get_app,settings
from flask import current_app
from flask_tasks.messages import socket

create_app = lambda: get_app(settings.Config,extensions=[socket])
manager = Manager(app=create_app)


manager.add_command('urls',commands.ShowUrls())

@manager.command
def show_ext():
    print get_app(settings.Config,extensions=[socket]).extensions.keys()


@manager.command
def show_methods():
    app = get_app(settings.Config,extensions=[socket])
    seen = []
    for route in app.url_map.iter_rules():
        if not route in seen:
            print route.rule,route.methods
            seen.append(route)

@manager.command
def blueprints():
    print get_app(settings.Config,extensions=[socket]).blueprints.keys()

if __name__ == "__main__":
    manager.run()

