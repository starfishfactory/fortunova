import { Hono } from 'hono';

const fortunePartials = new Hono();

fortunePartials.post('/fortune-result', async (c) => {
  const body = await c.req.parseBody();
  return c.html(
    <div class="bg-white rounded-xl shadow-lg p-6 mt-4">
      <p class="text-center text-gray-500">운세 서비스 준비 중...</p>
    </div>,
  );
});

export default fortunePartials;
