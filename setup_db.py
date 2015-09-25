


def refresh_db(app=None,models=None,seed=None):
    if app is None:
        from flask_tasks import get_app,settings
        app = get_app(settings.TestConfig,refresh_db=True)
    if models is None:
        from flask_tasks import models
    if seed is None:
        from seed import seed

    ctx = app.test_request_context()
    ctx.push()
    
    models.BaseMixin.metadata.bind = models.BaseMixin.engine
    models.BaseMixin.engine.echo = True      
    models.BaseMixin.metadata.drop_all()
    models.BaseMixin.metadata.create_all()
    seed()

    ctx.pop()
    


if __name__ == "__main__":
    refresh_db()
