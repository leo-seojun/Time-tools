<svelte:options runes />
<script>
  import '../../app.css'
  let inputText = $state('');
  let { onAdd } = $props();

  function handleSubmit(e) {
    e.preventDefault();
    if (inputText.trim()) {
      onAdd(inputText.trim());
      inputText = '';
    }
  }
</script>

<form on:submit={handleSubmit} class="todo-input-row">
  <input
    bind:value={inputText}
    placeholder="해야 할 일을 입력하세요"
    class="input-field"
  />
  <button type="submit" class="btn btn-primary">
    추가
  </button>
</form>

<style>
  .todo-input-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .input-field {
    flex: 1;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1px solid var(--control-border);
    background-color: var(--control-bg);
    color: var(--control-text);
    font-size: 0.95rem;
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  }

  .input-field:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--ring);
  }

  .input-field::placeholder {
    color: var(--muted);
  }

  .btn {
    padding: 0.75rem 1.25rem;
    font-size: 14px;
    font-weight: 700;
    background: var(--primary);
    color: var(--btn-text);
    border: 0px solid transparent;
    border-radius: 5px;
    cursor: pointer;
  }

  .btn:hover {
    background: var(--primary-hover);
  }

  @media (max-width: 480px) {
    .todo-input-row {
      gap: 0.5rem;
    }
    .input-field {
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
    .btn {
      font-size: 0.75rem;
      padding: 0.5rem 0.75rem;
    }
  }
</style>
