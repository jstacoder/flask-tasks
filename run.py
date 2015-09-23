from flask_tasks import get_app,settings,models
from seed import seed
import os



if __name__ == "__main__":
    app = get_app(settings.Config)
    if os.environ.get('REFRESH_DB'):
        with app.test_request_context():
            models.BaseMixin.metadata.bind = models.BaseMixin.engine
            models.BaseMixin.engine.echo = True
            models.BaseMixin.metadata.drop_all()
            models.BaseMixin.metadata.create_all()
            seed()
    app.run(host='0.0.0.0',port=5544,debug=True)
