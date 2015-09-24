from flask_xxl.basemodels import classproperty
from ..models import sa,BaseMixin
from flask import url_for

class Task(BaseMixin):
    __table_args__ = (
        (sa.UniqueConstraint('name','project_id'),)
    )
    name = sa.Column(sa.String(255))
    priority = sa.Column(sa.Enum('1','2','3','4','5',name='priority'),default='5')
    project_id = sa.Column(sa.Integer,sa.ForeignKey('projects.id'))
    project = sa.orm.relation('Project',uselist=False,backref=sa.orm.backref('tasks',lazy='dynamic'))
    due_date = sa.Column(sa.DateTime)
    complete = sa.Column(sa.Boolean,default=False)

    @classproperty
    def list_url(cls):
        return url_for('tasks_api.list_tasks',_external=True) 

    @classmethod
    def _get_project_list_url(cls,project_id):
        return url_for('projects_api.view_tasks_by_project',item_id=project_id)

    def get_project_list_url(self):
        return self.__class__._get_project_list_url(self.project_id)

    
    @property
    def url(self):
        return url_for('tasks_api.view_task',item_id=self.id,_external=True)

    def to_json(self,in_list=True,add_urls=True):
        opts = {}
        if self.due_date:
            opts['due_date'] = self.due_date
        if self.project_id:
            opts['project'] = dict(
                    id=self.project_id,
            )
            if add_urls:
                opts['project']['url'] = self.project.url
        
        if in_list and add_urls:
            opts['url'] = self.url
        return dict(
            id=self.id,
            name=self.name,
            priority=self.priority,
            complete=self.complete,
            **opts
        )



