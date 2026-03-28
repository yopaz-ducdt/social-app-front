export function adaptPost(raw) {
  const id = raw?.id ?? String(Math.random());
  const title = raw?.title ?? '';
  const content = raw?.content ?? '';
  const images = raw?.images ?? [];
  const likes = Number(raw?.like ?? 0) || 0;
  const comments = raw?.commentResponseList ?? [];
  const username = raw?.username ?? raw?.user?.username ?? '';

  return { id, title, content, images, likes, comments, username, raw };
}

export function adaptPostList(payload) {
  const items =
    payload?.content ??
    payload?.data?.content ??
    payload?.items ??
    payload?.data?.items ??
    payload ??
    [];

  if (!Array.isArray(items)) return [];
  return items.map(adaptPost);
}
