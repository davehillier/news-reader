import { NextRequest, NextResponse } from 'next/server';
import { checkAuthFromRequest } from '@/lib/authCheck';
import { getPersonCatalog } from '@/lib/personCatalog';

export async function GET(request: NextRequest) {
  const authResult = await checkAuthFromRequest(request);

  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  try {
    const catalog = await getPersonCatalog();
    return NextResponse.json({ people: catalog, total: catalog.length });
  } catch (error) {
    console.error('People catalog error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch person catalog' },
      { status: 500 }
    );
  }
}
