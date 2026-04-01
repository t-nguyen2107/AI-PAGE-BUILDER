import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock prisma before importing the route handlers
// ---------------------------------------------------------------------------

const mockFindMany = vi.fn();
const mockFindFirst = vi.fn();
const mockCreate = vi.fn();
const mockProjectFindUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: (...args: unknown[]) => mockProjectFindUnique(...args),
    },
    globalSection: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Import after mocks are set up
import { GET, POST } from '@/app/api/projects/[projectId]/global-sections/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(url: string, options?: globalThis.RequestInit) {
  return new NextRequest(url, options as ConstructorParameters<typeof NextRequest>[1]);
}

function makeParams(projectId: string) {
  return { params: Promise.resolve({ projectId }) };
}

const FAKE_PROJECT_ID = 'proj-123';

const MOCK_DB_SECTION = {
  id: 'gs-1',
  projectId: FAKE_PROJECT_ID,
  sectionType: 'header',
  sectionName: 'Main Header',
  treeData: JSON.stringify({ id: 'section-1', type: 'section', tag: 'header', children: [] }),
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// GET /api/projects/:projectId/global-sections
// ---------------------------------------------------------------------------

describe('GET /api/projects/:projectId/global-sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns parsed global sections for a valid project', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindMany.mockResolvedValue([MOCK_DB_SECTION]);

    const req = makeRequest(`http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`);
    const res = await GET(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    // treeData should be parsed from JSON string to object
    expect(typeof body.data[0].treeData).toBe('object');
    expect(body.data[0].treeData.id).toBe('section-1');
    expect(body.data[0].id).toBe('gs-1');
  });

  it('returns empty array when no sections exist', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindMany.mockResolvedValue([]);

    const req = makeRequest(`http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`);
    const res = await GET(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it('returns 404 when project does not exist', async () => {
    mockProjectFindUnique.mockResolvedValue(null);

    const req = makeRequest(`http://localhost/api/projects/bad-id/global-sections`);
    const res = await GET(req, makeParams('bad-id'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 on database error', async () => {
    mockProjectFindUnique.mockRejectedValue(new Error('DB down'));

    const req = makeRequest(`http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`);
    const res = await GET(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ---------------------------------------------------------------------------
// POST /api/projects/:projectId/global-sections
// ---------------------------------------------------------------------------

describe('POST /api/projects/:projectId/global-sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new global section with valid data', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue(MOCK_DB_SECTION);

    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: 'header',
          sectionName: 'Main Header',
          treeData: { id: 'section-1', type: 'section', tag: 'header', children: [] },
        }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('gs-1');
    // treeData should be parsed object in response
    expect(typeof body.data.treeData).toBe('object');
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        projectId: FAKE_PROJECT_ID,
        sectionType: 'header',
        sectionName: 'Main Header',
        treeData: JSON.stringify({ id: 'section-1', type: 'section', tag: 'header', children: [] }),
      },
    });
  });

  it('creates a section with default treeData when treeData is omitted', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({
      ...MOCK_DB_SECTION,
      treeData: '{}',
    });

    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionType: 'footer',
          sectionName: 'Site Footer',
        }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        projectId: FAKE_PROJECT_ID,
        sectionType: 'footer',
        sectionName: 'Site Footer',
        treeData: JSON.stringify({}),
      },
    });
  });

  it('returns 422 when sectionType is missing', async () => {
    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionName: 'My Section' }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when sectionName is missing', async () => {
    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: 'header' }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 when sectionType is not a valid type', async () => {
    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: 'invalid-type', sectionName: 'Test' }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.message).toContain('header');
  });

  it('returns 404 when project does not exist', async () => {
    mockProjectFindUnique.mockResolvedValue(null);

    const req = makeRequest(
      `http://localhost/api/projects/bad-id/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: 'header', sectionName: 'Header' }),
      },
    );

    const res = await POST(req, makeParams('bad-id'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('returns 409 when section with same type already exists', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindFirst.mockResolvedValue(MOCK_DB_SECTION);

    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: 'header', sectionName: 'Duplicate' }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('returns 409 on Prisma unique constraint violation (P2002)', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindFirst.mockResolvedValue(null);
    const prismaError = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
    mockCreate.mockRejectedValue(prismaError);

    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: 'nav', sectionName: 'Nav' }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('returns 500 on unexpected database error', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockRejectedValue(new Error('Unexpected'));

    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: 'custom', sectionName: 'Custom Section' }),
      },
    );

    const res = await POST(req, makeParams(FAKE_PROJECT_ID));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
  });

  it('trims whitespace from sectionType and sectionName', async () => {
    mockProjectFindUnique.mockResolvedValue({ id: FAKE_PROJECT_ID });
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue(MOCK_DB_SECTION);

    const req = makeRequest(
      `http://localhost/api/projects/${FAKE_PROJECT_ID}/global-sections`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: '  header  ', sectionName: '  Header  ' }),
      },
    );

    await POST(req, makeParams(FAKE_PROJECT_ID));

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        sectionType: 'header',
        sectionName: 'Header',
      }),
    });
  });
});
