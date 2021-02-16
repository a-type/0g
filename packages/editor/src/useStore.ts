import create from 'zustand';
import { combine } from 'zustand/middleware';

export const useStore = create(
  combine(
    {
      selectedEntityId: null as number | null,
    },
    (set, get) => ({
      api: {
        selectEntity: (id: number) => set({ selectedEntityId: id }),
      },
    }),
  ),
);
