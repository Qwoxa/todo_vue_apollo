import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import AuthPlugin from "./plugins/auth";

import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";

import VueApollo from "vue-apollo";

Vue.use(AuthPlugin);
Vue.use(VueApollo);
Vue.config.productionTip = false;

const getHeaders = () => {
  const headers = {};
  const token = window.localStorage.getItem("apollo-token");

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  return headers;
};

const link = new WebSocketLink({
  uri: "wss://learn.hasura.io/graphql",
  options: {
    reconnect: true,
    timeout: 30000,
    connectionParams: {
      headers: getHeaders()
    }
  }
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  appTypename: true
});

const apolloProvider = new VueApollo({
  defaultClient: client
});

new Vue({
  router,
  apolloProvider,
  render: h => h(App)
}).$mount("#app");
