from flask_socketio import SocketIO,emit
from flask import json
from gevent import monkey,sleep,spawn


monkey.patch_all()

socket = SocketIO(async_mode='gevent')


@socket.on('msg')
def msg(data):
    emit('msg',{'data':'git this data '+str(data)})

def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while count < 10:
        sleep(10)
        count += 1
        socket.emit('msg',
                      {'data': json.dumps(dict(data='Server generated event')), 'count': count},
                      namespace='/test')


    
thread = spawn(background_thread)
thread.start()
