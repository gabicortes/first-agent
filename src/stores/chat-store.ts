import { create } from "zustand";

type ChatStore = {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
