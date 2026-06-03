// Define the types based on the backend models
export interface PersonNode {
  id: string;
  name?: string;
  email?: string;
  // ... other fields based on backend definition
}

export interface MemberOf {
  person: PersonNode;
  joinedAt: string;
  leftAt?: string;
  roleInGroup: string;
}

export interface Leads {
  person: PersonNode;
  fromDate: string;
  toDate?: string;
}

export interface WorksOn {
  task: any; // Simplified for now
  assignedAt: string;
}

export interface FormedIn {
  meeting: any; // Simplified
  spawnedAt: string;
}

export interface SiblingGroup {
  sibling: GroupNode;
  splitAt: string;
}

export interface GroupNode {
  id: string;
  name?: string;
  taskId: string;
  state: string; // e.g. "FORMING", "ACTIVE", "EVOLVING", "DISSOLVED"
  createdAt: string;
  dissolvedAt?: string;
  members?: MemberOf[];
  leads?: Leads[];
  siblings?: SiblingGroup[];
  task?: WorksOn;
  meeting?: FormedIn;
}

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8085'}/api/groups`; 

const getHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("meetup_access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  const error = await res.json().catch(() => ({}));
  return error.message || fallback;
};

export const groupsApi = {
  // Fetch all groups
  getAllGroups: async (): Promise<GroupNode[]> => {
    const res = await fetch(API_BASE_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch groups"));
    return res.json();
  },

  // Fetch group by ID
  getGroupById: async (groupId: string): Promise<GroupNode> => {
    const res = await fetch(`${API_BASE_URL}/${groupId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch group"));
    return res.json();
  },

  // Form a new group
  formGroup: async (taskId: string, meetingId: string, ownerId: string): Promise<GroupNode> => {
    const params = new URLSearchParams({ taskId, meetingId, ownerId });
    const res = await fetch(`${API_BASE_URL}/form?${params}`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to form group"));
    return res.json();
  },

  // Join a group
  joinGroup: async (groupId: string, personId: string, role: string): Promise<void> => {
    const params = new URLSearchParams({ personId, role });
    const res = await fetch(`${API_BASE_URL}/${groupId}/join?${params}`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to join group"));
  },

  // Leave a group
  leaveGroup: async (groupId: string, personId: string): Promise<void> => {
    const params = new URLSearchParams({ personId });
    const res = await fetch(`${API_BASE_URL}/${groupId}/leave?${params}`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to leave group"));
  },

  // Transfer lead
  transferLead: async (groupId: string, oldLeadId: string, newLeadId: string): Promise<void> => {
    const params = new URLSearchParams({ oldLeadId, newLeadId });
    const res = await fetch(`${API_BASE_URL}/${groupId}/transfer?${params}`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to transfer lead"));
  },

  // Split group
  splitGroup: async (groupId: string, newGroupName: string): Promise<void> => {
    const params = new URLSearchParams({ newGroupName });
    const res = await fetch(`${API_BASE_URL}/${groupId}/split?${params}`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to split group"));
  },

  // Merge groups
  mergeGroups: async (targetGroupId: string, sourceGroupId: string): Promise<void> => {
    const params = new URLSearchParams({ sourceGroupId });
    const res = await fetch(`${API_BASE_URL}/${targetGroupId}/merge?${params}`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to merge groups"));
  },

  // Dissolve group
  dissolveGroup: async (groupId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${groupId}/dissolve`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to dissolve group"));
  },

  // Suggest members
  suggestMembers: async (taskId: string, creatorId: string): Promise<PersonNode[]> => {
    const params = new URLSearchParams({ taskId, creatorId });
    const res = await fetch(`${API_BASE_URL}/suggestions?${params}`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch suggestions"));
    return res.json();
  },

  getPeople: async (): Promise<PersonNode[]> => {
    const res = await fetch(`${API_BASE_URL}/people`, { headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to fetch people"));
    return res.json();
  },

  updateGroupName: async (groupId: string, name: string): Promise<GroupNode> => {
    const params = new URLSearchParams({ name });
    const res = await fetch(`${API_BASE_URL}/${groupId}/name?${params}`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to update group name"));
    return res.json();
  },

  syncPeople: async (): Promise<PersonNode[]> => {
    const res = await fetch(`${API_BASE_URL}/sync-people`, { method: 'POST', headers: getHeaders() });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Failed to sync people from auth-service"));
    return res.json();
  },
};
