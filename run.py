from flask_tasks import get_app,settings,models
from flask_tasks.socket import socket
from seed import seed
from setup_db import refresh_db
import gevent
gevent.monkey.patch_all()
from gevent.wsgi import WSGIServer
from gevent.queue import Queue
import os

def main():
    app = get_app(settings.Config)
    if os.environ.get('REFRESH_DB'):
        #models.BaseMixin.engine.echo = True
        refresh_db(app,models,seed)
    app.debug = True
    socket.init_app(app)
    return app

if __name__ == "__main__":  
    app = main()
    port = int(os.environ.get('PORT',5544))
    
    socket.run(app,host='0.0.0.0',port=port)
    #server = WSGIServer(('0.0.0.0',port),app)
    #server.serve_forever()


