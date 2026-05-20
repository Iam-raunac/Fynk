import { BASE_URL } from "@/config";

export const getMediaUrl = (media) => {
  if (!media) return "";
  if (/^https?:\/\//i.test(media)) return media;

  return `${BASE_URL}/${String(media)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
};

export const getUserAvatar = (user) => getMediaUrl(user?.profilePicture || "default.jpg");
