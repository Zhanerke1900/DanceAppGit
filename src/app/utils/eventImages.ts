export const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1080';

export const getDisplayEventImage = (value?: string | null) =>
  String(value || '').trim() || DEFAULT_EVENT_IMAGE;
