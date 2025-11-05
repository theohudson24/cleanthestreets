// Shared data store for reports (MVP only - replace with database in production)

export let reports = [
  // Sample data for testing
  {
    id: 1,
    issueType: 'pothole',
    description: 'Large pothole on Main Street',
    latitude: 40.7128,
    longitude: -74.0060,
    status: 'reported',
    severity: 3,
    imageUrl: null,
    imageUrls: null,
    address: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

