const MEETING_USER_ID_STORAGE_KEY = "meetup-meeting-user-id";
const MEETING_USER_NAME_STORAGE_KEY = "meetup-meeting-user-name";

export const DEFAULT_DEV_HOST_USER_ID = "11111111-1111-1111-1111-111111111111";
export const DEFAULT_DEV_HOST_USER_NAME = "Meeting Host";

export function getMeetingUserId() {
  if (typeof window === "undefined") {
    return DEFAULT_DEV_HOST_USER_ID;
  }

  const existing = window.localStorage.getItem(MEETING_USER_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const generated = crypto.randomUUID();
  window.localStorage.setItem(MEETING_USER_ID_STORAGE_KEY, generated);
  return generated;
}

export function getMeetingUserName() {
  if (typeof window === "undefined") {
    return DEFAULT_DEV_HOST_USER_NAME;
  }

  return window.localStorage.getItem(MEETING_USER_NAME_STORAGE_KEY) ?? DEFAULT_DEV_HOST_USER_NAME;
}

export function setMeetingUser(userId: string, userName: string) {
  window.localStorage.setItem(MEETING_USER_ID_STORAGE_KEY, userId);
  window.localStorage.setItem(MEETING_USER_NAME_STORAGE_KEY, userName);
}

export function meetingUserHeaders(userId = getMeetingUserId(), userName = getMeetingUserName()) {
  return {
    "X-User-Id": userId,
    "X-User-Name": userName,
  };
}
