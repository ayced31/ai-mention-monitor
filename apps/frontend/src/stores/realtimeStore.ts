import { create } from 'zustand';

interface RealtimeEvent {
  type: 'mention:new' | 'alert:triggered' | 'query:checked';
  data: any;
  timestamp: string;
}

interface RealtimeState {
  connected: boolean;
  events: RealtimeEvent[];
  setConnected: (connected: boolean) => void;
  addEvent: (event: RealtimeEvent) => void;
  clearEvents: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connected: false,
  events: [],
  setConnected: (connected) => set({ connected }),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50), // Keep last 50 events
    })),
  clearEvents: () => set({ events: [] }),
}));
