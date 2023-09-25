'use strict';

module.exports = ({ strapi }) => ({
	async find(query) {
		if (query.created_at_gte && query.created_at_lte) {
			const total = await strapi.entityService.count('plugin::audit-logger.auditlog', {
				filters: {
					createdAt: {
						$gte: query.created_at_gte,
						$lte: query.created_at_lte,
					},
				},
			});
			const data = await strapi.entityService.findMany('plugin::audit-logger.auditlog', {
				sort: { createdAt: 'desc' },
				start: query.start,
				limit: query.limit,
				filters: {
					$and: [
						{ createdAt: { $gte: query.created_at_gte } },
						{ createdAt: { $lte: query.created_at_lte } },
					],
				},
			});

			return { data, total };
		} else {
			const total = await strapi.entityService.count('plugin::audit-logger.auditlog');
			const data = await strapi.entityService.findMany('plugin::audit-logger.auditlog', {
				sort: { createdAt: 'desc' },
				start: query.start,
				limit: query.limit,
			});
			return { data, total };
		}
	},
});
