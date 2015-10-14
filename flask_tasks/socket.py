from flask_socketio import SocketIO,emit
from flask import json
from gevent import monkey,sleep,spawn
from eventlet import patcher
import pusher
pusher.pusher.json = json

p = pusher.Pusher(
  app_id='147823',
  key='14d2f4c74704d4c4aadd',
  secret='ff0da80aa28bf9620bdd',
  ssl=True,
  port=443,
)

patcher.monkey_patch()


#monkey.patch_all()

socket = SocketIO(async_mode='eventlet')


@socket.on('msg')
def msg(data):
    socket.emit('msg',{'data':'git this data '+str(data)})

def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while count < 10:
        sleep(10)
        count += 1
        socket.emit('msg',
                      {'data': json.dumps(dict(data='Server generated event')), 'count': count},
                      namespace='/test')


    
#thread = spawn(background_thread)
#thread.start()


def emit_message(name,data,ns=''):
    return socket.emit(name,data,namespace=ns)

def send_pusher_msg(channel,event_name,data):
    p.trigger(channel,event_name,data)
