import { formatDisplayDateTime } from '@/utils/dateTime';

export function adaptPost(raw) {
  const id = raw?.id ?? String(Math.random());
  const title = raw?.title ?? '';
  const content = raw?.content ?? '';
  const images = raw?.images ?? [];
  const likes = Number(raw?.like ?? 0) || 0;
  const comments = raw?.commentResponseList ?? [];
  const createDate = raw?.createDate ?? raw?.createdAt ?? raw?.createAt ?? '';
  const userResponse = raw?.userResponse ?? raw?.user ?? raw?.author ?? null;
  const fullName = [userResponse?.firstName, userResponse?.lastName].filter(Boolean).join(' ').trim();
  const username =
    fullName ||
    raw?.username ||
    userResponse?.username ||
    raw?.user?.username ||
    '';
  const author = {
    id: userResponse?.id ?? raw?.authorId ?? raw?.userId ?? null,
    firstName: userResponse?.firstName ?? '',
    lastName: userResponse?.lastName ?? '',
    username: userResponse?.username ?? raw?.username ?? '',
    image: userResponse?.image ?? null,
    avatarUrl: userResponse?.image?.url ?? null,
  };

  return {
    id,
    title,
    content,
    images,
    likes,
    comments,
    createDate,
    time: formatDisplayDateTime(createDate),
    username,
    author,
    image: author.image,
    raw,
  };
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
