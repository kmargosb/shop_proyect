import { create } from "zustand";

type State = {
  visible: boolean;
  setVisible: (v: boolean) => void;
};

export const useNavbar = create<State>((set) => ({
  visible: true,
  setVisible: (v) => set({ visible: v }),
}));