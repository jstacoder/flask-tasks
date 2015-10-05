# author: oskar.blom@gmail.com
#
# Make sure your gevent version is >= 1.0
import gevent
from gevent.wsgi import WSGIServer
from gevent.queue import Queue
from grequests import post
from flask import Blueprint, Response,request,json

import time

def send_event(data):
    #if not type(data) == str:
    #    data = str(json.dumps(data))
    return post('http://174.140.227.137:5544/events/publish',data=data).send()

def _process_post():
        return ((request.data and json.loads(request.data)) if not request.form else dict(request.form.items())) if not request.mimetype == 'application/json' else request.json

# SSE "protocol" is described here: http://mzl.la/UPFyxY
class ServerSentEvent(object):

    def __init__(self, data):
        self.data = data
        self.event = None
        self.id = None
        self.desc_map = {
            self.data : "data",
            self.event : "event",
            self.id : "id"
        }

    def encode(self):
        if not self.data:
            return ""
        lines = ["%s: %s" % (repr(v), repr(k)) 
                 for k, v in self.desc_map.iteritems() if k]
        
        return json.dumps(self.data)
        return "%s\n\n" % "\n".join(lines)

events = Blueprint('events',__name__,url_prefix='/events')
events.subscriptions = []
events.backlog = []

# Client code consumes like this.
@events.route("/")
def index():
    debug_template = """
     <html>
       <head>
       </head>
       <body>
         <h1>Server sent events</h1>
         <div id="event"></div>
         <script type="text/javascript">

         var eventOutputContainer = document.getElementById("event");
         var evtSrc = new EventSource("/events/subscribe");

         evtSrc.onmessage = function(e) {
             console.log(e.data);
             eventOutputContainer.innerHTML = e.data + '<br>' + eventOutputContainer.innerHTML;
         };

         </script>
       </body>
     </html>
    """
    return(debug_template)

@events.route("/debug")
def debug():
    return "Currently %d subscriptions" % len(events.subscriptions)

@events.route("/publish",methods=['GET','POST'])
def publish():
    #Dummy data - pick up from request for real data
    from . import main
    app = main()
    with app.test_request_context():
        print request.method
        if request.method.lower() == 'post':
            msg = _process_post()
        else:
            msg = str(time.time())
    msg = _process_post()
    events.backlog.append(msg)

    def notify(msg):
        for sub in events.subscriptions[:]:
            sub.put(msg)
    
    gevent.spawn(notify,msg)
    
    return "Sent "+str(msg)

@events.route("/subscribe")
def subscribe():
    def gen():
        q = Queue()
        events.subscriptions.append(q)
        for m in events.backlog:
            q.put(m)
        try:
            while True:
                result = q.get()
                ev = ServerSentEvent(repr(result))
                yield ev.encode()
        except GeneratorExit: # Or maybe use flask signals
            events.subscriptions.remove(q)

    return Response(gen(), mimetype="text/event-stream")

if __name__ == "__main__":
    app.debug = True
    server = WSGIServer(("0.0.0.0", 5544), app)
    server.serve_forever()
    # Then visit http://localhost:5000 to subscribe 
    # and send messages by visiting http://localhost:5000/publish
