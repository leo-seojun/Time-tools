<svelte:options runes />
<script>
  import '../../app.css';
  import Icon from '@iconify/svelte';
  let { todo, onToggle, onDelete } = $props();
</script>

<li class="todo-item">
  <!-- ✅ Icon을 Button으로 독립 처리 -->
  <button
    type="button"
    class="checkbox-btn"
    class:checked={todo.done}
    on:click={() => onToggle(todo.id)}
    aria-label={todo.done ? '체크 해제' : '체크'}
  >
    <Icon
      icon={todo.done ? 'material-symbols:check-box' : 'material-symbols:check-box-outline-blank'}
      class="checkbox-icon"
      width="24" height="24"
    />
  </button>
  
  <button
    type="button"
    class="todo-text-btn {todo.done ? 'done' : ''}"
    on:click={() => onToggle(todo.id)}
    aria-label={todo.done ? '체크 해제' : '체크'}
  >
    {todo.text}
  </button>
  
  <button
    type="button"
    class="todo-delete"
    on:click={() => onDelete(todo.id)}
  >
    ×
  </button>
</li>

<style>
  .todo-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
  }

  .checkbox-btn {
    border: none;
    background: none;
    padding: 0.25rem;
    border-radius: 6px;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      transform 0.08s ease;
    flex-shrink: 0;
  }

  .checkbox-btn:hover {
    background: var(--hover);
    transform: scale(1.05);
  }

  .checkbox-btn.checked {
    color: var(--primary);
  }

  .checkbox-icon {
    width: 24px;
    height: 24px;
    color: inherit;
  }

  .todo-text-btn {
    flex: 1;
    border: none;
    background: none;
    text-align: left;
    padding: 0.25rem 0;
    font-size: 0.95rem;
    color: var(--text);
    line-height: 1.4;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s ease;
  }

  .todo-text-btn:hover {
    background: var(--hover);
  }

  .todo-text-btn.done {
    text-decoration: line-through;
    color: var(--muted);
  }

  .todo-delete {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 8px;
    background: var(--hover);
    color: var(--muted);
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    transform: translateX(4px);
    transition: all 0.15s ease;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .todo-item:hover .todo-delete {
    opacity: 1;
    transform: translateX(0);
  }

  .todo-delete:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  @media (max-width: 480px) {
    .todo-item {
      gap: 0.5rem;
      padding: 0.65rem 0;
    }
    
    .checkbox-icon {
      width: 22px;
      height: 22px;
    }
    
    .todo-text-btn {
      font-size: 0.9rem;
    }
  }
</style>
