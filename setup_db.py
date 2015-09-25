
def refresh_db(app,models,seed):
    ctx = app.test_request_context()
    ctx.push()
    
    models.BaseMixin.metadata.bind = models.BaseMixin.engine
    models.BaseMixin.engine.echo = True      
    models.BaseMixin.metadata.drop_all()
    models.BaseMixin.metadata.create_all()
    seed()

    ctx.pop()
    



