// API route for individual reports
// In a real application, this would connect to a backend database

import { reports } from '../data';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const report = reports.find(r => r.id === id);
    
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }
    
    return Response.json(report);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

