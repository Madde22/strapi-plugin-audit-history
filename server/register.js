'use strict';

module.exports = ({ strapi }) => {
	// Ensure we have at least one model before attempting to attach lifecycles
	if (!Object.keys(strapi.contentTypes).length) {
		strapi.log.warn('No models found. Skipping attaching lifecycles to models.');
		return;
	}

	strapi.log.info('Audit Logger: Attaching lifecycles to models...');

	const entities = Object.keys(strapi.contentTypes).filter((key) => key.includes('api::'));

	if (!entities.length) {
		strapi.log.warn('No models found. Skipping attaching lifecycles to models.');
		return;
	}

	strapi.log.info(`Audit Logger: Found ${entities.length} models.`);

	entities.forEach((entity) => {
		const { lifecycles } = strapi.contentType(entity);
		const ContentTypeName = entity
			.replace('api::', '')
			.split('.')[0]
			.split('-')
			.join(' ')
			.toUpperCase();

		strapi.contentType(entity).lifecycles = {
			...lifecycles,
			afterCreate: async (event) => {
				if (lifecycles.afterCreate) await lifecycles.afterCreate(event);

				strapi.log.warn(`Audit Logger: ${ContentTypeName} created`);
				const { result, params } = event;
				await strapi.entityService.create('plugin::audit-logger.auditlog', {
					data: {
						action: 'Create',
						contentType: `${ContentTypeName}`,
						author: result.createdBy,
						params: params,
						request: event,
						content: result.Content,
					},
				});
			},
			afterUpdate: async (event) => {
				if (lifecycles.afterUpdate) await lifecycles.afterUpdate(event);
				strapi.log.warn(`Audit Logger: ${ContentTypeName} updated`);
				const { result, params } = event;
				await strapi.entityService.create('plugin::audit-logger.auditlog', {
					data: {
						action: 'Update',
						contentType: `${ContentTypeName}`,
						author: result.createdBy,
						params: params,
						request: event,
						content: result.Content,
					},
				});
			},
			afterDelete: async (event) => {
				if (lifecycles.afterDelete) await lifecycles.afterDelete(event);
				strapi.log.warn(`Audit Logger: ${ContentTypeName} deleted`);
				const { result, params } = event;
				await strapi.entityService.create('plugin::audit-logger.auditlog', {
					data: {
						action: 'Delete',
						contentType: `${ContentTypeName}`,
						author: result.createdBy,
						params: params,
						request: event,
						content: result.Content,
					},
				});
			},
		};
	});

	strapi.log.info('Audit Logger: Successfully attached lifecycles to models.');
};
