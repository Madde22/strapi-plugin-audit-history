'use strict';

module.exports = {
	async find(ctx) {
		try {
			return await strapi.plugin('audit-logger').service('auditlog').find(ctx.query);
		} catch (error) {
			ctx.throw(500, error);
		}
	},
};
