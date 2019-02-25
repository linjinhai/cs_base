odoo.define('cs_base.BaseDashboard', function (require) {
"use strict";

var core = require('web.core');
var framework = require('web.framework');
var PlannerCommon = require('web.planner.common');
var PlannerDialog = PlannerCommon.PlannerDialog;
var Widget = require('web.Widget'); 
var session = require('web.session');

var QWeb = core.qweb;          
var _t = core._t;

var Dashboard = Widget.extend({
	template: 'CsBaseDashboard',

    events: {
        'click .refresh-act': 'on_refresh',
    },

    on_refresh: function(){
        this.load(this.all_dashboards);
        //odoo.__DEBUG__.services['web.web_client'].action_manager.get_inner_action().widget.start();
        //var ctrl = odoo.__DEBUG__.services['web.web_client'].action_manager.get_inner_action().widget.active_view.controller;
        //ctrl.do_show();
        //var ctrl = odoo.__DEBUG__.services['web.web_client'];
        //ctrl.do_show();
    },

    init: function(parent, data){
        this.all_dashboards = ['agent'];
        return this._super.apply(this, arguments);
    },

    start: function(){
        return this.load(this.all_dashboards);
    },

    load: function(dashboards){
        var self = this;
        var loading_done = new $.Deferred();
        session.rpc("/cs_base_dashboard/data", {}).then(function (data) {
            // Load each dashboard
            var all_dashboards_defs = [];
            _.each(dashboards, function(dashboard) {
                var dashboard_def = self['load_' + dashboard](data);
                if (dashboard_def) {
                    all_dashboards_defs.push(dashboard_def);
                }
            });

            // Resolve loading_done when all dashboards defs are resolved
            $.when.apply($, all_dashboards_defs).then(function() {
                loading_done.resolve();
            });
        });
        return loading_done;
    },

    load_agent: function(data){
        if(!data.agent){
            return
        }
        return  new DashboardAgent(this, data.agent).replace(this.$('.o_cs_base_dashboard_agent'));
    },

});

var DashboardAgent = Widget.extend({
    template: 'DashboardAgent',
    events: {
        'click .status-change-act': 'on_status_change',
    },

    init: function(parent, data){
        this.data = data;
        this.parent = parent;
        return this._super.apply(this, arguments);
    },

    on_status_change: function(e){
        var self = this;
        var $a = $(e.currentTarget);
        session.rpc("/cs_base_dashboard/status_change", {}).then(function (data) {
            if(data.res_status){
                setTimeout(self.parent.on_refresh, 500);
            }
        });
    },
});

core.action_registry.add('cs_base_dashboard', Dashboard);

return {
    Dashboard:Dashboard,
    DashboardAgent:DashboardAgent,
};

});
