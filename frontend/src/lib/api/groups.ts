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

const API_BASE_URL = "http://localhost:8088/api/groups"; 

export const groupsApi = {
  // Fetch all groups
  getAllGroups: async (): Promise<GroupNode[]> => {
    const res = await fetch(API_BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch groups");
    return res.json();
  },

  // Fetch group by ID
  getGroupById: async (groupId: string): Promise<GroupNode> => {
    const res = await fetch(`${API_BASE_URL}/${groupId}`);
    if (!res.ok) throw new Error("Failed to fetch group");
    return res.json();
  },

  // Form a new group
  formGroup: async (taskId: string, meetingId: string, ownerId: string): Promise<GroupNode> => {
    const params = new URLSearchParams({ taskId, meetingId, ownerId });
    const res = await fetch(`${API_BASE_URL}/form?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to form group");
    return res.json();
  },

  // Join a group
  joinGroup: async (groupId: string, personId: string, role: string): Promise<void> => {
    const params = new URLSearchParams({ personId, role });
    const res = await fetch(`${API_BASE_URL}/${groupId}/join?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to join group");
  },

  // Leave a group
  leaveGroup: async (groupId: string, personId: string): Promise<void> => {
    const params = new URLSearchParams({ personId });
    const res = await fetch(`${API_BASE_URL}/${groupId}/leave?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to leave group");
  },

  // Transfer lead
  transferLead: async (groupId: string, oldLeadId: string, newLeadId: string): Promise<void> => {
    const params = new URLSearchParams({ oldLeadId, newLeadId });
    const res = await fetch(`${API_BASE_URL}/${groupId}/transfer?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to transfer lead");
  },

  // Split group
  splitGroup: async (groupId: string, newGroupName: string): Promise<void> => {
    const params = new URLSearchParams({ newGroupName });
    const res = await fetch(`${API_BASE_URL}/${groupId}/split?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to split group");
  },

  // Merge groups
  mergeGroups: async (targetGroupId: string, sourceGroupId: string): Promise<void> => {
    const params = new URLSearchParams({ sourceGroupId });
    const res = await fetch(`${API_BASE_URL}/${targetGroupId}/merge?${params}`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to merge groups");
  },

  // Dissolve group
  dissolveGroup: async (groupId: string): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/${groupId}/dissolve`, { method: 'POST' });
    if (!res.ok) throw new Error("Failed to dissolve group");
  },

  // Suggest members
  suggestMembers: async (taskId: string, creatorId: string): Promise<PersonNode[]> => {
    const params = new URLSearchParams({ taskId, creatorId });
    const res = await fetch(`${API_BASE_URL}/suggestions?${params}`);
    if (!res.ok) throw new Error("Failed to fetch suggestions");
    return res.json();
  },
};
