// API route for reports
// In a real application, this would connect to a backend database
// For MVP, we'll use in-memory storage (replace with actual database later)

import { reports } from './data';

export async function GET() {
  try {
    return Response.json(reports);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    const newReport = {
      id: reports.length + 1,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reports.push(newReport);
    
    return Response.json(newReport, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

