import React, { useEffect, useState } from 'react';
import pluginId from '../../pluginId';
import {
	ModalLayout,
	ModalBody,
	ModalHeader,
	Dialog,
	DialogBody,
	DialogFooter,
	Layout,
	BaseHeaderLayout,
	ContentLayout,
	Box,
	Table,
	Thead,
	Tr,
	Th,
	Td,
	Typography,
	Tbody,
	Flex,
	Icon,
	VisuallyHidden,
	Button,
	IconButton,
	JSONInput,
	DatePicker,
	EmptyStateLayout,
} from '@strapi/design-system';
import { LoadingIndicatorPage } from '@strapi/helper-plugin';
import auditlogRequest from '../../api/auditlog';
import { ArrowLeft, ArrowRight, Search, ExclamationMarkCircle, Trash } from '@strapi/icons';

// import date formatter
import { format, addDays } from 'date-fns';

const HomePage = () => {
	const [filteringBy, setFilteringBy] = useState('all');
	const [error, setError] = useState({});
	const [isVisible, setIsVisible] = useState(false);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [auditLogs, setAuditLogs] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [offset, setOffset] = useState(0);
	const [limit, setLimit] = useState(8);
	const [activePage, setActivePage] = useState(1);
	const [currentAuditLog, setCurrentAuditLog] = useState(null);
	const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

	const fetchData = async () => {
		setIsLoading(true);
		const auditLogs = await auditlogRequest.getAllAuditLogs({
			limit: limit,
			start: offset,
		});
		setAuditLogs(auditLogs);
		setIsLoading(false);
	};

	const fetchDataByDate = async () => {
		setIsLoading(true);
		const auditLogs = await auditlogRequest.getAllAuditLogs({
			limit: limit,
			start: offset,
			created_at_gte: startDate ? format(startDate, 'yyyy-MM-dd') : '',
			created_at_lte: endDate ? format(endDate, 'yyyy-MM-dd') : '',
		});
		setAuditLogs(auditLogs);
		setIsLoading(false);
	};

	const handleNextPage = () => {
		setActivePage(activePage + 1);
		setOffset(offset + limit);
	};

	const handlePreviousPage = () => {
		setActivePage(activePage - 1);
		setOffset(offset - limit);
	};

	const handleInspect = (auditLog) => {
		setCurrentAuditLog(auditLog);
		setIsInspectModalOpen(true);
	};

	const handleReset = () => {
		setFilteringBy('all');
		setStartDate(null);
		setEndDate(null);
		setOffset(0);
		setActivePage(1);
		fetchData();
	};

	const handleFilterByDate = async () => {
		setFilteringBy('date');
		setOffset(0);
		setActivePage(1);

		const today = new Date();

		if (startDate && endDate) {
			if (startDate > endDate) {
				setError({
					message: 'Start date cannot be greater than end date',
				});
				setIsVisible(true);
			} else if (endDate > addDays(today, 1)) {
				setError({
					message: 'End date cannot be greater than today',
				});
				setIsVisible(true);
			} else {
				await fetchDataByDate();
			}
		} else {
			setError({
				message: 'Please select both start and end date',
			});
			setIsVisible(true);
		}
	};

	useEffect(() => {
		if (filteringBy === 'all') {
			fetchData();
		} else if (filteringBy === 'date') {
			fetchDataByDate();
		}
	}, [activePage]);

	if (isLoading) return <LoadingIndicatorPage />;

	return (
		<Layout>
			<BaseHeaderLayout
				title="Audit Logger"
				subtitle="Logging collection changes create/delete/update"
			/>
			<ContentLayout>
				<Box padding={4}>
					<Box marginBottom={4}>
						<Flex justifyContent="space-between" alignItems="end" gap={4}>
							<Flex gap={4} alignItems="end">
								<DatePicker
									onChange={setStartDate}
									size="S"
									value={startDate ? `${format(startDate, 'yyyy-MM-dd')}` : null}
									label="Start Date"
									minDate={new Date('2023-01-01')}
									maxDate={new Date()}
									onClear={() => setStartDate(null)}
								/>
								<DatePicker
									onChange={setEndDate}
									size="S"
									value={endDate ? `${format(endDate, 'yyyy-MM-dd')}` : null}
									label="End Date"
									minDate={new Date('2023-01-01')}
									maxDate={new Date()}
									onClear={() => setEndDate(null)}
								/>
								<Button size="M" onClick={handleFilterByDate} variant="success">
									<Typography variant="epsilon">Filter</Typography>
								</Button>
							</Flex>

							<Button size="M" onClick={handleReset} variant="danger">
								<Typography variant="epsilon">Reset</Typography>
							</Button>
						</Flex>
					</Box>
					<Table colCount={3} rowCount={limit}>
						<Thead>
							<Tr>
								<Th>
									<Typography variant="sigma">ID</Typography>
								</Th>
								<Th>
									<Typography variant="sigma">Content Type</Typography>
								</Th>
								<Th>
									<Typography variant="sigma">Action</Typography>
								</Th>
								<Th>
									<Typography variant="sigma">Action Made At</Typography>
								</Th>
								<Th>
									<Typography variant="sigma">Action By</Typography>
								</Th>
								<Th>
									<VisuallyHidden>Actions</VisuallyHidden>
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{auditLogs.data && auditLogs.data.length === 0 && (
								<Box padding={8}>
									<Typography variant="beta" textAlign="center">
										No entries found
									</Typography>
								</Box>
							)}
							{auditLogs.data &&
								auditLogs.data.map((auditLog) => (
									<Tr key={auditLog.id}>
										<Td>
											<Typography textColor="neutral800">{auditLog.id}</Typography>
										</Td>
										<Td>
											<Typography textColor="neutral800">{auditLog.contentType}</Typography>
										</Td>
										<Td>
											<Typography textColor="neutral800">{auditLog.action}</Typography>
										</Td>
										<Td>
											<Typography textColor="neutral800">
												<Flex gap="2">
													<Box>
														<Typography textColor="neutral800">
															{new Date(auditLog.createdAt).toLocaleString()}
														</Typography>
													</Box>
												</Flex>
											</Typography>
										</Td>
										<Td>
											<Typography textColor="neutral800">
												{auditLog.author.firstname || auditLog.author.email}
											</Typography>
										</Td>
										<Td>
											<IconButton
												onClick={() => handleInspect(auditLog)}
												noBorder
												label="Inspect Audit Log"
												icon={<Icon width={24} height={24} as={Search} />}
											/>
										</Td>
									</Tr>
								))}
						</Tbody>
					</Table>
					<Box marginTop={2}>
						{auditLogs.data.length > 0 ? (
							<Flex justifyContent="space-between">
								<Flex gap="5">
									<Box>
										<Button disabled={activePage === 1} onClick={handlePreviousPage}>
											<Icon width={16} height={16} as={ArrowLeft} />
										</Button>
									</Box>
									<Flex gap={2}>
										<Box>
											<Typography variant="epsilon">{activePage}</Typography>
										</Box>
										<Box>
											<Typography variant="epsilon">/</Typography>
										</Box>
										<Box>
											<Typography variant="epsilon">
												{Math.ceil(auditLogs.total / limit)}
											</Typography>
										</Box>
									</Flex>
									<Box>
										<Button
											disabled={activePage === Math.ceil(auditLogs.total / limit)}
											onClick={handleNextPage}
										>
											<Icon width={16} height={16} as={ArrowRight} />
										</Button>
									</Box>
								</Flex>
								<Box marginRight={2}>
									<Typography variant="epsilon">{auditLogs.total} entries found</Typography>
								</Box>
							</Flex>
						) : null}
					</Box>
				</Box>
			</ContentLayout>
			<>
				<Dialog onClose={() => setIsVisible(false)} title="Error" isOpen={isVisible}>
					<DialogBody icon={<ExclamationMarkCircle />}>
						<Flex direction="column" alignItems="center" gap={2}>
							<Flex justifyContent="center">
								<Typography id="confirm-description" variant="beta">
									{error.message}
								</Typography>
							</Flex>
						</Flex>
					</DialogBody>
					<DialogFooter
						endAction={
							<Button
								variant="danger-light"
								startIcon={<Trash />}
								onClick={() => setIsVisible(false)}
							>
								OK
							</Button>
						}
					/>
				</Dialog>
			</>
			;
			{isInspectModalOpen && (
				<ModalLayout
					onClose={() => {
						setIsInspectModalOpen(false);
						setCurrentAuditLog(null);
					}}
					labelledBy="title"
				>
					<ModalHeader>
						<Typography fontWeight="bold" textColor="neutral800" as="h2" id="title">
							Inspecting {currentAuditLog.contentType} Audit Log
						</Typography>
					</ModalHeader>
					<ModalBody>
						<Typography variant="beta">Author</Typography>
						<JSONInput disabled value={JSON.stringify(currentAuditLog.author, null, 2)} />
						<Typography variant="beta">Data Before Action</Typography>
						<JSONInput disabled value={JSON.stringify(currentAuditLog.dataBeforeAction, null, 2)} />
						<Typography variant="beta">Data After Action</Typography>
						<JSONInput disabled value={JSON.stringify(currentAuditLog.dataAfterAction, null, 2)} />
					</ModalBody>
				</ModalLayout>
			)}
		</Layout>
	);
};

export default HomePage;
