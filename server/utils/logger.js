// TODO: Need to be fixed.
// ! This Class cause a error in the console, but it works fine.
// ! Error: TypeError: Cannot read property 'id' of undefined
// ! Not available in production mode.

class Logger {
	constructor(strapi, event) {
		this.strapi = strapi;
		this.event = event;
	}

	async createAuditLog(action, contentTypeName, author, dataBeforeAction, dataAfterAction) {
		try {
			await this.strapi.entityService.create('plugin::audit-logger.auditlog', {
				data: {
					action,
					contentType: `${contentTypeName}`,
					author,
					dataBeforeAction,
					dataAfterAction,
				},
			});
		} catch (error) {
			this.strapi.log.error(`Audit Logger: ${error}`);
		}
	}

	async log(action, contentTypeName) {
		try {
			const ctx = this.strapi.requestContext.get();
			const currentUser = ctx?.state?.user;

			if (!currentUser || !currentUser.id) {
				return;
			}

			const author = {
				id: currentUser.id,
				username: currentUser.username,
				email: currentUser.email,
				firstname: currentUser.firstname,
				lastname: currentUser.lastname,
				createAt: currentUser.createdAt,
			};

			switch (action) {
				case 'Create':
					this.strapi.log.warn(`Audit Logger: ${contentTypeName} created`);
					await this.createAuditLog(action, contentTypeName, author, null, this.event.params.data);

				case 'Update':
					this.strapi.log.warn(`Audit Logger: ${contentTypeName} updated`);

					const updatedRecord = await this.strapi.entityService.findOne(
						this.event.model.uid,
						this.event.params.where.id
					);
					await this.createAuditLog(
						action,
						contentTypeName,
						author,
						updatedRecord,
						this.event.params.data
					);

				case 'Delete':
					this.strapi.log.warn(`Audit Logger: ${contentTypeName} deleted`);

					const deletedRecord = await this.strapi.entityService.findOne(
						this.event.model.uid,
						this.event.params.where.id
					);
					await this.createAuditLog(action, contentTypeName, author, deletedRecord, null);

				default:
					break;
			}
		} catch (error) {
			this.strapi.log.error(`Audit Logger: ${error}`);
		}
	}
}

module.exports = Logger;
