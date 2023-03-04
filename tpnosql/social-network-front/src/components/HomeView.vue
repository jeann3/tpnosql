<template>
  <div class="container">
    <header-view @databaseSelected="onDatabaseSelected"></header-view>
    <div v-if="selectedDatabase===null">
      <label class="label">Choose a database</label>
    </div>
    <div v-else>
      <button class="btn" @click="insertUsers(1000000)">Insert 1M users</button>
      <button class="btn" @click="insertFollowers">Insert followers</button>
      <button class="btn" @click="clearDb">Clear database</button>
      <div v-if="isLoading" class="spinner"></div>
    </div>
    <!--    <button @click="getNeo4jCount">Show Neo4j count</button>-->
<!--    <button @click="insertUsersNeo4j(10)">Insert 10 users Neo4j</button>-->
<!--    <button @click="getPostgresCount">Show Postgres count</button>-->
<!--    <div>{{ neo4jCount }}</div>-->
<!--    <div>{{ postgresCount }}</div>-->
<!--    <div>-->
<!--      <button @click="clearNeo4jDb">Clear Neo4jDB</button>-->
<!--    </div>-->
<!--    <div>-->
<!--      <button @click="insertUsers(10)">Insert 10 users</button>-->
<!--    </div>-->
<!--    <div>-->
<!--      <button @click="getUsers">Get users</button>-->
<!--      <div v-if="users.length > 0">-->
<!--        <ul>-->
<!--          <li v-for="user in users" :key="user.userid">{{ user.firstname }}</li>-->
<!--        </ul>-->
<!--      </div>-->
<!--    </div>-->
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
    async clearNeo4jDb(){
      const response = await axios.get('/api/data/neo4j/clear');
      console.log(response);
    },
    async getNeo4jCount() {
      const response = await axios.get('/api/data/neo4j');
      this.neo4jCount = response.data.count;
      console.log(this.neo4jCount);
    },
    async getPostgresCount() {
      const response = await axios.get('/api/data/postgres');
      this.postgresCount = response.data.count;
      console.log(this.postgresCount);
    },
    async getUsers() {
      const response = await axios.get('/api/data/postgres/users');
      this.users = response.data;
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
        console.log('Setting isLoading to true');
        axios.post(`/api/data/neo4j/insert/followers/`)
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
  display: block;
  border: 1px solid #33cccc;
  background-color: transparent;
  color:  #33cccc;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 300;
  margin-top: 30px;
  margin-left: 15px;
  margin-right: 15px;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>