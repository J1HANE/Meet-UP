// hooks/useAssignContext.ts

import { GroupNode, groupsApi, PersonNode } from "@/lib/api/groups";
import { useEffect, useState } from "react";

export interface Participant {
  id: string;
  name: string;
  assignedToType: "PERSON" | "GROUP";
}

export function useAssignContext() {
  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [people, groups] = await Promise.all([
          groupsApi.getPeople(),
          groupsApi.getAllGroups(),
        ]);

        if (cancelled) return;

        const mapped: Record<string, Participant> = {};

        people.forEach((p: PersonNode) => {
          mapped[p.id] = {
            id: p.id,
            name: p.name ?? p.email ?? p.id,
            assignedToType: "PERSON",
          };
        });

        groups.forEach((g: GroupNode) => {
          mapped[g.id] = {
            id: g.id,
            name: g.name ?? g.id,
            assignedToType: "GROUP",
          };
        });

        setParticipants(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load assign context",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { participants, loading, error };
}
