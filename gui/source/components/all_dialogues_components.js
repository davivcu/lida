/************************************
* All Dialgoues View "aka MAIN LIDA VIEW"
*************************************/



Vue.component("all-dialogues", {

  props: [
      "alreadyVisited"
  ],

  data () {
      return {
          allDialogueMetadata: [],
          dragging: false,
          showModal: false,
          // Reference to the language item
          guiMessages
      }
  },
   computed : {
        userName : function(){
            console.log("computing user name");
            userName = localStorage["remember"];
            return userName
        }
   },
  created() {
      allDialoguesEventBus.$on( "refresh_dialogue_list", this.getAllDialogueIdsFromServer )
  },
  mounted () {
      this.init();
  },

  methods: {

        init : function(){
            // Step ONE: Get FILE NAME
            mainApp.userName = localStorage["remember"];
            this.getAllDialogueIdsFromServer();

        },
    handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.transition = '0.3s'
        elem.style.backgroundColor = '#c2c6c4';
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.dropEffect = 'copy';
        this.dragging = true;
    },

    handleDragOut(event) {
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.backgroundColor = 'inherit';
        this.dragging = false;
    },

    handleDrop(event) {
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.backgroundColor = 'inherit';
        this.dragging = false;
        let file     = event.dataTransfer.files[0]
        this.handle_file(file);
    },

    getAllDialogueIdsFromServer() {
      backend.get_all_dialogue_ids_async()
          .then( (response) => {

              this.allDialogueMetadata = response;
              console.log(response);
              if ((mainApp.restored == "false") && (response.length == 0)) {
                  //if new session then recover from database
                  this.restore_session_from_database(mainApp.userName);
              }
              mainApp.restored = "true";
          });
    },

    dialogue_already_visited(id) {
        return this.alreadyVisited.includes(id)
    },

    clicked_dialogue(clickedDialogue) {
        allDialoguesEventBus.$emit("dialogue_selected", this.allDialogueMetadata[clickedDialogue].id)
    },

    create_new_dialogue(event) {

        backend.post_empty_dialogue()
            .then( (newDialogueId) => {

                this.allDialogueMetadata.push({id: newDialogueId, num_turns: 1, collection:""});
                backend.update_db();
            });
    },

    delete_dialogue(event) {

        if (confirm("Are you sure you want to permanently delete this dialogue? This cannot be undone!")) {

            console.log('-------- DELETING --------')
            console.log()
            idToDelete = event.target.parentNode.parentNode.id;
            nameToDelete = this.allDialogueMetadata[idToDelete].id
            backend.del_single_dialogue_async(nameToDelete)
                .then( () => {
                    allDialoguesEventBus.$emit("refresh_dialogue_list");
                    backend.update_db();
                });

            allDialoguesEventBus.$emit('dialogue_deleted', nameToDelete);

        } else {

            return

        }

    },

    open_file(event){
        let file = event.target.files[0];
        this.handle_file(file);
    },

    handle_file(file) {
        let textType = /text.plain/;
        let jsonType = /application.json/;

        if (file.type.match(textType)) {

            allDialoguesEventBus.$emit('loaded_text_file', file);

        } else if (file.type.match(jsonType)) {

            console.log('---- HANDLING LOADED JSON FILE ----');
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader)
                console.log('THE EVENT VALUE', event)
                text = reader.result
                backend.post_new_dialogue_from_json_string_async(text, file.name)
                    .then( (response) => {

                        if ('error' in response.data) {
                            alert(`JSON file \"${file.name}\" is not in the correct format. Error from the server: ${response.data.error}`)
                        } else {
                            allDialoguesEventBus.$emit("refresh_dialogue_list");
                        }

                    });
            };

            reader.readAsText(file);

        } else {

            alert('Only .txt or .json files are supported.')

        }
    },

    log_out() {
        let ask = confirm("Do you want to log out?");
        if (ask == true) {
            localStorage.removeItem("remember");
            location.reload();
        }
    },

    handle_file_name_change : function(event){
        console.log('---- CHANGING FILE NAME ----');
        console.log(event);

        // for some reason needs manual updating...
        mainApp.userName = event.target.value;

        backend.put_name("USER_"+event.target.value+".json")
            .then( (response) => {

                if (response) {
                    console.log("Name Changed");
                } else {
                    alert('Server error, name not changed.')
                }

            })
    },

    restore_session_from_database: function (fileName) {
          console.log("Ready to restore from database");
          const mainContainer = document.getElementById("mainContainer");
          mainContainer.style.cursor = "progress";
          backend.get_user_db_entry_async(fileName)
                .then( (response) => {
                      console.log(response);
                      allDialoguesEventBus.$emit("refresh_dialogue_list");
                      mainContainer.style.cursor = null;
          });
    },

    //
    // toggleFileEdit: function() {
    //
    //     let inputSection = document.getElementById('fileName')
    //     let titleSpan    = document.getElementById('fileNameInput')
    //
    //     if (this.editingTitle) {
    //         this.editingTitle          = false;
    //         inputSection.style.display = 'none';
    //         titleSpan.style.display    = 'inherit';
    //     } else {
    //         this.editingTitle          = true;
    //         inputSection.style.display = 'inherit';
    //         inputSection.focus();
    //         titleSpan.style.display    = 'none';
    //     }
    //
    // },

    download_all_dialogues_from_server(event) {
        backend.get_all_dialogues_async()
            .then( (response) => {
                let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                fileName = "USER_" + mainApp.userName + ".json"
                link.setAttribute('download', fileName )
                document.body.appendChild(link)
                link.click();
            });
    },

    clean_dialogues() {
        let del = confirm(guiMessages.selected.lida.confirmWipe);
        if (del == true) {
            backend.del_all_dialogues_async(mainApp.userName)
                .then( (response) => {
                    console.log("All user's dialogues deleted.");
                    allDialoguesEventBus.$emit("refresh_dialogue_list");
            });
        }
    },

    clicked_database_button() {
       databaseEventBus.$emit("database_selected");
    },
    clicked_collections_button() {
       databaseEventBus.$emit("collections_selected");
    },

  },

  template:

  `
  <div class="all-dialogues-container"
       id="listedDialoguesContainer"
       v-on:dragover="handleDragOver($event)"
       v-on:dragleave="handleDragOut($event)"
       v-on:drop="handleDrop($event)">
    
    
     <div class="dialogue-list-title-container">

          <div class="all-dialogues-list-title">
              <h2 v-if="!(dragging)" >
                  {{ allDialogueMetadata.length }} {{ guiMessages.selected.admin.dataItems }}, {{ alreadyVisited.length }} {{ guiMessages.selected.admin.visited }}
              </h2>

              <h2 v-else>
                  {{ guiMessages.selected.admin.dropAnywhere }}
              </h2>
          </div>

          <div class="file-name-container">
            <div class="inner">
              <span> USER </span>
              <input readonly id="fileNameInput"
                    type="text"
                    v-bind:value="userName" 
                    @click="log_out()">
              </input>
              <span> .json </span>
            </div>
          </div>

          <div class="help-button-container">
              <button class="help-button btn btn-sm" @click="showModal = true">{{ guiMessages.selected.lida.button_fileFormatInfo }}</button>
              <button class="help-button btn btn-sm btn-primary" @click="download_all_dialogues_from_server()">{{ guiMessages.selected.admin.button_downloadAll }}</button>
              <button class="help-button btn btn-sm" @click="clicked_collections_button()">Collections</button>
              <button class="help-button btn btn-sm" @click="clicked_database_button()">Database</button>
              
          </div>
      </div>

    <div class="inner-wrap">

      <modal v-if="showModal" @close="showModal = false"></modal>

      

      <ul class="dialogue-list">

        <li class="listed-dialogue"
            v-for="(dat, index) in allDialogueMetadata"
            v-bind:id="index">

            <div class="dialogue-list-single-item-container">

              <div class="del-dialogue-button" v-on:click="delete_dialogue($event)">
                {{ guiMessages.selected.lida.button_delete }}
              </div>


              <div class="dialouge-info" v-on:click="clicked_dialogue(index)">
                  <div class="dialogue-id">
                    {{dat.id}}
                  </div>

                  <div v-if="dialogue_already_visited(dat.id)"
                       class="visited-indicator">
                       {{ guiMessages.selected.admin.visited }}
                  </div>

                  <div class="dialogue-num-turns" >{{dat.num_turns-1}} {{ guiMessages.selected.lida.turns }}</div>
                  <div class="dialogue-annot_style" v-if="(dat.collection != '')">{{dat.collection}}</div>
                  <div class="dialogue-annot_style" v-if="(dat.collection == '')">No collection</div>
              </div>

            </div>

        </li>

      </ul>
      
      <ul class="btn-set">
        <li><button class="add-dialogue-button btn btn-sm" v-on:click="create_new_dialogue()">{{ guiMessages.selected.lida.button_newDialogue }}</button></li>
        <li><button class="add-dialogue-button btn btn-sm" v-on:click="clean_dialogues()">{{ guiMessages.selected.lida.button_wipeDialogues }}</button></li>
        <li>
          
              <input type="file"
                     id="fileInput"
                     name="fileInput"
                     accept=".txt, .json"
                     v-on:change="open_file($event)">

              <label for="fileInput"
                     id="fileInputLabel"
                     class="btn btn-sm">
                     {{ guiMessages.selected.admin.button_upload}}
              </label>
        </li>
      </ul>
      

  
      
    </div>
  </div>
  `

});
