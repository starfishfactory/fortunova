import { Hono } from 'hono';
import { createSharedFortune } from '@/services/share.js';
import { ErrorCodes } from '@/errors.js';

const share = new Hono();

share.post('/share', async (c) => {
  const body = await c.req.json();
  const { fortune, sajuSummary, category } = body;

  if (!fortune || !sajuSummary || !category) {
    return c.json(ErrorCodes.VALIDATION_ERROR, 400);
  }

  const shared = createSharedFortune(fortune, sajuSummary, category);
  return c.json({ shareId: shared.id, shareUrl: `/share/${shared.id}` }, 201);
});

export default share;
