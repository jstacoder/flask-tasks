from flask import url_for,request,_app_ctx_stack
from ..models import BaseMixin,sa

def last_project_id():
    ctx = _app_ctx_stack.top
    pop = False
    if ctx is None:
        from .. import get_app,settings
        ctx = get_app(settings.Config,add_default_extensions=False).test_request_context()
        ctx.push()
        pop = True
    projects = Project.get_all()
    if len(projects) > 0:
        rtn = projects[-1].id
    else:
        rtn = 0
    if pop:
        ctx.pop()
    return int(rtn)


class Project(BaseMixin):
    name = sa.Column(sa.String(255))

    def to_json(self,add_tasks=False,add_urls=True):
        opts = {}
        if add_urls:
            if add_tasks:
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

