from flask_xxl.basemodels import BaseMixin
import sqlalchemy as sa


def add_model(model,*args,**kwargs):
    return model(*args,**kwargs).save()

def get_one_model(model,item_id):
    return model.get_by_id(item_id)

def get_all_model(model):
    return model.get_all()


