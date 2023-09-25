module.exports = [
	{
		method: 'GET',
		path: '/find',
		handler: 'auditlog.find',
		config: {
			policies: [],
			auth: false,
		},
	},
];
