'use strict';

// const Logger = require('./utils/logger');

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
			beforeCreate: async (event) => {
				try {
					if (lifecycles.beforeCreate) await lifecycles.beforeCreate(event);

					const ctx = strapi.requestContext.get();
					const currentUser = ctx?.state?.user;

					const author = {
						id: currentUser.id,
						username: currentUser.username,
						email: currentUser.email,
						firstname: currentUser.firstname,
						lastname: currentUser.lastname,
						createAt: currentUser.createdAt,
					};

					strapi.log.warn(`Audit Logger: ${ContentTypeName} created`);

					if (currentUser) {
						await strapi.entityService.create('plugin::audit-logger.auditlog', {
							data: {
								action: 'Create',
								contentType: `${ContentTypeName}`,
								author,
								dataAfterAction: event.params.data,
							},
						});
					}
				} catch (error) {
					strapi.log.error(`Audit Logger: ${error.message}`);
				}
			},
			beforeUpdate: async (event) => {
				try {
					if (lifecycles.beforeUpdate) await lifecycles.beforeUpdate(event);

					const ctx = strapi.requestContext.get();
					const currentUser = ctx?.state?.user;

					const author = {
						id: currentUser.id,
						username: currentUser.username,
						email: currentUser.email,
						firstname: currentUser.firstname,
						lastname: currentUser.lastname,
						createAt: currentUser.createdAt,
					};

					strapi.log.warn(`Audit Logger: ${ContentTypeName} updated`);

					if (currentUser) {
						const updatedRecord = await strapi.entityService.findOne(
							event.model.uid,
							event.params.where.id
						);
						await strapi.entityService.create('plugin::audit-logger.auditlog', {
							data: {
								action: 'Update',
								contentType: `${ContentTypeName}`,
								author,
								dataBeforeAction: updatedRecord,
								dataAfterAction: event.params.data,
							},
						});
					}
				} catch (error) {
					strapi.log.error(`Audit Logger: ${error.message}`);
				}
			},
			beforeDelete: async (event) => {
				try {
					if (lifecycles.beforeDelete) await lifecycles.beforeDelete(event);

					const ctx = strapi.requestContext.get();
					const currentUser = ctx?.state?.user;

					const author = {
						id: currentUser.id,
						username: currentUser.username,
						email: currentUser.email,
						firstname: currentUser.firstname,
						lastname: currentUser.lastname,
						createAt: currentUser.createdAt,
					};

					strapi.log.warn(`Audit Logger: ${ContentTypeName} deleted`);
					if (currentUser) {
						const deletedRecord = await strapi.entityService.findOne(
							event.model.uid,
							event.params.where.id
						);

						await strapi.entityService.create('plugin::audit-logger.auditlog', {
							data: {
								action: 'Delete',
								contentType: `${ContentTypeName}`,
								author,
								dataBeforeAction: deletedRecord,
							},
						});
					}
				} catch (error) {
					strapi.log.error(`Audit Logger: ${error.message}`);
				}
			},
		};
	});

	strapi.log.info('Audit Logger: Successfully attached lifecycles to models.');
};
