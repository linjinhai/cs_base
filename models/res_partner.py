# coding=utf-8
from odoo import models, fields, api


class ResPartner(models.Model):
    _inherit = 'res.partner'

    user_id = fields.Many2one('res.users', default=lambda self: self.env.uid)
