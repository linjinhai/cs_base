# coding=utf-8

from datetime import datetime, timedelta

from odoo import fields, http
from odoo.exceptions import AccessError
from odoo.http import request
from odoo import release

class CsBaseDashboard(http.Controller):

    @http.route('/cs_base_dashboard/data', type='json', auth='user')
    def cs_base_dashboard_data(self, **kw):
        ret = {}
        if request.env.user.agent_ids:
            agent = request.env.user.agent_ids[0]
            ret['agent'] = {
                'no': agent.no,
                'mobile': request.env.user.mobile,
                'groups': ','.join([g.name for g in agent.group_ids]),
                'status': agent.status=='on' and '在线' or '离线',
                'status_class': agent.status=='on' and 'btn-success' or 'btn-warning',
            }
        return ret

    @http.route('/cs_base_dashboard/status_change', type='json', auth='user')
    def agent_status_change(self, **kw):
        ret = {}
        if request.env.user.agent_ids:
            agent = request.env.user.agent_ids[0]
            if agent.status=='on':
                agent.write({'status': 'off'})
                ret['res_status'] = 'off'
            else:
                agent.write({'status': 'on'})
                ret['res_status'] = 'on'
            request.env.cr.commit()
        return ret
