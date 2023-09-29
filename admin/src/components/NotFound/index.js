import React from 'react';
import { Layout, BaseHeaderLayout, ContentLayout, Box } from '@strapi/design-system';
import { NoContent } from '@strapi/helper-plugin';

const NotFound = () => {
	return (
		<Layout>
			<ContentLayout>
				<BaseHeaderLayout
					title="Audit Logger"
					subtitle="Logging collection changes create/delete/update"
				/>
				<Box padding={4}>
					<NoContent />
				</Box>
			</ContentLayout>
		</Layout>
	);
};

export default NotFound;
