from flask_socketio import SocketIO

socket = SocketIO()

@socket.on('test')
def on_test(msg):
    print 'got message'
