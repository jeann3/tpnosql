<template>
  <div class="container">
    <header-view @databaseSelected="onDatabaseSelected"></header-view>
    <div v-if="selectedDatabase===null">
      <label class="label">Choose a database</label>
    </div>
    <div class ="btn-container" v-else>
      <button class="btn" @click="clearDb">Clear database</button>
      <button class="btn" @click="query1">Query 1</button>
      <button class="btn" @click="query2">Query 2</button>
      <button class="btn" @click="query3">Query 3</button>
      <button class="btn" @click="insertUsers(1000000)">Insert 1M users</button>
      <button class="btn" @click="insertFollowers">Insert followers</button>
      <button class="btn" @click="insertOrders">Insert orders</button>
      <button class="btn" @click="insertProducts">Insert 10k products</button>
      <div v-if="isLoading" class="spinner"></div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import HeaderView from "@/components/HeaderView";
export default {
  components: {HeaderView},
  data() {
    return {
      isLoading: false,
      selectedDatabase: null,
      users: [],
      neo4jCount: 0,
      postgresCount: 0,
    }
  },
  methods: {
    onDatabaseSelected(database) {
      this.selectedDatabase = database;
    },
    closeNeo4jSession() {
      window.onbeforeunload = () => {
        axios.post('http://localhost:3000/api/close-session').then(response => {
          console.log(response.data);
        }).catch(error => {
          console.log(error);
        });
      }
    },
    clearDb(){
      if(this.selectedDatabase  === 'neo4j'){
          this.isLoading=true;
          console.log(this.isLoading);
          axios.get('/api/data/neo4j/clear')
              .then(response=>console.log(response))
              .catch(error=>console.error(error))
              .finally(()=>this.isLoading=false);
          console.log(this.isLoading);
      }
      else if(this.selectedDatabase === 'postgres'){
        console.log("postgres");
      }
      else{
        alert("no database selected");
      }
    },
    query1(){
      if(this.selectedDatabase === 'postgres'){
        console.log("");
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        axios.get(`/api/data/neo4j/query1`)
            .then(response=>console.log(response))
            .finally(()=>{
                  this.isLoading=false;
                }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    query2(){
      if(this.selectedDatabase === 'postgres'){
        console.log("");
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        axios.get(`/api/data/neo4j/query2`)
            .then(response=>console.log(response))
            .finally(()=>{
                  this.isLoading=false;
                }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    query3(){
      if(this.selectedDatabase === 'postgres'){
        console.log("");
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        axios.get(`/api/data/neo4j/query3`)
            .then(response=>console.log(response))
            .finally(()=>{
                  this.isLoading=false;
                }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    insertFollowers(){
      if(this.selectedDatabase === 'postgres'){
        this.isLoading=true;
        axios.post(`/api/data/postgres/insert/`)
            .then(()=>console.log("test"))
            .finally(()=> {
              console.log("test")
              this.isLoading=false;
            })
            .catch(error => {
              console.error(error);
            });
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        axios.post(`/api/data/neo4j/insert/followers/`)
            .then(response=>console.log(response))
            .finally(()=>{
                  this.isLoading=false;
                }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    insertOrders(){
      if(this.selectedDatabase === 'postgres'){
        this.isLoading=true;
        axios.post(`/api/data/postgres/insert/`)
            .then(()=>console.log("test"))
            .finally(()=> {
              console.log("test")
              this.isLoading=false;
            })
            .catch(error => {
              console.error(error);
            });
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        axios.post(`/api/data/neo4j/insert/orders/`)
            .then(response=>console.log(response))
            .finally(()=>{
                  this.isLoading=false;
                }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    insertUsers(numUsers){
      if(this.selectedDatabase === 'postgres'){
        this.isLoading=true;
        axios.post(`/api/data/postgres/insert/${numUsers}`)
            .then(()=>console.log("test"))
            .finally(()=> {
              console.log("test")
              this.isLoading=false;
            })
            .catch(error => {
              console.error(error);
            });
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        console.log('Setting isLoading to true');
        axios.post(`/api/data/neo4j/insert/users/${numUsers}`)
            .then(response=>console.log(response))
            .finally(()=>{
              this.isLoading=false;
              console.log(this.isLoading);
              }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    insertProducts(){
      if(this.selectedDatabase === 'postgres'){
        this.isLoading=true;
        axios.post(`/api/data/postgres/insert/products`)
            .then(()=>console.log("test"))
            .finally(()=> {
              console.log("test")
              this.isLoading=false;
            })
            .catch(error => {
              console.error(error);
            });
      }
      else if(this.selectedDatabase === 'neo4j'){
        this.isLoading=true;
        console.log('Setting isLoading to true');
        axios.post(`/api/data/neo4j/insert/products`)
            .then(response=>console.log(response))
            .finally(()=>{
                  this.isLoading=false;
                  console.log(this.isLoading);
                }
            )
            .catch(error=>console.error(error));
      }
      else{
        alert("no database selected");
      }
    },
    async insertUsersNeo4j(numUsers) {
      axios.post(`/api/data/neo4j/insert/users/${numUsers}`)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error(error);
          });
    },
    async insertUsers2(numUsers) {
      axios.post(`/api/data/postgres/insert/${numUsers}`)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error(error);
          });
    }
  }
}
</script>

<style>

body {
  margin:0;
  padding:0;
}

.container {
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.btn {
  font-size: 20px;
  flex: 0 0 calc(50% - 1em); /* 4 buttons per row */
  margin: 0.5em;
  border: 1px solid #33cccc;
  background-color: transparent;
  color:  #33cccc;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 300;
}

.btn:hover {
  background-color:  #33cccc;
  color: white;
}

.label {
  display: block;
  font-size: 18px;
  margin-bottom: 10px;
  font-weight: bold;
}

.spinner {
  border: 8px solid rgba(0, 0, 0, 0.1);
  border-top-color: #333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s ease-in-out infinite;
  margin: 30px auto 0;
}
.btn-container{
  display: flex;
  flex-wrap: wrap;
  max-width: 25%;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>