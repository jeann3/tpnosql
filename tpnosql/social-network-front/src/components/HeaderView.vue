<template>
  <section class="header">
    <h1>Social Network Analysis</h1>
    <icon-button @databaseSelected="onDatabaseSelected" title="PostgreSQL" database="postgres"></icon-button>
    <icon-button @databaseSelected="onDatabaseSelected" title="Neo4J" database="neo4j"></icon-button>
  </section>
</template>

<script>
import IconButton from "@/components/IconButton";
export default {
  name: "HeaderView",
  components: {IconButton},
  data() {
    return {
      selectedDatabase: null
    }
  },
  methods:{
    onDatabaseSelected(database) {
      this.selectedDatabase = database;
      this.$emit('databaseSelected',this.selectedDatabase);
    }
  }
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Lato:400,300,100,700,900);

h1, p, a{
  margin: 0;
  padding: 0;
  font-family: 'Lato';
}

h1 {
  font-size: 2.8em;
  padding: 10px 0;
  font-weight: 800;
}

p {
  font-size: 1.1em;
  font-weight: 100;
  letter-spacing: 5px;
}

.header {
  width: 100%;
  padding:60px 0;
  text-align: center;
  background: #33cccc;
  color: white;
}
</style>