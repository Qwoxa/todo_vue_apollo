<template>
  <div>
    <div class="todoListwrapper">
      <div
        class="loadMoreSection"
        v-if="newTodosCount"
        v-on:click="loadMoreClicked"
      >
        New tasks have arrived! ({{ newTodosCount }})
      </div>
      <TodoItem v-bind:todos="todos" v-bind:type="type" />
      <div
        class="loadMoreSection"
        v-if="olderTodosAvailable"
        v-on:click="loadOlderClicked"
      >
        Load older tasks
      </div>
    </div>
  </div>
</template>

<script>
import TodoItem from "../components/TodoItem";
import TodoFilters from "../components/TodoFilters";
import gql from "graphql-tag";

const NOTIFY_NEW_PUBLIC_TODOS = gql`
  subscription notifyNewPublicTodos {
    todos(
      where: { is_public: { _eq: true } }
      order_by: { created_at: desc }
      limit: 1
    ) {
      id
      title
      created_at
      user {
        name
      }
    }
  }
`;

const GET_OLD_PUBLIC_TODOS = gql`
  query getOldPublicTodos($oldestTodoId: Int) {
    todos(
      where: { is_public: { _eq: true }, id: { _lt: $oldestTodoId } }
      limit: 7
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      is_public
      user {
        name
      }
    }
  }
`;

export default {
  components: {
    TodoItem,
    TodoFilters
  },
  created() {
    const that = this;
    this.$apollo
      .query({
        query: GET_OLD_PUBLIC_TODOS
      })
      .then(({ data }) => {
        this.todos = data.todos;

        this.$apollo
          .subscribe({
            query: NOTIFY_NEW_PUBLIC_TODOS
          })
          .subscribe({
            next({ data }) {
              console.log("here", data);
              if (data.todos.length) {
                if (data.todos[0].id !== that.todos[0].id) {
                  that.newTodosCount = that.newTodosCount + data.length;
                }
              }
            },
            error(err) {
              console.log(err);
            }
          });
      });
  },
  data: function() {
    return {
      olderTodosAvailable: true,
      newTodosCount: 0,
      limit: 7,
      todos: [],
      type: "public"
    };
  },
  mounted() {},
  methods: {
    loadMoreClicked: function() {},
    loadOlderClicked: function() {}
  }
};
</script>
