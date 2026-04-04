<svelte:options runes />
<script>
  import '../../app.css';
  import TodoInput from '$lib/components/TodoInput.svelte';
  import TodoList from '$lib/components/TodoList.svelte';
  import { todos } from '$lib/stores/todos.js';

  let filter = $state('all');
</script>

<svelte:head>
  <title>Todo - TimeTools</title>
</svelte:head>

<main class="todo-page">
  <header class="page-header">
    <h1>Todo</h1>
  </header>

  <section class="todo-card">
    <TodoInput onAdd={(text) => todos.add(text)} />
    <TodoList {filter} on:filter={(e) => (filter = e.detail)} />
  </section>
</main>

<style>
  .todo-page {
    max-width: 600px;
    margin: -24px auto 0;
    padding: 2rem 1rem 3rem;
    background-color: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  .page-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    margin-bottom: 0.25rem;
    color: var(--text);
  }

  .todo-card {
    background: var(--surface);
    border-radius: 1.25rem;
    border: 1px solid var(--border);
    padding: 1.5rem;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 480px) {
    .todo-page {
      padding: 1.5rem 1rem 2rem;
    }
    .todo-card {
      padding: 1.25rem;
      border-radius: 1rem;
    }
  }
</style>
