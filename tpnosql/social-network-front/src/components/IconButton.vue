<template>
  <button class="btn-bgstroke" v-on:click="changeDatabase">{{title}}
    <font-awesome-icon icon="database"></font-awesome-icon>
  </button>
</template>

<script>
import axios from "axios";

export default {
  props: ['title','database'],
  name: 'IconButton',
  methods:{
    async closeNeo4jSession() {
      axios.get('http://localhost:3000/api/close-neo4j-session').then(response => {
        console.log("closed ",response.data);
      }).catch(error => {
        console.log(error);
      });

    },
    changeDatabase: function(){
      console.log("database :",this.database);
      if(this.database === "postgres"){
        this.$emit('databaseSelected', 'postgres');
        this.closeNeo4jSession();
      }
      else if(this.database === "neo4j"){
        this.$emit('databaseSelected', 'neo4j');
      }
    }
  }
}
</script>

<style>
.btn-bgstroke {
  font-size: 20px;
  display: inline-block;
  border: 1px solid white;
  background-color: transparent;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 300;
  margin-top: 30px;
  margin-left: 15px;
  margin-right: 15px;
}

.btn-bgstroke:hover,.btn-bgstroke:focus {
  background-color: white;
  color: #33cccc;
}
</style>