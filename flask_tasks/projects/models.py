from flask import url_for,request,_app_ctx_stack
from ..models import BaseMixin,sa

class Project(BaseMixin):
    name = sa.Column(sa.String(255))

    def to_json(self,add_urls=True):
        opts = {}
        if add_urls:
            if not request.endpoint ==\
                    'projects_api.view_tasks_by_project':
                opts['tasks'] = self.tasks_url
        return dict(
            id=self.id,
            name=self.name,
            **opts
        )

    @property
    def url(self):
        return url_for('projects_api.view_project',item_id=self.id,_external=True)

    @property
    def tasks_url(self):
        return  url_for('projects_api.view_tasks_by_project',item_id=self.id,_external=True)

