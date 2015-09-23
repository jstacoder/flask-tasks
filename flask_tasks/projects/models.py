from flask import url_for,request
from ..models import BaseMixin,sa

class Project(BaseMixin):
    name = sa.Column(sa.String(255))

    def to_json(self):
        opts = {}
        if not request.endpoint ==\
                'flask_tasks.projects.api.view_tasks_by_project':
            opts['tasks'] = self.tasks_url
        return dict(
            id=self.id,
            name=self.name,
            **opts
        )

    @property
    def url(self):
        return url_for('flask_tasks.projects.api.view_project',item_id=self.id,_external=True)

    @property
    def tasks_url(self):
        return  url_for('flask_tasks.projects.api.view_tasks_by_project',item_id=self.id,_external=True)

