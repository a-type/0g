import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useStore = create(
  combine(
    {
      selectedEntityId: null as string | null,
    },
    (set, get) => ({
      api: {
        selectEntity: (id: string) => set({ selectedEntityId: id }),
      },
    }),
  ),
);
