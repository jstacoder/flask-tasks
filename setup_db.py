
def refresh_db(app,models,seed_func):
    with app.test_request_context():
        models.BaseMixin.metadata.bind = models.BaseMixin.engine
        models.BaseMixin.engine.echo = True
        models.BaseMixin.metadata.drop_all()
        models.BaseMixin.metadata.create_all()
        seed_func()




