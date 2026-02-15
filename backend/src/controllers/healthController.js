export async function healthController() {
  return { ok: true, service: 'durak-backend' };
}
