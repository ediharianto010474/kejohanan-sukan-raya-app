
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { sheetsApi } from "@/lib/sheetsApi";

interface Event {
  id: string;
  NAMA_KEJOHANAN: string;
  TARIKH_KEJOHANAN: string;
  TEMPAT_KEJOHANAN: string;
  JUMLAH_LORONG_100M: number;
  JUMLAH_LORONG_200M: number;
  JUMLAH_LORONG_110M_BERPAGAR: number;
}

interface EventContextType {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  selectEvent: (eventId: string) => void;
  addEvent: (eventData: Omit<Event, "id">) => Promise<boolean>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<boolean>;
}

const EventContext = createContext<EventContextType | null>(null);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.fetchData('Maklumat');
      if (response.status === 'success') {
        setEvents(response.data);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Error fetching events');
    } finally {
      setIsLoading(false);
    }
  };

  const selectEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      // Store selected event in localStorage for persistence
      localStorage.setItem('selectedEvent', JSON.stringify(event));
    }
  };

  const addEvent = async (eventData: Omit<Event, "id">) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.addRow('Maklumat', eventData);
      if (response.status === 'success') {
        // Refresh events to show the new one
        await fetchEvents();
        return true;
      } else {
        setError('Failed to add event');
        return false;
      }
    } catch (err) {
      console.error('Error adding event:', err);
      setError('Error adding event');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await sheetsApi.updateRow('Maklumat', eventId, eventData);
      if (response.status === 'success') {
        // Refresh events to reflect changes
        await fetchEvents();
        // Update selected event if it's the one being modified
        if (selectedEvent && selectedEvent.id === eventId) {
          const updatedEvent = events.find(e => e.id === eventId);
          if (updatedEvent) setSelectedEvent(updatedEvent);
        }
        return true;
      } else {
        setError('Failed to update event');
        return false;
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError('Error updating event');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load selected event from localStorage on initial render
  useEffect(() => {
    const storedEvent = localStorage.getItem('selectedEvent');
    if (storedEvent) {
      setSelectedEvent(JSON.parse(storedEvent));
    }
    
    // Initial fetch of events
    fetchEvents();
  }, []);

  return (
    <EventContext.Provider value={{ 
      events, 
      selectedEvent, 
      isLoading, 
      error, 
      fetchEvents, 
      selectEvent, 
      addEvent, 
      updateEvent 
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};
