from flask import Blueprint, render_template

front = Blueprint('front',__name__,url_prefix='/app')

def handle_app_request(static_pth=None):
    return render_template('app.html')



