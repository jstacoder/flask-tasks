from flask_tasks import get_app,settings,models
from seed import seed
from setup_db import refresh_db
import os



if __name__ == "__main__":
    app = get_app(settings.Config)
    if os.environ.get('REFRESH_DB'):
        #models.BaseMixin.engine.echo = True
        refresh_db(app,models,seed)
    app.debug = True
    port = int(os.environ.get('PORT',5544))
    app.run(host='0.0.0.0',port=port,debug=True)


