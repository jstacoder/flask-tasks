import os
import eventlet
from eventlet import wsgi
eventlet.monkey_patch()
from psycogreen import eventlet as ev
ev.patch_psycopg()
from flask_tasks import get_app,settings,models
from flask_tasks.socket import socket
import socketio
from seed import seed
from setup_db import refresh_db



def main():
    app = get_app(settings.Config)
    if os.environ.get('REFRESH_DB'):
        #models.BaseMixin.engine.echo = True
        refresh_db(app,models,seed)
    app.debug = True
    socket.init_app(app)
    sio = socketio.Server()
    app.wsgi_app = socketio.Middleware(sio, app.wsgi_app)
    return app

if __name__ == "__main__":  
    app = main()

    port = int(os.environ.get('PORT',5544))
    #wsgi.server(eventlet.listen(('127.0.0.1', port)), app)
    
    #socket.run(app,host='0.0.0.0',port=port)
    server = wsgi.WSGIServer(('0.0.0.0',port),app)
    server.serve_forever()


