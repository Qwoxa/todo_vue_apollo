<template>
  <div class="sliderMenu grayBgColor">
    <div class="sliderHeader">Online users - {{ online_list.length }}</div>
    <div
      class="userInfo"
      v-for="user in online_list"
      v-bind:key="user.user.name"
    >
      <div class="userImg">
        <i class="far fa-user" />
      </div>
      <div class="userName">
        {{ user.user.name }}
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag";

const SUBSCRIPTION_ONLINE_USERS = gql`
  subscription getOnlineUsers {
    online_users(order_by: { user: { name: asc } }) {
      last_seen
      user {
        name
      }
    }
  }
`;

export default {
  data() {
    return {
      online_list: []
    };
  },
  apollo: {
    $subscribe: {
      online_users: {
        query: SUBSCRIPTION_ONLINE_USERS,
        result({ data }) {
          this.online_list = data.online_users;
        }
      }
    }
  },
  mounted() {
    const self = this;

    const UPDATE_LASTSEEN_MUTATION = gql`
      mutation updateLastSeen($now: timestamptz!) {
        update_users(where: {}, _set: { last_seen: $now }) {
          affected_rows
        }
      }
    `;

    updateLastSeen();
    setInterval(updateLastSeen, 30000);

    function updateLastSeen() {
      self.$apollo.mutate({
        mutation: UPDATE_LASTSEEN_MUTATION,
        variables: {
          now: new Date().toISOString()
        }
      });
    }
  }
};
</script>
