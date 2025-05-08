
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { sheetsApi } from "@/lib/sheetsApi";
import { useEvent } from "./EventContext";

interface Participant {
  id: string;
  NAMA_KEJOHANAN: string;
  PASUKAN: string;
  NO_BADAN: string;
  KATEGORI: string;
  UMUR: string;
  NAMA_PESERTA: string;
  ACARA: string;
}

interface ParticipantContextType {
  participants: Participant[];
  isLoading: boolean;
  error: string | null;
  fetchParticipants: () => Promise<void>;
  addParticipant: (participantData: Omit<Participant, "id">) => Promise<boolean>;
  updateParticipant: (participantId: string, participantData: Partial<Participant>) => Promise<boolean>;
  deleteParticipant: (participantId: string) => Promise<boolean>;
  filterParticipants: (filters: {
    pasukan?: string;
    kategori?: string;
    umur?: string;
  }) => Participant[];
}

const ParticipantContext = createContext<ParticipantContextType | null>(null);

export const ParticipantProvider = ({ children }: { children: ReactNode }) => {
  const { selectedEvent } = useEvent();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.fetchData('Daftar');
      if (response.status === 'success') {
        // Filter participants by the selected event
        const eventParticipants = response.data.filter(
          (p: any) => p.NAMA_KEJOHANAN === selectedEvent.NAMA_KEJOHANAN
        );
        setParticipants(eventParticipants);
      } else {
        setError('Failed to fetch participants');
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError('Error fetching participants');
    } finally {
      setIsLoading(false);
    }
  };

  const addParticipant = async (participantData: Omit<Participant, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.addRow('Daftar', participantData);
      if (response.status === 'success') {
        // Refresh participants to show the new one
        await fetchParticipants();
        return true;
      } else {
        setError('Failed to add participant');
        return false;
      }
    } catch (err) {
      console.error('Error adding participant:', err);
      setError('Error adding participant');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateParticipant = async (participantId: string, participantData: Partial<Participant>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.updateRow('Daftar', participantId, participantData);
      if (response.status === 'success') {
        // Refresh participants to reflect changes
        await fetchParticipants();
        return true;
      } else {
        setError('Failed to update participant');
        return false;
      }
    } catch (err) {
      console.error('Error updating participant:', err);
      setError('Error updating participant');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteParticipant = async (participantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.deleteRow('Daftar', participantId);
      if (response.status === 'success') {
        // Refresh participants to reflect deletion
        await fetchParticipants();
        return true;
      } else {
        setError('Failed to delete participant');
        return false;
      }
    } catch (err) {
      console.error('Error deleting participant:', err);
      setError('Error deleting participant');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const filterParticipants = (filters: {
    pasukan?: string;
    kategori?: string;
    umur?: string;
  }) => {
    return participants.filter(p => {
      let match = true;
      if (filters.pasukan && p.PASUKAN !== filters.pasukan) match = false;
      if (filters.kategori && p.KATEGORI !== filters.kategori) match = false;
      if (filters.umur && p.UMUR !== filters.umur) match = false;
      return match;
    });
  };

  // Fetch participants when the selected event changes
  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants();
    } else {
      setParticipants([]);
    }
  }, [selectedEvent]);

  return (
    <ParticipantContext.Provider value={{
      participants,
      isLoading,
      error,
      fetchParticipants,
      addParticipant,
      updateParticipant,
      deleteParticipant,
      filterParticipants
    }}>
      {children}
    </ParticipantContext.Provider>
  );
};

export const useParticipant = () => {
  const context = useContext(ParticipantContext);
  if (!context) {
    throw new Error("useParticipant must be used within a ParticipantProvider");
  }
  return context;
};
