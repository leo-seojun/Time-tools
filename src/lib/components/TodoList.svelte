<svelte:options runes />
<script>
  import TodoItem from './TodoItem.svelte';
  import { todos } from '$lib/stores/todos.js';
  import '../../app.css'

  let { filter = 'all' } = $props();

  let filteredTodos = $derived(
    filter === 'all'
      ? $todos
      : filter === 'active'
      ? $todos.filter((t) => !t.done)
      : $todos.filter((t) => t.done)
  );

  let remaining = $derived($todos.filter((t) => !t.done).length);
</script>

<div class="todo-list-wrapper">
  <section class="todo-controls">
    <div class="remaining">
      <span class="remaining-dot" />
      <span>{remaining}개 남음</span>
    </div>

  <div class="filters">
    <button
      class="filter-btn {filter === 'all' ? 'active' : ''}"
      on:click={() => filter = 'all'}
    >
      전체
    </button>
    <button
      class="filter-btn {filter === 'active' ? 'active' : ''}"
      on:click={() => filter = 'active'}
    >
      진행중
    </button>
    <button
      class="filter-btn {filter === 'completed' ? 'active' : ''}"
      on:click={() => filter = 'completed'}
    >
      완료
    </button>
  </div>

  </section>

  <ul class="todo-list">
    {#if filteredTodos.length === 0}
      <li class="todo-empty">
        {filter === 'all' ? '할 일이 없습니다' : '해당 항목이 없습니다'}
      </li>
    {:else}
      {#each filteredTodos as todo (todo.id)}
        <TodoItem
          {todo}
          onToggle={todos.toggle}
          onDelete={todos.delete}
        />
      {/each}
    {/if}
  </ul>
</div>

<style>
  .todo-list-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .todo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    justify-content: space-between;
    /* margin-bottom: 1rem; */
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  @media (max-width: 480px) {
    .todo-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
  }

  .remaining {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--muted);
  }

  .remaining-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--primary);
    box-shadow: 0 0 0 2px var(--ring);
  }

  .filters {
    display: flex;
    gap: 0.25rem;
    padding: 0.125rem;
    border-radius: 999px;
    background: var(--control-bg);
    border: 1px solid var(--control-border);
  }

  .filter-btn {
    padding: 0.25rem 0.75rem;
    border: none;
    background: transparent;
    border-radius: 999px;
    font-size: 0.8rem;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .filter-btn.active,
  .filter-btn:hover {
    background: var(--hover);
    color: var(--text);
  }

  .todo-list {
    flex: 1;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 400px;
  }

  .todo-empty {
    padding: 1.5rem 0;
    text-align: center;
    color: var(--muted);
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    .filters {
      order: 3;
    }
    .btn-sm {
      order: 4;
    }
  }
</style>
