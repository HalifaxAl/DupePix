import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DuplicateSet from './components/DuplicateSet';
import ImageGallery from './components/ImageGallery';
import './index.css';

// Define types for our data structures
interface Duplicate {
	id: string;
	url: string; // In a real app, this might be a path or an ID to fetch the image
}

interface DuplicateSetData {
	id: string;
	duplicates: Duplicate[];
}

// Add a type for notifications
interface Notification {
	message: string;
	type: 'success' | 'error';
}

function App() {
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [images, setImages] = useState<string[]>([]);
	const [duplicateSets, setDuplicateSets] = useState<DuplicateSetData[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [notification, setNotification] = useState<Notification | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(
		new Set()
	);

	const handleDirectoryChange = async (files: FileList | null) => {
		setSelectedFiles(files);
		if (files) {
			const imageUrls = Array.from(files).map((file) =>
				URL.createObjectURL(file)
			);
			setImages(imageUrls);

			setIsLoading(true);
			setDuplicateSets([]); // Clear previous results
			setNotification(null); // Clear previous notifications

			// Make an API call to the backend to scan for duplicates.
			try {
				const response = await fetch('/api/scan', { method: 'POST' });
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const data = await response.json();
				setDuplicateSets(data);
			} catch (error) {
				console.error('Failed to fetch duplicate sets:', error);
				setNotification({
					message: 'Failed to scan for duplicates. Please try again.',
					type: 'error',
				});
			} finally {
				setIsLoading(false);
			}
		} else {
			setImages([]);
			setDuplicateSets([]);
		}
	};

	const handleSelection = (id: string, selected: boolean) => {
		setSelectedForDeletion((prev) => {
			const newSet = new Set(prev);
			if (selected) {
				newSet.add(id);
			} else {
				newSet.delete(id);
			}
			return newSet;
		});
	};

	const handleDelete = async () => {
		const idsToDelete = Array.from(selectedForDeletion);
		if (idsToDelete.length === 0) return;
		setNotification(null);
		setIsDeleting(true);

		try {
			const response = await fetch('/api/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ids: idsToDelete }),
			});

			if (response.ok) {
				setNotification({
					message: `Successfully deleted ${idsToDelete.length} items.`,
					type: 'success',
				});
				// Remove deleted items from state to update the UI
				setDuplicateSets((prev) =>
					prev
						.map((set) => ({
							...set,
							duplicates: set.duplicates.filter(
								(d) => !idsToDelete.includes(d.id)
							),
						}))
						.filter((set) => set.duplicates.length > 1)
				);
				setSelectedForDeletion(new Set());
			} else {
				throw new Error('Failed to delete items.');
			}
		} catch (error) {
			console.error('Failed to delete items:', error);
			setNotification({
				message: 'An error occurred while deleting items.',
				type: 'error',
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const handleReset = async () => {
		setIsLoading(true);
		setNotification(null);
		try {
			await fetch('/api/reset', { method: 'POST' });
			// After resetting, perform a new scan to get the fresh data
			const response = await fetch('/api/scan', { method: 'POST' });
			if (!response.ok) throw new Error('Failed to re-scan after reset.');
			const data = await response.json();
			setDuplicateSets(data);
			setSelectedForDeletion(new Set());
			setNotification({
				message: 'Data has been reset successfully.',
				type: 'success',
			});
		} catch (error) {
			console.error('Failed to reset data:', error);
			setNotification({
				message: 'Failed to reset data on the server.',
				type: 'error',
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div style={{ padding: '20px' }}>
			<h1>Dupepix</h1>
			<FileUpload onDirectoryChange={handleDirectoryChange} />
			<button
				onClick={handleReset}
				style={{ marginLeft: '10px', backgroundColor: '#6c757d' }}
			>
				Reset Data
			</button>

			{isLoading && <p>Loading...</p>}
			{notification && (
				<p
					style={{
						color: notification.type === 'error' ? 'red' : 'green',
						padding: '10px',
						border: `1px solid ${
							notification.type === 'error' ? 'red' : 'green'
						}`,
						borderRadius: '4px',
						marginTop: '10px',
					}}
				>
					{notification.message}
				</p>
			)}

			{images.length > 0 && !isLoading && (
				<>
					<h2>Directory Preview</h2>
					<ImageGallery imageUrls={images} />
				</>
			)}

			<hr style={{ margin: '20px 0' }} />

			<h2>Duplicate Sets</h2>
			{duplicateSets.length > 0
				? duplicateSets.map((set) => (
						<DuplicateSet
							key={set.id}
							duplicates={set.duplicates}
							onSelect={handleSelection}
						/>
				  ))
				: !isLoading &&
				  notification?.type !== 'error' && (
						<p>No duplicate sets found, or no directory selected.</p>
				  )}

			{duplicateSets.length > 0 && (
				<div style={{ marginTop: '20px' }}>
					<button
						onClick={handleDelete}
						disabled={selectedForDeletion.size === 0 || isDeleting}
					>
						{isDeleting
							? 'Deleting...'
							: `Delete Selected (${selectedForDeletion.size})`}
					</button>
				</div>
			)}
		</div>
	);
}

export default App;
