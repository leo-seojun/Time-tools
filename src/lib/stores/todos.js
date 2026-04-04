import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'timetools-todos';

function createTodosStore() {
  const { subscribe, set, update } = writable([]);

  if (browser) {
    // 로드
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      set(JSON.parse(saved));
    }
  }

  return {
    subscribe,
    add: (text) => {
      update((todos) => {
        const newTodo = {
          id: crypto.randomUUID(),
          text: text.trim(),
          done: false,
          createdAt: Date.now()
        };
        const updated = [...todos, newTodo];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    toggle: (id) => {
      update((todos) => {
        const updated = todos.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    delete: (id) => {
      update((todos) => {
        const updated = todos.filter((todo) => todo.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    clearCompleted: () => {
      update((todos) => {
        const updated = todos.filter((todo) => !todo.done);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };
}

export const todos = createTodosStore();
