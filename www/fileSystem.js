"use strict";

///////////////////////////////////////////////////////////////

(function () {
  //$("html").addClass("bootstrap-iso");
  let choiceStore = {};

  let notepad = null;
  let editors = []; //holds objects {name: "Text Editor", editor: nodepad-obj}

  let fileImage = null;
  let folderImage = null;

  let idleTimer;
  let idleTime;

  var selectedName = null;
  var currentSelectedRowSelector = null;
  let seperator = null;
  let inMemoryToken = "";
  let fsServerUrl = "";

  let imgFolder = "https://unpkg.com/mongo-db-filesystem-ui/img/";

  let saveAsFromClose = false;
  let currentFilename = null;
  let defaultFilename = null;
  let currentFileModified = false;
  let currentFileSaving = false;

  let defaultEditor = null;
  let currentEditor = null;

  let mongoFsLoginLogoutRegisterSeletor = null;
  let mongoFsLoginLogoutRegisterMenu = null;

  function getEditorByName(editorName) {
    const element = editors.find((element) => element.name === editorName);
    if (element !== undefined) {
      return element.editor;
    }
    return null;
  }

  function getFileExtension(name) {
    var l = name.length;
    var str = name[l - 4];
    if (str !== ".") return null;
    str += name[l - 3];
    str += name[l - 2];
    str += name[l - 1];
    if (str == ".all") return null;
    return str;
  }

  function clearFilesTable() {
    var chdrn = $($("#filesTable").children()[0]).children();
    for (var i = 0; i < chdrn.length; ++i) {
      $(chdrn[i]).remove();
    }
  }

  function drag(ev) {
    ev.originalEvent.dataTransfer.setData("text", $(this).attr("id"));
  }

  function allowDrop(ev) {
    ev.preventDefault();
  }

  function isMobile() {
    return (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(
        navigator.userAgent || navigator.vendor || window.opera
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        (navigator.userAgent || navigator.vendor || window.opera).substr(0, 4)
      )
    );
  }

  class Editor {
    #m_data = {};
    #classes = {};
    #extensions;
    constructor(obj) {
      const { fs, editorName, fileExtensions, explorerDialogParentId } = obj;

      const self = this;

      self.#m_data.m_fs = fs;
      self.#m_data.m_editor_opened = false;

      //self.#m_data.currentFileModified = false;

      //self.#m_data.currentFileSaving = false;
      self.#m_data.name = editorName; //e.g. "Text Editor"
      self.#m_data.editorSelector = !explorerDialogParentId
        ? $("body")
        : $(`#${explorerDialogParentId}`);

      self.#extensions = fileExtensions;

      let modifiedname = editorName.replaceAll(" ", "_");
      self.#classes.close = `${modifiedname}Close`;
      self.#classes.open = `${modifiedname}Open`;
      self.#classes.save = `${modifiedname}Save`;
      self.#classes.saveAs = `${modifiedname}SaveAs`;
      self.#classes.editorTitle = `${modifiedname}Title`;

      $(window).bind("fileSaved", function (e, filename, editorName) {
        if (editorName === self.#m_data.name) {
          currentFileSaving = false;

          self.currentFileModified(false);

          $(`.${self.#classes.save}`).attr("disabled", true);
          $(`.${self.#classes.editorTitle}`).html(
            currentFilename + ` - ${self.#m_data.name}`
          );

          if (
            currentEditor.getEditorData().name ===
            defaultEditor.getEditorData().name
          )
            defaultFilename = currentFilename;

          if (currentEditor) console.log("Saved");
        }
      });

      $(window).bind(
        "fileOpened",
        function (e, data, filename, ext, editorName) {
          if (editorName === self.#m_data.name) {
            currentFilename = filename;
            $(`.${self.#classes.editorTitle}`).html(
              `${currentFilename} - ${self.#m_data.name}`
            );
          }
          if (!defaultEditor) {
            console.error("No default editor found.");
            return;
          }
          if (editorName === defaultEditor.getEditorData().name)
            defaultFilename = currentFilename;
        }
      );

      ///////////////////////////////////////////////////////////////////////////

      $(`.${self.#classes.open}`).click(function () {
        self.#openFile();
      });

      $(`.${self.#classes.saveAs}`).click(function () {
        self.#saveAs();
      });

      $(window).bind(self.#classes.save, () => {});

      $(`.${self.#classes.save}`).click(function () {
        self.#save();
      });

      $(window).bind(self.#classes.save, () => {
        self.#save();
      });

      $(window).bind(self.#classes.saveAs, () => {
        self.#saveAs();
      });

      $(window).bind("afterEditorSaveAs", function (e, filename, editorName) {
        if (editorName === self.#m_data.name) {
          if (saveAsFromClose) {
            self.closeEditor && self.closeEditor();
            self.#setExplorerDlgParent($("body"));
            self.editorOpened(false);
            saveAsFromClose = false;
          } else {
            $(`.${self.#classes.editorTitle}`).html(
              `${filename} - ${self.#m_data.name}`
            );
            currentFilename = filename;
          }
        }
      });

      $(`.${self.#classes.close}`).click(function () {
        const editorName = self.#classes.close
          .replaceAll("_", " ")
          .replace("Close", "");
        if (currentEditor.getEditorData().name == editorName)
          self.#editorClose();
      });

      $(`.${this.#classes.editorTitle}`).html(
        `Untitled - ${this.#m_data.name}`
      );
    }

    currentFilename(filename) {
      if (filename === undefined) return currentFilename;
      currentFilename = filename;
      $(`.${this.#classes.editorTitle}`).html(
        `${filename} - ${this.#m_data.name}`
      );
    }

    currentFileModified(modified) {
      if (modified === undefined) return currentFileModified;
      currentFileModified = modified;

      if (modified) {
        let title = $(`.${this.#classes.editorTitle}`).html();
        if (title && title.charAt(0) !== "*") {
          $(`.${this.#classes.editorTitle}`).html(`*${title}`);
        }
        if (currentFilename) {
          $(`.${this.#classes.save}`).attr("disabled", false);
        }
      }
    }

    #setExplorerDlgParent(parent) {
      let el = $("#explorerSaveAsModal").detach();
      parent.append($(el));
    }

    #resetEditor() {
      this.closeEditor && this.closeEditor();
      this.#setExplorerDlgParent($("body"));
      this.editorOpened(false);
      currentEditor = defaultEditor;
      currentFilename = defaultFilename;
    }

    getExtensions() {
      return this.#extensions;
    }

    editorOpened(opened) {
      if (opened === undefined) return this.#m_data.m_editor_opened;
      this.#m_data.m_editor_opened = opened;
      if (!opened) {
        this.#m_data.m_fs.currentFilename(null);
        this.currentFileModified(false);
        currentFilename = null;
      }
    }

    #saveAs() {
      const self = this;
      const editorData = self.getEditorData();
      self.#setExplorerDlgParent(editorData.editorSelector);
      $("#explorerSaveAsModal").attr("editorName", editorData.name);
      //editorData.m_fs.saveAsDlg();
      $(window).trigger("mongoDbSaveAsDlg");
    }

    async #doSave() {
      const self = this;
      if (currentFilename) {
        try {
          if (
            currentEditor.getEditorData().name !==
              defaultEditor.getEditorData().name &&
            (!currentFileModified || currentFileSaving)
          ) {
            return;
          }
          currentFileSaving = true;
          // let el = $("#imageLoader").detach();
          // self.#m_data.editorSelector.append($(el));

          $(window).trigger("mongoDbSave", [currentFilename, self.getData()]);
          currentFileSaving = false;

          self.currentFileModified(false);
          // el = $("#imageLoader").detach();
          // $("#explorerSaveAsModal").append($(el));
          $(window).trigger("afterEditorSave", [self.#m_data.m_editor_name]);
        } catch (err) {
          console.log(err);
          currentFileSaving = false;
        }
      } else {
        //self.#m_data.m_fs.saveAsDlg();
        $(window).trigger("mongoDbSaveAsDlg");
      }
    }

    #save() {
      const self = this;
      self.#setExplorerDlgParent(self.#m_data.editorSelector);
      $("#explorerSaveAsModal").attr("editorName", self.#m_data.name);
      self.#doSave();
      return true;
    }

    #editorClose(exitingFile = false) {
      const self = this;
      const fname = currentFilename || "Untitled";
      if (self.currentFileModified()) {
        const ans = confirm(`Do you want to save changes to ${fname}.`);
        if (ans) {
          if (!exitingFile || fname == "Untitled") {
            saveAsFromClose = true;
            $(`.${self.#classes.saveAs}`).click();
          } else {
            $(`.${self.#classes.save}`).click();
            self.#resetEditor();
          }
          return;
        }
      }
      self.#resetEditor();
    }

    getEditorData() {
      return this.#m_data;
    }

    initEditor() {
      currentEditor = this;
      this.#setExplorerDlgParent(this.getEditorData().editorSelector);
      if (!currentFilename)
        $(`.${this.#classes.editorTitle}`).html(
          `Untitled - ${this.#m_data.name}`
        );
      this.editorOpened(true);
    }

    #openFile() {
      this.#setExplorerDlgParent(this.getEditorData().editorSelector);
      $("#explorerSaveAsModal").attr("editorName", this.getEditorData().name);
      //this.getEditorData().m_fs.explorerDlg();
      $(window).trigger("mongoDbExplorerDlg");
    }

    //subclass must re-implement these methods.
    getData() {
      console.error("getData (): Not re-implemented.");
    }

    //subclass may re-implement
    setData(data, filename, ext, editorName) {
      //console.error("setData (): Not re-implemented.");
    }
  }

  class ChooseEditor {
    constructor() {
      const self = this;

      let initialized = false;

      function addToChooseEditorModal(editorName, checked = false) {
        const valueName = editorName.replaceAll(" ", "-");
        if (checked) {
          $("#chooseEditorTable").append(
            $(
              '<label><input type="radio" name="ChooseEditor" value=' +
                valueName +
                " checked>" +
                editorName +
                "</label><br>"
            )
          );
        } else {
          $("#chooseEditorTable").append(
            $(
              '<label><input type="radio" name="ChooseEditor" value=' +
                valueName +
                ">" +
                editorName +
                "</label><br>"
            )
          );
        }
      }

      function init(editors) {
        for (let i = 0; i < editors.length; ++i) {
          addToChooseEditorModal(
            editors[i].editor.getEditorData().name,
            i == 0 ? true : false
          );
        }
        initialized = true;
      }

      this.doChooseEditorByExt = function (editors, ext) {
        return new Promise((resolve, reject) => {
          function handler() {
            var radioValue = $("input[name='ChooseEditor']:checked").val();
            if (radioValue) {
              radioValue = radioValue.replaceAll("-", " ");
              for (let i = 0; i < editors.length; ++i) {
                if (editors[i].name === radioValue) {
                  if ($("#alwaysUse")[0].checked) {
                    choiceStore[ext] = editors[i].name;
                  }
                  $("#chooseEditorOk").off("click", handler);
                  $("#chooseEditorModal").modal("hide");

                  return resolve(editors[i].editor);
                }
              }
            }
            $("#chooseEditorOk").off("click", handler);
            $("#chooseEditorModal").modal("hide");

            return reject(null);
          }

          $("#chooseEditorOk").on("click", handler);

          $("#alwaysUseLabel").html(`Always use this app to open ${ext} files`);
          $("#chooseEditorModal").modal("show");
        });
      };

      this.chooseEditorByExt = async (editors, ext) => {
        if (!initialized) {
          init(editors);
        }

        try {
          return await self.doChooseEditorByExt(editors, ext);
        } catch (err) {
          return err;
        }
      };

      this.getEditorStoredChoice = function (ext) {
        return getEditorByName(choiceStore[ext]) || null;
      };

      this.getEditorByExt = function (editors, ext) {
        return new Promise(async (resolve, reject) => {
          const storedEditor = getEditorByName(choiceStore[ext]) || null;
          if (storedEditor) {
            return resolve(storedEditor);
          }
          if (!initialized) {
            init(editors);
          }

          let availableEditors = [];
          for (let i = 0; i < editors.length; ++i) {
            const editor = editors[i].editor;
            const exts = editor.getExtensions();
            for (let n = 0; n < exts.length; ++n) {
              if (exts[n] == ext) {
                availableEditors.push(editor);
              }
            }
          }
          if (availableEditors.length == 0) {
            return resolve(null);
          }
          if (availableEditors.length == 1) {
            return resolve(availableEditors[0]);
          }

          try {
            const edt = await self.doChooseEditorByExt(editors, ext);
            resolve(edt);
          } catch (err) {
            reject(err);
          }
        });
      };
    }
  }

  class Properties {
    #fs = null;
    #selectedName;
    #shortName;
    #sep;
    #folderName;
    #extWithDot = "";
    #editorMenu = [];

    constructor(fs, parent) {
      const self = this;
      this.#fs = fs;
      //<div class="col-sm-3"><button id="opensWithChange">Change</button></div>
      parent.append(
        $(
          '<div id="propertiesModal" class="modal fade" role="dialog" data-backdrop="static" data-keyboard="false" > <div class="modal-dialog"> <!-- Modal content--> <div class="modal-content"> <div class="modal-header"> <button id="propertiesCancelX" type="button" class="close"> &times; </button><img id="propertiesTitleImage" src=' +
            fileImage +
            ' /><h4 id="propertiesTitle" class="modal-title"> Properties</h4> </div> <div class="modal-body"> <div class="row"> <div class="col-sm-3"> <span>Name:</span> </div> <div class="col-sm-9"> <input id="propertiesName" type="text" style="width:100%" /> </div><div class="col-sm-3"> <span>Type:</span> </div> <div class="col-sm-9"> <span id="propertiesType">/</span> </div> <div class="col-sm-3 fileField"> <span>Opens with:</span> </div> <div class="col-sm-4 fileField"> <span id="propertiesOpensWith"></span> </div> <div class="col-sm-4 fileField"><button id="opensWithChange">Change</button></div><div class="col-sm-3"> <span>Location:</span> </div> <div class="col-sm-9"> <span id="propertiesLocation">/</span> </div> <div class="col-sm-3"> <span>Size:</span> </div> <div class="col-sm-9"> <span id="propertiesSize">N/A</span> </div><div class="col-sm-3"> <span>Size in DB:</span> </div> <div class="col-sm-9"> <span id="propertiesSizeDb">N/A</span> </div> <div class="col-sm-3 folderField"> <span>Contains:</span> </div> <div class="col-sm-9 folderField"> <span id="propertiesContains">N/A</span> </div><div class="col-sm-3"> <span>Created:</span> </div> <div class="col-sm-9"> <span id="propertiesCreated">N/A</span> </div> <div class="col-sm-3 fileField"> <span>Modified:</span> </div> <div class="col-sm-9 fileField"> <span id="propertiesModified">N/A</span> </div> <div class="col-sm-3 fileField"> <span>Accessed:</span> </div> <div class="col-sm-9 fileField"> <span id="propertiesAccessed">N/A</span> </div> <div class="col-sm-3"> <span>Attributes:</span> </div> <div class="col-sm-4"> <span ><label for="propertiesReadOnly">Read-only</label> <input id="propertiesReadOnly" type="checkbox" /></span> </div> <div class="col-sm-4"> <span ><label for="propertiesHidden">Hidden</label> <input id="propertiesHidden" type="checkbox" /></span> </div> </div> <br /> <div class="row"> <div class="col-sm-6"> <input type="button" id="propertiesCancel" class="btn btn-primary" value="Cancel" style="width: 100%" ; /> </div> <div class="col-sm-6"> <input type="button" id="propertiesOk" class="btn btn-primary" value="Ok" style="width: 100%" ; /> </div> </div> </div> </div> </div> </div>'
        )
      );

      $("#propertiesCancel, #propertiesCancelX").click(function () {
        $("#propertiesModal").modal("hide");
      });

      $("#propertiesOk").on("click", async () => {
        try {
          const readOnly = $("#propertiesReadOnly")[0].checked;
          const result = await fs.setReadOnly(this.#selectedName, readOnly);
          //console.log(result);
        } catch (error) {
          console.log(error);
        }
        try {
          const hidden = $("#propertiesHidden")[0].checked;
          const result = await fs.setHidden(this.#selectedName, hidden);

          $(window).trigger("reinitialize");
          //console.log(result);
        } catch (error) {
          console.log(error);
        }

        const name = $("#propertiesName").val();
        let newName = null;
        if (this.#shortName !== name) {
          newName = `${this.#folderName}${this.#sep}${name}${this.#extWithDot}`;
          const originalPath = this.#selectedName;
          // console.log(originalPath);
          // console.log(newName);

          /* Handle case when file is open in some editor  */
          if (currentFilename === originalPath) {
            alert(
              `The file "${originalPath}" is open in the ${
                currentEditor.getEditorData().name
              } editor. Hence, the filename change is ignored. Close the editor and retry.`
            );
          }

          if (currentFilename !== originalPath) {
            let m_data = { name: originalPath, newName };
            axios({
              method: "post",
              url: fsServerUrl + "/rename",
              headers: {
                Authorization: "Bearer " + inMemoryToken,
              },
              data: m_data,
            })
              .then((result) => {
                //console.log(456, result);
                $(window).trigger("reinitialize");
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
        $("#propertiesModal").modal("hide");
      });
    }

    #bytesToString(sz) {
      if (sz < 1024) return `${sz} bytes`;
      const kb = Math.round(sz / 1024);
      return `${kb} KB (${sz.toLocaleString("en-US")} bytes)`;
    }

    #buildOpenWithDropdownMenu() {
      const self = this;
      editors.forEach(({ editor }) => {
        //console.log(editor);
        const name = editor.getEditorData().name;
        const menuItem = {
          name,
          title: `Open files of this type with ${name}.`,
          fun: () => {
            choiceStore[self.#extWithDot] = name;
            $("#propertiesOpensWith").html(name);
          },
        };
        self.#editorMenu.push(menuItem);
      });
      $("#opensWithChange").contextMenu(
        self.#editorMenu /* { zIndex: 2000 } */
      );
    }

    async showPropertiesDlg() {
      if (this.#editorMenu.length == 0) this.#buildOpenWithDropdownMenu();

      function reformatTime(tm) {
        const arr = tm.split(" ");
        return `${arr[1]} ${arr[2]}, ${arr[3]}, ${arr[4]}`;
      }

      $("#propertiesModal").modal("show");
      //is folder
      let m_folder = false;
      if (selectedName[0] === "f") {
        $(".fileField").show();
        $(".folderField").hide();
        $("#propertiesTitleImage")[0].src = fileImage;
      } else {
        m_folder = true;
        $("#propertiesTitleImage")[0].src = folderImage;
        $(".fileField").hide();
        $(".folderField").show();
      }

      // if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
      this.#sep = seperator;
      this.#selectedName = selectedName.replace("f", "");
      let arr = this.#selectedName.split(".");
      let ext = null;
      if (arr[arr.length - 1].length == 3) {
        ext = arr[arr.length - 1];
      }
      if (ext) this.#extWithDot = `.${ext}`;
      else this.#extWithDot = "";
      arr = this.#selectedName.split(this.#sep);
      const name = arr[arr.length - 1].replace("." + ext, "");
      this.#shortName = name;
      let folder = this.#selectedName.replace("." + ext, "").replace(name, "");
      if (folder[folder.length - 1] == this.#sep) {
        folder = folder.replace(/.$/, "");
      }
      this.#folderName = folder;

      $("#propertiesTitle").html(`${name} Properties`);

      if (m_folder) $("#propertiesType").html("File folder");
      else $("#propertiesType").html("." + ext);
      $("#propertiesLocation").html(folder);
      $("#propertiesName").val(name);

      const opensWith =
        choiceStore[`.${ext}`] || defaultEditor.getEditorData().name;
      $("#propertiesOpensWith").html(opensWith);

      try {
        const result = await this.#fs.getReadOnly(this.#selectedName);

        $("#propertiesReadOnly")[0].checked = result.readOnly;
        //console.log(result);
      } catch (error) {
        console.log(error);
      }

      try {
        const result = await this.#fs.getHidden(this.#selectedName);

        $("#propertiesHidden")[0].checked = result.hidden;
        //console.log(result);
      } catch (error) {
        console.log(error);
      }

      try {
        const result = await this.#fs.contents(this.#selectedName);
        //console.log(result);

        if (result?.msg === "Node is not a folder") {
          $("#propertiesContains").html("N/A");
        } else {
          const { numberOfFiles, numberOfFolders, birthtime } = result;
          //console.log(numberOfFiles, numberOfFolders);
          $("#propertiesCreated").html(reformatTime(birthtime));
          $("#propertiesContains").html(
            `${numberOfFiles} Files, ${numberOfFolders} Folders`
          );
          $("#propertiesSize").html(this.#bytesToString(result.size));
          $("#propertiesSizeDb").html(this.#bytesToString(result.sizeDb));
        }
        //console.log(result);
      } catch (error) {
        console.log(error);
      }

      if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
        try {
          const stats = await this.#fs.getStats(this.#selectedName);
          //console.log(stats);
          $("#propertiesCreated").html(reformatTime(stats.birthtime));
          $("#propertiesModified").html(reformatTime(stats.mtime));
          $("#propertiesAccessed").html(reformatTime(stats.atime));
          const sz = stats.size || 0;
          $("#propertiesSize").html(this.#bytesToString(sz));
          $("#propertiesSizeDb").html(this.#bytesToString(sz));
          if (stats.chunkSize) {
            $("#propertiesSizeDb").html(
              this.#bytesToString(stats.chunks * stats.chunkSize)
            );
          }
        } catch (error) {
          $("#propertiesModal").modal("hide");
          alert(
            `An error occur in fetching the stats for "${
              this.#selectedName
            }" from the database.`
          );
        }
      }
    }
  }

  ///////////////////////////////////////////////////////////////

  /* 
isFile: 
displayName: 
parentPath: 
parentId: 
path: 
id: 
ext: 
sep: 
*/

  /**
   * A class representing a filesystem.
   *
   * The interval is represented by 2 numbers, the lower and the upper limit.
   *
   */

  class FileSystemServices {
    /**
     *
     * @param {object} _options aaaaa
     */

    #options;

    #sameDomain;
    #timer = null;
    #simpleRegisterDialog;
    #simpleLoginDialog;
    #registerLoginDialog;
    #configData = null;
    #name = "root";

    #mongoFsLoginLogoutRegisterMenu2;
    //#currentFilename = null;
    #nodes = null;
    #initialized = false;
    #prevRoot;
    #currentRowSelector = null;
    #parentName = "";
    #filesTableRowSelected = false;
    //Default image sources

    #imageFolderSrc = "https://unpkg.com/mongo-db-filesystem-ui/img/folder.png";
    #imageFileSrc = "https://unpkg.com/mongo-db-filesystem-ui/img/file.png";

    constructor(_options) {
      const self = this;

      fileImage = this.#imageFileSrc;
      folderImage = this.#imageFolderSrc;

      //let inMemoryToken = null;
      self.#options = _options || {};
      self.#options.accessTokenExpiry = self.#options.accessTokenExpiry || 900; //initialize with 900 secs if undefined

      this.#simpleLoginDialog = self.#options.simpleLoginDialog;
      if (this.#simpleLoginDialog == undefined) {
        this.#simpleLoginDialog = false;
        //console.log(this.#simpleLoginDialog);
      }

      self.#simpleRegisterDialog = self.#options.simpleRegisterDialog;
      if (self.#simpleRegisterDialog == undefined) {
        self.#simpleRegisterDialog = false;
        //console.log(self.#simpleRegisterDialog);
      }

      self.#registerLoginDialog = self.#options.registerLoginDialog;
      if (self.#registerLoginDialog == undefined) {
        self.#registerLoginDialog = true;
        //console.log(self.#registerLoginDialog);
      }

      const listOfFileTypes = self.#options.listOfFileTypes || [];
      let listOfOpenWithTypes = self.#options.listOfOpenWithTypes || [];
      if (self.#options.enableNotepad)
        listOfOpenWithTypes = [
          {
            img: imgFolder + "notepad.png",
            name: "Text Editor",
            options: { encoding: "utf8", flag: "r" },
          },
          ...listOfOpenWithTypes,
        ];

      if (self.#options.imageFolderSrc !== undefined) {
        if (self.#options.imageFolderSrc.length) {
          self.#imageFolderSrc = self.#options.imageFolderSrc;
        } else {
          self.#imageFolderSrc = null;
        }
      }

      if (self.#options.imageFileSrc !== undefined) {
        if (self.#options.imageFileSrc.length) {
          self.#imageFileSrc = self.#options.imageFileSrc;
        } else {
          self.#imageFileSrc = null;
        }
      }

      fsServerUrl = self.#options.fsServerUrl;
      fsServerUrl = fsServerUrl || "";
      if (window.location.href.indexOf(fsServerUrl) !== -1) fsServerUrl = "";

      //If the backend url (i.e. options.fsServerUrl) is a empty string, we have same domain
      self.#sameDomain = fsServerUrl.length > 0 ? false : true;

      //console.log(self.#sameDomain);

      idleTime =
        self.#options.idleTime === undefined ? -1 : self.#options.idleTime; //milliseconds

      const chooseEditor = new ChooseEditor();
      //const properties = new Properties(self, saveDlg);

      // this.registerEditor = function (editor) {
      //   editors.push(editor);
      // };

      /* function getEditorByName(editorName) {
      const element = editors.find((element) => element.name === editorName);
      if (element !== undefined) {
        return element.editor;
      }
      return null;
    } */

      function getEditorByExt(ext) {
        for (let i = 0; i < editors.length; ++i) {
          const editor = editors[i].editor;
          const exts = editor.getExtensions();
          for (let n = 0; n < exts.length; ++n) {
            if (exts[n] == ext) {
              return editor;
            }
          }
        }
        return null;
      }

      mongoFsLoginLogoutRegisterMenu = [
        {
          name: "Register",
          title: "Register for Mongo File System",
          fun: doRegister,
        },
        {
          name: "Login",
          title: "Login to Mongo File System",
          fun: doLogin,
        },
      ];

      /**
       * Launches the explorer modal dialog
       * @returns
       */
      /* this.explorerDlg = async function () {
        if (await self.init()) {
          if (!inMemoryToken) return alert("Not connected...");
          $("#dlgTitle").html("File Explorer");
          $("#inputFields").hide();
          //$("#dlgCancelButton").hide();
          $("#dlgSaveButton").hide();
          $("#explorerSaveAsModal").modal();
          $("#saveAsType").val(".all");
        }
      }; */

      // function doNotepadDlg() {
      //   if (notepad) notepad.openEditor();
      // }

      $("body").keydown(function (e) {
        if (e.ctrlKey && (e.key === "O" || e.key === "o")) {
          e.preventDefault();
          self.#explorerDlg();
        }
      });

      if (!self.#registerLoginDialog)
        this.#mongoFsLoginLogoutRegisterMenu2 = [
          {
            name: "Explorer",
            title: "Launch the Mongo File System explorer.",
            fun: () => {
              self.#explorerDlg();
            },
          },
        ];
      else
        this.#mongoFsLoginLogoutRegisterMenu2 = [
          {
            name: "Logout",
            title: "Logout for Mongo File System",
            fun: () => {
              if (currentEditor && currentEditor.currentFileModified()) {
                if (!confirm(`Changes you made may not be saved.`)) return;
                else currentEditor.currentFilename("Untitled");
              }
              self.logout();
            },
          },
          {
            name: "Explorer",
            title: "Launch the Mongo File System explorer.",
            fun: () => {
              self.#explorerDlg();
            },
          },
        ];

      const resetPassWordDlg = $(
        '<div class="modal fade" role="dialog"> <div class="modal-dialog"> <!-- Modal content--> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">&times;</button> <h4 style="color:rgb(51, 122, 183);" class="modal-title">Password reset</h4> </div> <div class="modal-body"> <form class="mongo-db-filesystem-ui-resetPasswordForm"> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="username" class="no-outline" type="text" style="width: 97%; border-style: none;" placeholder="Enter Username" required></div> <br> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="password" class="no-outline" type="password" style="width: 97%; border-style: none;" placeholder="New Password" required></div> <br> <div id="dlg-repeat-row"> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="repeat_password" class="no-outline" type="password" style="width: 97%; border-style: none;" placeholder="Repeat Password" required></div> </div><br><input type="submit" style="width:100%" class="btn btn-primary" value="Reset password" /> </form> </div> </div> </div> </div>'
      );

      $("body").append(resetPassWordDlg);

      let loginDlg = null;
      function loginDlgSelector() {
        if (!loginDlg) {
          loginDlg = $(
            `<div class="modal fade mongo-db-filesystem-ui-loginModal" role="dialog"> <div class="modal-dialog">${self.loginModalDlg()}</div></div>`
          );
          $("body").append(loginDlg);
        }
        return loginDlg;
      }

      let registerDlg = null;
      function registerDlgSelector() {
        if (!registerDlg) {
          //registerDlg = $(self.registerModalDlg());

          registerDlg = $(
            `<div class="modal fade mongo-db-filesystem-ui-registerModal" role="dialog"> <div class="modal-dialog"> ${self.registerModalDlg()}</div></div>`
          );
          $("body").append(registerDlg);
        }
        return registerDlg;
      }

      loginDlgSelector().on("shown.bs.modal", function () {
        $(".mongo-db-filesystem-ui-loginModal form :submit").trigger("focus");
      });

      registerDlgSelector().on("shown.bs.modal", function () {
        $(".mongo-db-filesystem-ui-registerModal form :submit").trigger(
          "focus"
        );
      });

      var saveDlg = $(
        '<div id="explorerSaveAsModal" class="modal fade" role="dialog" data-backdrop="static" data-keyboard="false"> <div class="modal-dialog"> <!-- Modal content--> <div id="dlg-saveDlg" class="modal-content"> <div class="modal-header"><button id="saveDlgCancelX" type="button" class="close">&times;</button><h4 id="dlgTitle" class="modal-title">Save As</h4> </div> <div class="modal-body"><br> <div class="container"></div> <div class="row"> <div class="col-sm-1"></div> <div class="col-sm-12"> <div class="row"> <div class="col-sm-1"> <label for="parent1">Folder</label> </div> <div class="col-sm-7"> <input type="text" class="form-control inputClass" id="parent1" readonly> </div> <div class="col-sm-2"> <input type="button" class="form-control inputClass" id="configButton" value="Config"> </div><div class="col-sm-2"> <input type="button" class="form-control inputClass" id="unHideButton" value="Unhide"> </div> </div> <br> <div class="row"> <div class="col-sm-5"> <div style="overflow: scroll; height: 200px; border: solid; border-width: 1px;"> <table style="border-width: 0px; white-space: nowrap;" id="foldersTable"> <tbody></tbody> </table> </div> </div> <div id="menuElement" style="position: relative;" class="col-sm-7"> <div style="overflow: scroll; height: 200px; border: solid; border-width: 1px;"> <table style="border-width: 0px; white-space: nowrap;" id="filesTable"> <tbody></tbody> </table> </div> </div> </div><br> <div id="inputFields"> <div class="row"> <div class="col-sm-3"> <label for="name">File name</label> </div> <div class="col-sm-9"> <input type="text" class="form-control inputClass" id="name" name="name" value="new"> </div> </div> <br> <div class="row"> <div class="col-sm-3"> <label for="saveAsType">Save as type</label> </div> <div class="col-sm-9"> <select class="form-control inputClass" id="saveAsType"></select> </div> </div> </div> <br><button id="dlgCancelButton" style="width: 20%" class="btn btn-primary pull-right">Cancel</button> <button id="dlgSaveButton" style="width: 79%" class="btn btn-primary">Save</button> </div> <div class="col-sm-1"></div> </div> </div> </div> </div> </div>'
      );
      $("body").append(saveDlg);

      const properties = new Properties(self, saveDlg);

      var configDlg = $(
        '<div id="configModal" class="modal fade" role="dialog" data-backdrop="static" data-keyboard="false"> <div class="modal-dialog"> <!-- Modal content--> <div class="modal-content"> <div class="modal-header"><button id="configDlgCancelX" type="button" class="close">&times;</button><h4 id="dlg-title" style="text-align: center;" class="modal-title">Configuration</h4> </div> <div class="modal-body"><br> <div class="container"></div> <div class="row"> <div class="col-sm-1"></div> <div class="col-sm-10"> <div class="row"> <table class="config-table" style="width: 100%;"> <tr class="config-table"> <th class="config-table">Propery</th> <th class="config-table">Value</th> </tr> <tr class="config-table"> <td class="config-table">Root directory name</td> <td class="config-table"><input id="rootDir" type="text" style="width: 100%;" value="root:" /></td> </tr> <tr class="config-table"> <td class="config-table">Separator</td> <td class="config-table"><input id="sep" type="text" style="width: 100%;" value="" /></td> </tr> <tr class="config-table"> <td class="config-table">Dialog background color</td> <td class="config-table"><input id="dialog-background-color" type="color" value="#ffffff" /></td> </tr> <tr class="config-table"> <td class="config-table">Input background color</td> <td class="config-table"><input id="input-background-color" type="color" value="#ffffff" /></td> </tr> <tr class="config-table"> <td class="config-table">Store new files with GridFs</td> <td class="config-table"><input id="gridfs-storage" type="checkbox" checked /></td> </tr> </table> </div> <br> <div class="row"> <div class="col-sm-4"><input type="button" id="config-cancel-button" class="btn btn-primary" value="Cancel" style="width: 100%" ; /></div> <div class="col-sm-4"><input type="button" id="config-restore-button" class="btn btn-primary" value="Restore Defaults" style="width: 100%" ; /></div> <div class="col-sm-4"><input type="button" id="config-ok-button" class="btn btn-primary" value="Ok" style="width: 100%" ; /></div> </div> </div> </div> </div> </div> </div> </div>'
      );
      /* $("body") */ saveDlg.append(configDlg);

      $("#configModal").on("shown.bs.modal", function () {
        $("#config-ok-button").trigger("focus");
      });

      saveDlg.append(
        $(
          '<div id="chooseEditorModal" class="modal fade" role="dialog" data-backdrop="static" data-keyboard="false"> <div class="modal-dialog"> <!-- Modal content--> <div class="modal-content"> <div class="modal-header"><button id="chooseEditorCancelX" type="button" class="close">&times;</button> <h4 id="dlg-title" style="text-align: center;" class="modal-title">How would you like to open this file?</h4> </div> <div class="modal-body"><br> <div class="container"></div> <div class="row"> <div class="col-sm-1"></div> <div class="col-sm-10"> <div class="row"> <form id="chooseEditorTable" style="width: 100%;"> </form> </div> <br> <div class="row"> <label><input id="alwaysUse" type="checkbox"><span id="alwaysUseLabel"></span></label> </div> <br> <div class="row"> <div class="col-sm-6"><input type="button" id="chooseEditorCancel" class="btn btn-primary" value="Cancel" style="width: 100%" ; /></div> <div class="col-sm-6"><input type="button" id="chooseEditorOk" class="btn btn-primary" value="Ok" style="width: 100%" ; /></div> </div> </div> </div> </div> </div> </div> </div>'
        )
      );

      $("#chooseEditorCancel, #chooseEditorCancelX").click(function () {
        $("#chooseEditorModal").modal("hide");
      });

      $("#config-restore-button").click(() => {
        self.#configData.dialogBackgroundColor = "#ffffff";
        self.#configData.inputBackgroundColor = "#ffffff";
        self.#configData.rootDir = "root:";
        self.#configData.sep = "\\";
        self.#configData.gridFsStorage = true;
        $("#rootDir").val(self.#configData.rootDir);
        $("#sep").val(self.#configData.sep);
        $("#dialog-background-color").val(
          self.#configData.dialogBackgroundColor
        );
        $("#input-background-color").val(self.#configData.inputBackgroundColor);
        //console.log(123, $("#gridfs-storage").prop("checked"))
        $("#gridfs-storage").prop("checked", self.#configData.gridFsStorage);
        //console.log(124, $("#gridfs-storage").prop("checked"))
      });

      var prevW = parseInt(saveDlg.css("width"));
      var prevH = parseInt(saveDlg.css("height"));

      //const m_fsServerUrl = fsServerUrl;
      //var name = "root";
      //var parentName = "";
      //var currentRowSelector = null;
      //var currentSelectedRowSelector = null;
      //var nodes = null;
      //var filesTableRowSelected = false;
      var filesTableFileSelected = false;
      //var selectedName = null;
      var editing = false;
      var rigthClickOnSelectedRow = false;

      var fileExtensions = [];

      $("body").on("contextmenu", function (e) {
        e.preventDefault();
      });

      $("#dlgCancelButton, #saveDlgCancelX").click(function () {
        $("#explorerSaveAsModal").attr("editorName", null);
        saveDlg.modal("hide");
      });

      String.prototype.spliceStr = function (idx, rem, str) {
        return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
      };

      //let timer = null;

      //Renames a file or folder
      function renameNode(/* _data */) {
        const currentName = currentSelectedRowSelector.attr(
          "data-tt-displayName"
        );
        var _data = {};
        if (currentSelectedRowSelector.attr("data-tt-file") === "file") {
          _data.name = currentSelectedRowSelector.attr("data-tt-path");
        } else {
          _data.name = currentSelectedRowSelector.attr("data-tt-id");
        }
        var input = $('<input type="text"/>');
        input.val(currentName); //init text input
        var td = $(currentSelectedRowSelector.children()[0]);
        var innerTdHtml = td.html();
        var indexOfDisplayName = innerTdHtml.length - currentName.length;
        const n = innerTdHtml.indexOf(currentName);
        td.html(
          innerTdHtml.spliceStr(indexOfDisplayName, currentName.length, "")
        );
        td.append(input);
        input[0].focus();
        currentSelectedRowSelector.toggleClass("selected");
        editing = true;
        input.on("keyup", function (e) {
          if (e.key === "Enter" || e.keyCode === 13) {
            input.remove();
            editing = false;
            td.html(
              innerTdHtml.spliceStr(
                indexOfDisplayName,
                $(this).val().length,
                $(this).val()
              )
            );
          }
        });
        var changed = false;
        input.focusout(async function () {
          if (!changed) {
            input.trigger("change");
          }
        });
        var m = 1;
        input.change(async function () {
          //console.log(_data.name, _data.newName)
          if (_data.name == _data.newName) {
            input.remove();
            editing = false;
            td.html(
              innerTdHtml.spliceStr(
                indexOfDisplayName,
                currentName.length,
                currentName
              )
            );
            return;
          } else {
            changed = true;
            //See if the file exists
            var g_data = {};
            var _parent = currentSelectedRowSelector.attr("data-tt-parent-id");
            g_data.name = _parent;
            g_data.name += self.#configData.sep;

            g_data.name += $(this).val();
            if (currentSelectedRowSelector.attr("data-tt-ext")) {
              g_data.name +=
                "." + currentSelectedRowSelector.attr("data-tt-ext");
            }

            try {
              axios({
                method: "post",
                headers: {
                  Authorization: "Bearer " + inMemoryToken,
                },
                url: fsServerUrl + "/access",
                data: g_data,
              })
                .then(function (res) {
                  (async function () {
                    var parts = input.val().split("(");
                    var modifiedName = parts[0] + "(" + m + ")";
                    var ans = confirm(
                      `The file "${input.val()}" already exist. Would you like to rename it to ${modifiedName}`
                    );
                    if (ans) {
                      input.val(modifiedName);
                      m++;
                    } else {
                      _data.newName = _data.name;
                      editing = false;
                    }
                    changed = false;
                    input[0].focus();
                  })();
                })
                .catch(function (res) {
                  _data.newName = g_data.name;
                  //console.log(488, _data)
                  axios({
                    method: "post",
                    headers: {
                      Authorization: "Bearer " + inMemoryToken,
                    },
                    url: fsServerUrl + "/rename",
                    data: _data,
                  })
                    .then(function (data) {
                      (async function () {
                        input.remove();
                        editing = false;
                        changed = false;
                        selectedName = _data.newName;
                        try {
                          await self.#doInit(_parent);
                        } catch (err) {
                          console.log("self.#doInit failed 12");
                          alert(`Initialisation failed. Please retry.`);
                        }
                      })();
                    })
                    .catch(function (returnval) {
                      input[0].focus();
                      input.trigger("change");
                    });
                });
            } catch (err) {
              console.log(50, err);
            }
          }
        });
      }

      function doDelete() {
        var message = "";
        if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
          message = `Do you want to permanently remove the file "${currentSelectedRowSelector.attr(
            "data-tt-path"
          )}"?`;
        } else {
          message = `Do you want to permanently remove the folder "${selectedName}"?`;
        }
        if (!confirm(message)) {
          return;
        }
        var node = $("#filesTable").treetable(
          "node",
          currentSelectedRowSelector.attr("id")
        );
        var _parent = currentSelectedRowSelector.attr("data-tt-parent-id");
        var endPoint = "removeFolder";
        var m_selectedName = selectedName;
        if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
          endPoint = "removeFile";
          m_selectedName = m_selectedName.replace("f", "");
          if (currentFilename === m_selectedName) {
            alert(
              `The file "${currentFilename}" is opened. Close it before deleting it.`
            );
            return;
          }
        }
        var _data = { name: m_selectedName };
        axios({
          method: "delete",
          url: fsServerUrl + "/" + endPoint,
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          data: _data,
        })
          .then(function () {
            (async function () {
              try {
                await self.#doInit(_parent);
                //Selected file/folder removed. Invalidate variable.
                selectedName = null;
              } catch {
                console.log("self.#doInit failed 1");
                alert(`Initialisation failed. Please retry.`);
              }
            })();
          })
          .catch(function (returnval) {
            console.log(returnval.responseJSON);
            alert(`Failed to delete "${m_selectedName}". Please retry.`);
            currentSelectedRowSelector.toggleClass("selected");
          });
      }

      function addFile() {
        //console.log(225)
        var _parent = $("#parent1").val();
        var _data = {
          id: "inputRowId",
          isFile: true,
          displayName: "",
          parentId: _parent,
          parentPath: _parent,
        };
        var node = null;
        if (currentSelectedRowSelector) {
          node = $("#filesTable").treetable(
            "node",
            currentSelectedRowSelector.attr("id")
          );
        }
        var input = $('<input type="text"/>');
        input.val($("#name").val()); //init text input
        var inputRow = self.#makeRow(_data);
        $("#filesTable").treetable("loadBranch", node, inputRow);
        editing = true;
        var td = $(inputRow.children()[0]);
        td.append(input);
        input[0].focus();
        var _ext = $("#saveAsType").val();
        //_data.parent = _parent; //parent name
        var error = false;

        var changed = false;
        input.focusout(async function () {
          if (!changed) {
            //changed = false;
            input.trigger("change");
          }
        });
        var n = 1;
        input.change(async function () {
          //console.log(444);
          changed = true;
          if ($(this).val().trim() == "") {
            try {
              $("#filesTable").treetable("removeNode", inputRow.attr("id"));
            } catch (err) {
              //console.log({"removeNode Error": err})
            }
          } else {
            var m_data = {};
            m_data.name = _parent + self.#configData.sep + $(this).val();
            if (_ext !== ".all") {
              var ext = getFileExtension($(this).val());
              if (!ext || _ext !== ext) {
                m_data.name += _ext;
              }
            }
            //See if the file exists
            try {
              axios({
                method: "post",
                url: fsServerUrl + "/access",
                headers: {
                  Authorization: "Bearer " + inMemoryToken,
                },
                data: m_data,
              })
                .then(function (res) {
                  (async function () {
                    var parts = input.val().split("(");
                    var modifiedName = parts[0] + "(" + n + ")";
                    var ans = confirm(
                      `The file "${input.val()}" already exist. Would you like to rename it to ${modifiedName}`
                    );
                    if (ans) {
                      input.val(modifiedName);
                      n++;
                    } else {
                      input.val("");
                      editing = false;
                    }
                    changed = false;
                    input[0].focus();
                  })();
                })
                .catch((err) => console.log(err));
            } catch (err) {
              console.log(50, err);
            }
            axios({
              method: "post",
              url: fsServerUrl + "/createFile",
              headers: {
                Authorization: "Bearer " + inMemoryToken,
              },
              data: m_data,
            })
              .then(function (data) {
                (async function () {
                  try {
                    await self.#doInit(_parent);
                    editing = false;
                  } catch {
                    console.log("self.#doInit failed 2");
                    alert(`Initialisation failed. Please retry.`);
                  }
                })();
              })
              .catch(function (returnval) {
                var parts = input.val().split("(");
                var modifiedName = parts[0] + "(" + n + ")";
                var ans = confirm(
                  `The file "${input.val()}" already exist. Would you like to rename it to ${modifiedName}`
                );
                if (ans) {
                  input.val(modifiedName);
                  n++;
                } else {
                  input.val("");
                  editing = false;
                }
                changed = false;
                input[0].focus();
              });
          }
        });
      }

      var addingFolder = false;

      function addFolder(_data) {
        var _parent = $("#parent1").val();
        var _data = {
          id: "inputRowId",
          isFile: false,
          displayName: "",
          parentId: _parent,
          parentPath: _parent,
        };
        addingFolder = true;
        var node = null;
        if (currentSelectedRowSelector) {
          node = $("#filesTable").treetable(
            "node",
            currentSelectedRowSelector.attr("id")
          );
        }
        var input = $('<input type="text"/>');
        var inputRow = self.#makeRow(_data);
        $("#filesTable").treetable("loadBranch", node, inputRow);
        var td = $(inputRow.children()[0]);
        td.append(input);
        input[0].focus();
        input.focusout(function () {
          addingFolder = false;
          var str = $(this).val().trim();
          if ($(this).val().trim() == "") {
            try {
              $("#filesTable").treetable("removeNode", inputRow.attr("id"));
            } catch {
              //console.log("removeNode fail");
            }
          }
        });
        input.change(function () {
          addingFolder = false;
          var m_data = {};
          m_data.name = _parent + self.#configData.sep + $(this).val();
          if ($(this).val().trim() !== "") {
            axios({
              method: "post",
              url: fsServerUrl + "/mkdir",
              headers: {
                Authorization: "Bearer " + inMemoryToken,
              },
              data: m_data,
            })
              .then(function (data) {
                (async function () {
                  try {
                    await self.#doInit(_parent);
                  } catch {
                    console.log("self.#doInit failed 3");
                    alert(`Initialisation failed. Please retry.`);
                  }
                })();
              })
              .catch(function (returnval) {
                //console.log(returnval.responseJSON);
                alert(returnval.responseJSON.msg);
                input[0].focus();
              });
          }
        });
      }

      let openFileWithSubmenu = [];

      openFileWithSubmenu.push({
        img: imgFolder + "choose.png",
        name: "Choose...",
        title: `Launches the choose dialog`,
        fun: async function () {
          const filename = selectedName.replace("f", "");
          let ext = selectedName.slice(selectedName.length - 4);
          if (ext.charAt(0) !== ".") {
            ext = ".all";
          }
          try {
            const editor = await chooseEditor.chooseEditorByExt(editors, ext);
            //console.log(456, editor)
            openFile(filename, { editorName: editor.getEditorData().name });
          } catch (err) {
            console.log(err);
          }
        },
      });

      var menuNotSelectedSubmenu = [
        {
          img: imgFolder + "newFolder.png",
          //pos: 0,
          name: "Folder",
          // img: 'images/brush.png',
          title: "Creates a new folder.",
          fun: function () {
            //console.log("Create a new folder.");
            if (addingFolder) return;
            if (
              currentSelectedRowSelector &&
              currentSelectedRowSelector.attr("data-tt-file") == "file"
            )
              return;
            //var _data = { "parent": name, "isFile": false, "name": "" };
            addFolder();
          },
        },
        {
          img: imgFolder + "newFile.png",
          //pos: 4,
          //disable: true,
          name: "Text Document",
          //img: 'images/scissors.png',
          title: "Creates a new text document.",
          fun: function () {
            $("#name").val("New Text Document");
            $("#saveAsType").val(".txt");
            self.#updateFilesTable();
            if (
              currentSelectedRowSelector &&
              currentSelectedRowSelector.attr("data-tt-file") == "file"
            )
              return;
            addFile();
          },
        },
      ];

      //build the sub-menu for 'new'
      listOfFileTypes.forEach((item) => {
        var menuItem = {
          name: item.defaultFilename,
          title: `Creates a new ${item.defaultFilename}.`,
          fun: function () {
            $("#name").val(`New ${item.defaultFilename}`);
            $("#saveAsType").val(item.ext);
            if (
              currentSelectedRowSelector &&
              currentSelectedRowSelector.attr("data-tt-file") == "file"
            )
              return;
            addFile();
          },
        };
        menuNotSelectedSubmenu.push(menuItem);
      });

      listOfOpenWithTypes.forEach((item) => {
        var menuItem = {
          img: item.img,
          name: item.name,
          title: `Opens with ${item.name}.`,
          fun: function () {
            openFileWith({ editorName: item.name, options: item.options });
          },
        };
        openFileWithSubmenu.push(menuItem);
      });

      var menuNotSelected = [
        {
          //disable: true,
          name: "New",
          title: "Creates a new folder or file",
          subMenu: menuNotSelectedSubmenu,
        },
      ];

      var openFileWithMenu = {
        img: imgFolder + "openWith.png",
        //disable: true,
        name: "Open with...",
        title: "Opens the current selection",
        subMenu: openFileWithSubmenu,
      };

      let nodeToCopy = null;
      let nodeCut = false;
      let nodeIsFolder = false;

      function copyNode() {
        nodeToCopy = selectedName;
        if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
          nodeToCopy = nodeToCopy.replace("f", "");
          nodeIsFolder = false;
        } else {
          nodeIsFolder = true;
        }
      }

      function cutNode() {
        nodeToCopy = selectedName;
        if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
          nodeToCopy = nodeToCopy.replace("f", "");
          nodeIsFolder = false;
        } else {
          nodeIsFolder = true;
        }
        nodeCut = true;
      }

      async function pasteNode(cb) {
        //console.log(cb);
        let dest;
        if (selectedName?.length && selectedName === nodeToCopy)
          dest = $("#parent1").val();
        else dest = selectedName || $("#parent1").val();
        const src = nodeToCopy;
        if (`f${src}` === dest) {
          dest = $("#rootDir").val();
        }

        const arr = nodeToCopy.split(self.#configData.sep);
        const name = dest + self.#configData.sep + arr[arr.length - 1];
        if (dest.indexOf(arr[arr.length - 1]) !== -1) {
          alert("The destination folder is a subfolder of the source folder.");
          return;
        }
        //console.log("name", name)
        let m_data = { src, dest };

        if (nodeIsFolder) {
          //console.log(src, dest, nodeCut);

          try {
            const result = await axios({
              method: "post",
              url: fsServerUrl + "/access",
              data: { name },
              headers: {
                Authorization: "Bearer " + inMemoryToken,
              },
            });
            if (
              confirm(
                `Folder with the name "${name}" already exist. Do you want to replace it?`
              )
            ) {
              try {
                const result = await axios({
                  method: "post",
                  url: fsServerUrl + "/copyFolder",
                  data: { src, dest, nodeCut },
                  headers: {
                    Authorization: "Bearer " + inMemoryToken,
                  },
                });
                console.log("result 2");
                cb && cb(dest);
              } catch (error) {
                console.log(error);
              }
            }
          } catch (error) {
            //console.log("result 2");
            try {
              const result = await axios({
                method: "post",
                url: fsServerUrl + "/copyFolder",
                data: { src, dest, nodeCut },
                headers: {
                  Authorization: "Bearer " + inMemoryToken,
                },
              });
              //console.log("result 3");
              cb && cb(dest);
            } catch (error) {
              console.log(error);
            }
          }

          return;
        }

        axios({
          method: "post",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/access",
          data: { name },
        })
          .then(function (res) {
            (async function () {
              if (
                confirm(
                  `File with the name "${name}" already exist. Do you want to replace it?`
                )
              ) {
                axios({
                  method: "post",
                  url: fsServerUrl + "/copyFile",
                  headers: {
                    Authorization: "Bearer " + inMemoryToken,
                  },
                  data: m_data,
                })
                  .then(function (cpyName) {
                    nodeToCopy = null;
                    cb && cb(src);
                  })
                  .catch(function (err) {
                    console.log(err.responseJSON);
                    cb && cb(null);
                  });
              }
            })();
          })
          .catch(function (res) {
            axios({
              method: "post",
              url: fsServerUrl + "/copyFile",
              headers: {
                Authorization: "Bearer " + inMemoryToken,
              },
              data: m_data,
            })
              .then(function (cpyName) {
                nodeToCopy = null;
                cb && cb(src);
              })
              .catch(function (err) {
                console.log(err.responseJSON);
                cb && cb(null);
              });
          });
      }

      var pasteMenu = {
        img: imgFolder + "paste.png",
        name: "Paste",
        title: "Paste the current selection",
        fun: function () {
          pasteNode(async (cpy) => {
            //console.log(cpy);
            if (nodeCut && !nodeIsFolder) {
              axios({
                method: "delete",
                url: fsServerUrl + "/removeFile",
                headers: {
                  Authorization: "Bearer " + inMemoryToken,
                },
                data: { name: cpy },
              })
                .then(function () {
                  (async function () {
                    try {
                      await self.#doInit($("#parent1").val());
                      nodeCut = false;
                    } catch {
                      console.log("self.#doInit failed 5");
                      alert(`Initialisation failed. Please retry.`);
                    }
                  })();
                })
                .catch(function (returnval) {
                  console.log(returnval.responseJSON);
                  alert(returnval.responseJSON);
                });
            } else {
              nodeIsFolder = false;
              nodeCut = false;
              try {
                await self.#doInit(cpy);
              } catch {
                console.log("self.#doInit failed 6");
              }
            }
          });
        },
      };

      var menuSelected = [
        {
          img: imgFolder + "open.png",
          //pos: 0,
          name: "Open",
          // img: 'images/brush.png',
          title: "Opens the current selection.",
          fun: function () {
            currentSelectedRowSelector.trigger("dblclick");
          },
        } /* ,

      openFileWithMenu */,
        {
          img: imgFolder + "rename.png",
          //pos: 0,
          name: "Rename",
          // img: 'images/brush.png',
          title: "Renames the current selection.",
          fun: function () {
            renameNode();
          },
        },
        {
          img: imgFolder + "cut.png",
          //pos: 0,
          name: "Cut",
          // img: 'images/brush.png',
          title: "Cuts the current selection.",
          fun: function () {
            cutNode();
          },
        },
        {
          img: imgFolder + "copy.png",
          //pos: 0,
          name: "Copy",
          // img: 'images/brush.png',
          title: "Copies the current selection.",
          fun: function () {
            copyNode();
          },
        },
        {
          img: imgFolder + "trash.png",
          //pos: 4,
          name: "Delete",
          //img: 'images/scissors.png',
          title: "Deletes current selection.",
          fun: function () {
            doDelete();
          },
        },
        {
          img: imgFolder + "properties.png",
          //pos: 4,
          name: "Properties",
          //img: 'images/scissors.png',
          title: "Show the properties dialog.",
          fun: function () {
            properties.showPropertiesDlg();
            //doDelete();
          },
        },
      ];

      var pointIn = false;

      $("#menuElement").on("mouseenter touchstart", () => {
        pointIn = true;
      });

      $("#menuElement").on("mouseleave", () => {
        pointIn = false;
      });

      let longtouch = false;

      let touchTimer = null;

      $("#explorerSaveAsModal").on("touchstart", function () {
        longtouch = false;
        clearTimeout(touchTimer);
        touchTimer = setTimeout(function () {
          longtouch = true;
        }, 500);
      });

      var menuActive = false;
      $("#explorerSaveAsModal").on("mousedown touchend", function (e) {
        //console.log(longtouch)
        if (
          (!longtouch && e.button != 2) ||
          !pointIn /* || !self.#filesTableRowSelected */
        ) {
          //not right button
          if (menuActive) {
            $("#explorerSaveAsModal").contextMenu("destroy");
            menuActive = false;
          }
          // pointIn = false;
          return;
        }
        pointIn = false;

        if (currentSelectedRowSelector && !rigthClickOnSelectedRow) {
          currentSelectedRowSelector.toggleClass("selected"); //deselect
          currentSelectedRowSelector = null;
          self.#filesTableRowSelected = false;
          filesTableFileSelected = false;
        }

        menuActive = true;
        if (currentSelectedRowSelector) {
          //console.log("File");
          if (currentSelectedRowSelector.attr("data-tt-file") == "file") {
            //file selected. Add openFileWithMenu
            if (
              openFileWithSubmenu.length > 0 &&
              menuSelected[1].name !== "Open with..."
            ) {
              menuSelected.splice(1, 0, openFileWithMenu);
            }
            if (menuSelected[0].name === "Paste") {
              menuSelected.splice(0, 1);
            }
          } else {
            //file not selected. Remove openFileWithMenu
            if (
              openFileWithSubmenu.length > 0 &&
              menuSelected[1].name === "Open with..."
            ) {
              menuSelected.splice(1, 1);
            }
            if (nodeToCopy) {
              if (menuSelected[0].name !== "Paste") {
                menuSelected.splice(0, 0, pasteMenu);
              }
            } else {
              if (menuSelected[0].name === "Paste") {
                menuSelected.splice(0, 1);
              }
            }
          }
        }

        if (nodeToCopy) {
          if (menuNotSelected[0].name !== "Paste") {
            menuNotSelected.splice(0, 0, pasteMenu);
          }
        } else {
          if (menuNotSelected[0].name === "Paste") {
            menuNotSelected.splice(0, 1);
          }
        }

        var menu =
          self.#filesTableRowSelected == true ? menuSelected : menuNotSelected;
        $("#explorerSaveAsModal").contextMenu(menu, {
          triggerOn: "contextmenu",
        });
        rigthClickOnSelectedRow = false;
      });

      $("#saveAsType").append($('<option value=".all">All Files</option>'));
      fileExtensions.push(".all");
      if (self.#options.enableNotepad)
        $("#saveAsType").append(
          $('<option value=".txt">Text documents (*.txt)</option>')
        );
      fileExtensions.push(".txt");

      for (var i = 0; i < listOfFileTypes.length; ++i) {
        $("#saveAsType").append(
          $(
            "<option value=" +
              listOfFileTypes[i].ext +
              ">" +
              listOfFileTypes[i].display +
              "</option>"
          )
        );
        fileExtensions.push(listOfFileTypes[i].ext);
      }

      // Highlight selected row

      $("#saveAsType").on("change", () => {
        self.#updateFilesTable();
      });

      $("#foldersTable tbody").on("touchstart", function () {
        longtouch = false;
        clearTimeout(touchTimer);
        touchTimer = setTimeout(function () {
          longtouch = true;
        }, 500);
      });

      $("#foldersTable tbody").on("mousedown touchend", "tr", function (e) {
        if (longtouch && e.button != 0) {
          return;
        }
        $(".selected").not(this).removeClass("selected");
        self.#selectRow($(this));
        $("#parent1").val(self.#name);
        if ($(this).hasClass("selected")) {
          if ($(this).attr("data-tt-file") !== "file") {
            //we selected a folder
            self.#updateFilesTable();
          }
        }
        if ($(this).attr("data-tt-hasHidden") === "true") {
          $("#unHideButton").show();
        } else {
          $("#unHideButton").hide();
        }
        //console.log(456, $(this).attr("data-tt-hasHidden"));
      });

      $("#filesTable tbody").on("touchstart", function () {
        longtouch = false;
        clearTimeout(touchTimer);
        touchTimer = setTimeout(function () {
          longtouch = true;
        }, 500);
      });

      // Highlight selected row
      $("#filesTable tbody").on("mousedown touchend", "tr", function (e) {
        if (longtouch || e.button == 2) {
          if (currentSelectedRowSelector) {
            if (currentSelectedRowSelector.attr("id") !== $(this).attr("id")) {
              //right click on a non-selected row
              currentSelectedRowSelector.toggleClass("selected"); //deselect
              currentSelectedRowSelector = null;
              self.#filesTableRowSelected = false;
              filesTableFileSelected = false;
              rigthClickOnSelectedRow = false;
            } else {
              rigthClickOnSelectedRow = true;
            }
          } else {
            rigthClickOnSelectedRow = false;
          }
          return;
        }
        if ((!longtouch && e.button != 0) || editing) {
          return;
        }
        selectedName = null;
        $(".selected").not(this).removeClass("selected");
        $(this).toggleClass("selected");
        if ($(this).hasClass("selected")) {
          self.#filesTableRowSelected = true;
          selectedName = $(this).attr("id");
          if ($(this).attr("data-tt-file") == "file") {
            filesTableFileSelected = true;
            $("#name").val($(this).attr("data-tt-displayName"));
            var ext = getFileExtension(selectedName) || ".all";
            $("#saveAsType").val(ext);
          } else {
            filesTableFileSelected = false;
          }
          currentSelectedRowSelector = $(this);
          if ($(this).attr("data-tt-hasHidden") === "true") {
            $("#unHideButton").show();
          } else {
            $("#unHideButton").hide();
          }
          //console.log(456, $(this).attr("data-tt-hasHidden"));
        } else {
          self.#filesTableRowSelected = false;
          currentSelectedRowSelector = null;
          rigthClickOnSelectedRow = false;
        }
        var _parent = $(this).attr("data-tt-parent-id");
      });

      $("#filesTable tbody").on("dblclick", "tr", function () {
        var _name = $(this).attr("id");
        if ($(this).attr("data-tt-file") !== "file") {
          //we selected a folder
          //var _name = $(this).attr("id");
          //console.log(111, _name)
          self.#selectRow(_name);
          $("#parent1").val(_name);
          self.#updateFilesTable();
        } else {
          if (!editing)
            openFile($(this).attr("data-tt-path"), {
              editorName: $("#explorerSaveAsModal").attr("editorName"),
            });
        }
      });

      function openFile(filename, { editorName, options }) {
        $(window).trigger("beforeOpen", [
          filename,
          getFileExtension(filename),
          editorName || null,
        ]);
        //console.log(2000, filename)
        options = options || { encoding: "utf8", flag: "r" };
        var _data = { name: filename, options: options };

        axios({
          method: "post",
          url: fsServerUrl + "/readStream",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          responseType: "text",
          data: _data,
        })
          .then(function ({ data }) {
            (async function () {
              //let editor = null;
              if (editorName !== undefined) {
                //a specific editor is requested
                currentEditor = getEditorByName(editorName);
              } else {
                currentEditor = await chooseEditor.getEditorByExt(
                  editors,
                  getFileExtension(filename)
                );
              }

              $(window).trigger("fileOpened", [
                data,
                filename,
                getFileExtension(filename),
                currentEditor?.getEditorData().name,
              ]);
              if (currentEditor) {
                currentEditor.setData(
                  data,
                  filename,
                  getFileExtension(filename),
                  editorName
                );
              } /* else {
                //If we get here, we use fs default setData() method
                self.setData &&
                  self.setData(data, filename, getFileExtension(filename));
              } */
              currentFilename = filename;
              if ($("#dlgTitle").html() === "File Explorer") {
                $("#saveAsType").val(".all");
              }

              // $("#explorerSaveAsModal").modal("hide");
            })();
          })
          .catch(function (returnval) {
            if (!self.getRefreshToken()) {
              self.logout();
              alert(`Please login.`);
              location.reload();
              return;
            }
            console.log(returnval.responseJSON);
            alert("Unexpected error. Please retry.");
          });
      }

      function openFileWith(obj) {
        openFile(currentSelectedRowSelector.attr("data-tt-path"), obj);
      }

      $("#dlgSaveButton").click(async () => {
        try {
          const ext =
            $("#saveAsType").val() == ".all" ? null : $("#saveAsType").val();
          let data = null;
          const editor = getEditorByName(
            $("#explorerSaveAsModal").attr("editorName")
          );
          if (editor) {
            data = editor.getData(ext);
          } else {
            data = self.getData(ext);
          }
          await self.#saveAs(data);
          //$("#explorerSaveAsModal").attr("editorName", null);
          $("#explorerSaveAsModal").modal("hide");
        } catch {
          $("#name")[0].focus();
        }
      });

      $(".config-close").click(() => {
        $("#configModal").modal("hide");
      });

      function doConfigDlg() {
        getConfigFs((data) => {
          $("#rootDir").val(data.rootDir || "root:");
          $("#sep").val(data.sep || "\\");
          $("#dialog-background-color").val(
            data.dialogBackgroundColor || "#ffffff"
          );
          $("#input-background-color").val(
            data.inputBackgroundColor || "#ffffff"
          );
          $("#gridfs-storage").prop("checked", data.gridFsStorage);
          $("#configModal").modal();
        });
      }

      $("#config-cancel-button, #configDlgCancelX").click(() => {
        $("#configModal").modal("hide");
      });

      $("#config-ok-button").click(async () => {
        self.#configData.gridFsStorage = $("#gridfs-storage").prop("checked");
        self.#configData.rootDir = $("#rootDir").val();
        self.#configData.sep = $("#sep").val();
        self.#configData.dialogBackgroundColor = $(
          "#dialog-background-color"
        ).val();
        self.#configData.inputBackgroundColor = $(
          "#input-background-color"
        ).val();
        setConfigFs(self.#configData, async (err) => {
          try {
            try {
              await self.#doInit(self.#configData.rootDir);
            } catch {
              console.log("self.#doInit failed 11");
              alert(`Initialisation failed. Please retry.`);
            }
          } catch (err) {
            console.log("Init failed");
            alert(`Initialisation failed. Please retry.`);
          }
          if (!err) {
            $("#configModal").modal("hide");
          }
        });
      });

      function rememberMeFn(selector) {
        if (
          $(
            `.mongo-db-filesystem-ui-${selector} form input[name=rememberMe]`
          ).is(":checked")
        ) {
          $.cookie("remember", true, { expires: 14 });
        } else {
          $.cookie("remember", null);
        }
      }

      $(".mongo-db-filesystem-ui-loginModal button[name=signUp]").click(
        function (evt) {
          evt.preventDefault();
          loginDlgSelector().modal("hide");
          doRegister();
        }
      );

      async function resetHandler(event) {
        event.preventDefault();

        const username = $(
          ".mongo-db-filesystem-ui-resetPasswordForm input[name=username]"
        ).val();

        const password = $(
          ".mongo-db-filesystem-ui-resetPasswordForm input[name=password]"
        ).val();

        const repeat_password = $(
          ".mongo-db-filesystem-ui-resetPasswordForm input[name=repeat_password]"
        ).val();
        if (password !== repeat_password) {
          return alert("Repeat password is different from New password");
        }

        try {
          const { data } = await axios({
            method: "post",
            url: fsServerUrl + "/reset_password",
            data: { username, password },
          });
          console.log(data);
          resetPassWordDlg.modal("hide");
        } catch (error) {
          console.log(error);
        }
      }

      //Get the user to send the password reset code to the server
      $(".mongo-db-filesystem-ui-resetPasswordForm").on("submit", resetHandler); //

      $(".mongo-db-filesystem-ui-loginModal button[name=forgotPassword]").click(
        async function (evt) {
          let codeEntryTimes = 0;
          evt.preventDefault();
          const username = $(
            ".mongo-db-filesystem-ui-loginModal form input[name=username]"
          ).val();
          if (username.trim() === "") {
            alert("Please enter a username.");
            return;
          }
          loginDlgSelector().modal("hide");

          //3. Get the server to approve the reset. The user is prompted for a new password.

          //Get the server to send a password reset code to the user via email.

          try {
            const { data } = await axios({
              method: "post",
              url: fsServerUrl + "/forgot_password",
              data: { username },
            });

            console.log(data);

            let result = prompt(
              `Enter the reset code we sent to "${data.email}"`
            );

            if (result == null) {
              return doLogin();
            }

            const { resetCode } = data;
            while (parseInt(result) !== resetCode) {
              codeEntryTimes++;
              if (codeEntryTimes === 4) {
                alert('Sorry!!! Try "Forgot password" again.');
                doLogin();
                return;
              }
              result = prompt(`The reset code is incorrect. Try again.`);
              if (result == null) {
                return doLogin();
              }
            }

            $(
              ".mongo-db-filesystem-ui-resetPasswordForm input[name=username]"
            ).val(username);
            resetPassWordDlg.modal();

            //console.log("Do reset");
          } catch (error) {
            console.log(error);
          }
        }
      );

      async function doLogin() {
        loginDlgSelector().modal();
        $(".mongo-db-filesystem-ui-loginModal form input[name=password]").val(
          ""
        );

        if (self.#sameDomain) {
          try {
            const { data } = await axios({
              method: "post",
              url: fsServerUrl + "/credentials",
            });
            const { username, password } = data;
            if (!username.length) {
              $(
                ".mongo-db-filesystem-ui-loginModal form input[name=rememberMe]"
              ).prop("checked", false);
              $.cookie("remember", null);
            }

            $(
              ".mongo-db-filesystem-ui-loginModal form input[name=username]"
            ).val(username);
            $(
              ".mongo-db-filesystem-ui-loginModal form input[name=password]"
            ).val(password);
          } catch (error) {
            console.log(error);
          }
        } else {
          try {
            const rememberMeToken = self.getRememberMeToken();
            //console.log(rememberMeToken);
            const { data } = await axios({
              method: "post",
              url: fsServerUrl + "/credentials",
              data: { rememberMeToken },
            });
            const { username, password } = data;
            //console.log(data);
            if (!username.length) {
              $(
                ".mongo-db-filesystem-ui-loginModal form input[name=rememberMe]"
              ).prop("checked", false);
              $.cookie("remember", null);
            }

            $(
              ".mongo-db-filesystem-ui-loginModal form input[name=username]"
            ).val(username);
            $(
              ".mongo-db-filesystem-ui-loginModal form input[name=password]"
            ).val(password);
          } catch (error) {
            console.log(error);
          }
        }
        if ($.cookie("remember") === "true") {
          $(
            ".mongo-db-filesystem-ui-loginModal form input[name=rememberMe]"
          ).attr("checked", "checked");
        } else {
          $(
            ".mongo-db-filesystem-ui-loginModal form input[name=rememberMe]"
          ).removeAttr("checked");
          $(".mongo-db-filesystem-ui-loginModal form input[name=username]").val(
            ""
          );
          $(".mongo-db-filesystem-ui-loginModal form input[name=password]").val(
            ""
          );
        }
      }

      // bind 'myForm' and provide a simple callback function
      // $("#myForm").ajaxForm(function () {
      //   alert("Thank you for your comment!");
      // });

      function doRegister() {
        $(
          ".mongo-db-filesystem-ui-registerModal form input[name=username]"
        ).val("");
        $(
          ".mongo-db-filesystem-ui-registerModal form input[name=password]"
        ).val("");
        $(
          ".mongo-db-filesystem-ui-registerModal form input[name=repeat_password]"
        ).val("");
        registerDlgSelector().modal();
      }

      function validateEmail(email) {
        //console.log(456, email);
        const re =
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

      $(".mongo-db-filesystem-ui-loginModal form").submit(function (event) {
        //console.log(1235);
        event.preventDefault();

        rememberMeFn("loginModal");
        const formData = $(this).serializeJSON();
        //console.log(formData);
        self.#connectFs(formData, (data) => {
          //console.log(1235, data);
          if (data.error) {
            alert(data.msg);
            if (data.msg === "Not registered.") doRegister();
            return;
          } else {
            $(
              ".mongo-db-filesystem-ui-loginModal form input[name=password]"
            ).val("");
            if (mongoFsLoginLogoutRegisterSeletor) {
              mongoFsLoginLogoutRegisterSeletor.css(
                "zIndex",
                self.#options.zIndex
              );
              mongoFsLoginLogoutRegisterSeletor.contextMenu(
                self.#mongoFsLoginLogoutRegisterMenu2
                /* { zIndex: 2000 } */
              );
            }
            //startIdleTracking();
            console.log(`${formData.username}: ${data.msg}`);

            loginDlgSelector().modal("hide");
          }
        }); //
      });

      $(".mongo-db-filesystem-ui-registerModal form").submit(function (event) {
        event.preventDefault();
        const formData = $(this).serializeJSON();
        rememberMeFn("registerModal");
        if (!validateEmail(formData.email)) {
          alert("Invalid email");
          return;
        }

        if (formData.password !== formData.repeat_password) {
          alert("Password different from repeat-password");
          return;
        }

        self.#registerFs($(this).serializeJSON(), (data) => {
          if (!data.success) {
            $(
              ".mongo-db-filesystem-ui-registerModal form input[name=username]"
            ).val("");

            $(
              ".mongo-db-filesystem-ui-registerModal form input[name=email]"
            ).val("");
            $(
              ".mongo-db-filesystem-ui-registerModal form input[name=password]"
            ).val("");
            $(
              ".mongo-db-filesystem-ui-registerModal form input[name=repeat_password]"
            ).val("");
          } else {
            $(
              ".mongo-db-filesystem-ui-registerModal form input[name=password]"
            ).val("");
            $(
              ".mongo-db-filesystem-ui-registerModal form input[name=repeat_password]"
            ).val("");
            $(window).trigger(
              "registered",
              $(
                ".mongo-db-filesystem-ui-registerModal form input[name=username]"
              ).val()
            );
            registerDlgSelector().modal("hide");
          }
        });
      });

      $(".mongo-db-filesystem-ui-loginModal form input[name=password]").keyup(
        function (e) {
          if (e.keyCode === 13) {
            $(".mongo-db-filesystem-ui-loginModal form :submit").trigger(
              "click"
            );
          }
        }
      );

      $(
        ".mongo-db-filesystem-ui-registerModal form input[name=repeat_password]"
      ).keyup(function (e) {
        if (e.keyCode === 13) {
          $(".mongo-db-filesystem-ui-registerModal form :submit").trigger(
            "click"
          );
        }
      });

      $("#configButton").click(() => {
        doConfigDlg();
      });

      $("#dlg-cancel-button").on("click", () => {
        loginDlgSelector().modal("hide");
      });

      mongoFsLoginLogoutRegisterSeletor = $(".mongo-fs-login-logout-register");
      if (!mongoFsLoginLogoutRegisterSeletor[0]) {
        mongoFsLoginLogoutRegisterSeletor = null;
      }
      //console.log(111, mongoFsLoginLogoutRegisterSeletor.css("zIndex"));
      if (mongoFsLoginLogoutRegisterSeletor) {
        const glyphiconUser = $(
          '<span class="glyphicon glyphicon-user"></span>'
        );
        mongoFsLoginLogoutRegisterSeletor.html("Mongo File System(MFS)");
        mongoFsLoginLogoutRegisterSeletor.append(glyphiconUser);
        mongoFsLoginLogoutRegisterSeletor.attr(
          "title",
          "Register for or Login to Mongo File System"
        );

        if (self.#registerLoginDialog)
          mongoFsLoginLogoutRegisterSeletor.contextMenu(
            mongoFsLoginLogoutRegisterMenu
            /* { zIndex: 2000 } */
          );
      }

      self.#prevRoot = self.#options.rootDir || "root:";

      function getConfigFs(cb) {
        axios({
          method: "get",
          url: fsServerUrl + "/config",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
        })
          .then(function ({ data }) {
            cb(data);
          })
          .catch(function (data) {
            cb(data.responseJSON);
          });
      }

      function setConfigFs(data, cb) {
        axios({
          method: "post",
          url: fsServerUrl + "/config",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          data,
        })
          .then(function () {
            cb(null);
          })
          .catch(function (data) {
            cb(data.responseJSON);
          });
      }

      window.onbeforeunload = function (e) {
        for (let i = 0; i < editors.length; ++i) {
          if (editors[i].editor.currentFileModified()) {
            e.preventDefault();
            e.returnValue = "";
            return "";
          }
        }
        self.logout();
      };

      window.addEventListener("load", (event) => {
        self.clearRefreshToken();
      });

      if (self.#options.enableNotepad) {
        self.#enableNotepad();
      }

      $(window).bind("mongoDbExplorerDlg", (event) => {
        self.#explorerDlg();
      });

      $(window).bind("mongoDbSaveAsDlg", (event) => {
        self.#saveAsDlg();
      });

      $(window).bind("mongoDbSave", async (event, currentFilename, data) => {
        try {
          const result = await self.save(currentFilename, data);
          if (result.data.data.message === "read-only")
            alert(
              `The file "${currentFilename}" is read-only. Save-as with a different filename.`
            );
        } catch (error) {
          console.log(error);
        }
      });

      $(window).bind("reinitialize", async () => {
        try {
          await self.#doInit($("#parent1").val());
          $("#unHideButton").show();
        } catch (error) {
          console.error(error);
        }
      });

      $("#unHideButton").click(async () => {
        const m_folder = $("#parent1").val();
        //const m_selectedName = selectedName.replace("f", "");
        // console.log("folder:" + $("#parent1").val());
        // console.log("file:" + selectedName);

        try {
          const result = await self.setHidden(m_folder, false);
          //console.log(result);
          $("#unHideButton").hide();
          try {
            await self.#doInit(m_folder);
          } catch (error) {
            console.error(error);
          }
        } catch (error) {
          console.log(error);
        }
      });

      function resetTimer() {
        clearTimeout(idleTimer);
        //idleTimer = setTimeout(self.logout, idleTime);
        idleTimer = setTimeout(() => {
          self.logout();
        }, idleTime);
      }

      function startIdleTime() {
        if (idleTime < 5000) return;
        clearTimeout(idleTimer);
        $(window).on("mousemove mousedown click keypress scroll", resetTimer);
      }

      function stopIdleTime() {
        clearTimeout(idleTimer);
        $(window).off("mousemove mousedown click keypress scroll", resetTimer);
      }

      $(window).bind("connected", (e) => {
        startIdleTime();
      });

      $(window).bind("disconnected", (e) => {
        stopIdleTime();
      });

      //////////////////////////////////////////////
    }

    setHidden(name, hidden) {
      const self = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "post",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/hidden",
          data: { name, hidden },
        })
          .then(function (res) {
            //console.log(res);
            resolve(1, res.data);
          })
          .catch(function (err) {
            console.log(2, err);
            reject(err);
          });
      });
    }

    getHidden(filename) {
      const self = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/hidden?name=" + filename,
          //data: { name: filename },
        })
          .then(function ({ data }) {
            //console.log(data);
            resolve(data);
          })
          .catch(function (err) {
            console.log(err);
            reject(err);
          });
      });
    }

    contents(filename) {
      const self = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "post",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/contents",
          data: { name: filename },
        })
          .then(function ({ data }) {
            //console.log(data);
            resolve(data);
          })
          .catch(function (err) {
            console.log(err);
            reject(err);
          });
      });
    }

    setReadOnly(name, readOnly) {
      const self = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "post",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/readOnly",
          data: { name, readOnly },
        })
          .then(function (res) {
            //console.log(res);
            resolve(1, res.data);
          })
          .catch(function (err) {
            console.log(2, err);
            reject(err);
          });
      });
    }

    getReadOnly(filename) {
      const self = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "get",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/readOnly?name=" + filename,
          //data: { name: filename },
        })
          .then(function ({ data }) {
            //console.log(data);
            resolve(data);
          })
          .catch(function (err) {
            console.log(err);
            reject(err);
          });
      });
    }

    getStats(filename) {
      const self = this;
      return new Promise((resolve, reject) => {
        axios({
          method: "post",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/stat",
          data: { name: filename },
        })
          .then(function (res) {
            //console.log(res);
            resolve(res.data);
          })
          .catch(function (err) {
            reject(err);
          });
      });
    }

    setDefaultEditor(editor) {
      currentEditor = editor;
      defaultEditor = editor;
    }

    getRefreshToken() {
      const rt = localStorage.getItem("RefreshToken");
      return rt === "undefined" ? null : rt;
    }

    storeRefreshToken(token) {
      //console.log(459, token);
      localStorage.setItem("RefreshToken", token);
    }

    clearRefreshToken() {
      localStorage.removeItem("RefreshToken");
    }

    getRememberMeToken() {
      const rt = localStorage.getItem("RememberMeToken");
      return rt === "undefined" ? null : rt;
    }

    storeRememberMeToken(token) {
      //console.log(459, token);
      localStorage.setItem("RememberMeToken", token);
    }

    clearRememberMeToken() {
      localStorage.removeItem("RememberMeToken");
    }

    closeExplorerDlg() {
      $("#saveDlgCancelX").click();
    }

    #enableNotepad() {
      //<editorName>Open
      //<editorName>Close
      //<editorName>Save
      //<editorName>SaveAs
      //<editorName>Title
      const editorSelector = $(
        '<div id="notepadModal" class="modal fade" role="dialog" data-backdrop="static" data-keyboard="false"> <div class="modal-dialog" role="document" style="width: 98%;"> <div class="modal-content"> <div class="modal-header"> <img src="https://cdn.jsdelivr.net/gh/cah12/fs-mongo/img/file.png"> <span class="modal-title Text_EditorTitle"></span> <button type="button" class="close Text_EditorClose" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> </div> <div class="modal-body" > <textarea id="myNotepad" autocomplete="false" spellcheck="false" style="outline: none; resize: none; width: 100%;"></textarea> </div> <div class="modal-footer"> <button type="button" class="btn btn-secondary Text_EditorClose">Close</button> <button type="button" class="btn btn-primary Text_EditorOpen">Open file</button> <button type="button" class="btn btn-primary Text_EditorSaveAs">Save As</button> <button type="button" class="btn btn-primary Text_EditorSave" disabled>Save</button> </div> </div> </div> </div>'
      );
      $("body").append(editorSelector);
      $("#myNotepad").css("height", $(window).height() * 0.71);

      const options = {};
      options.fs = this;
      options.editorName = "Text Editor";
      options.fileExtensions = [".txt", null];
      options.explorerDialogParentId = "notepadModal";

      notepad = new MongoNotepad(
        options /* this, "Text Editor", ['.txt', null], "notepadModal" */
      );
      this.registerEditor({ name: "Text Editor", editor: notepad });
      this.#addNotepadMenuItem();

      if (!defaultEditor) {
        defaultEditor = notepad;
        currentEditor = notepad;
      }
    }

    //returns data. Subclass must re-implement
    /* getData() {
    console.error("getData (): Not re-implemented.");
  }*/

    //returns data. Subclass must re-implement
    /* setData(data, filename, ext) {
      console.error(
        "You must re-implement 'setData ()'. Subclass (extend) 'FileSystemServices' and overwrite 'setData()'."
      );
      //console.log(data);
    } */

    /* email is optional */
    #registerFs(registerData, cb) {
      const self = this;
      if (typeof registerData === "function") {
        cb = registerData;
        registerData = undefined;
      }
      axios({
        method: "post",
        url: fsServerUrl + "/registerFs",
        headers: {
          Authorization: "Bearer " + inMemoryToken,
        },
        data: registerData,
      })
        .then(function ({ data }) {
          cb && cb(data);
          console.log(`${registerData.username}: ${data.msg}`);
        })
        .catch(function ({ response }) {
          alert(response.data.msg);
        });
    }

    async #explorerDlg() {
      if (await this.#init()) {
        if (!inMemoryToken) return alert("Not connected...");
        $("#dlgTitle").html("File Explorer");
        $("#inputFields").hide();
        $("#dlgSaveButton").hide();
        $("#explorerSaveAsModal").modal();
        $("#saveAsType").val(".all");
      }
    }

    connect(connectData) {
      if (this.#registerLoginDialog)
        throw new Error(
          'The "registerLoginDialog" option must be set to false for FileSystemServices.connect() to work.'
        );
      this.#connectFs(connectData, (data) => {
        if (data.error) {
          alert(data.msg);
          return;
        } else {
          if (mongoFsLoginLogoutRegisterSeletor) {
            mongoFsLoginLogoutRegisterSeletor.contextMenu(
              this.#mongoFsLoginLogoutRegisterMenu2
              /* { zIndex: 2000 } */
            );
          }
          console.log(`${connectData.username}: ${data.msg}`);
        }
      });
    }

    register(registerData) {
      if (this.#registerLoginDialog)
        throw new Error(
          'The "registerLoginDialog" option must be set to false for FileSystemServices.register() to work.'
        );
      this.#registerFs(registerData, (data) => {
        if (data.error) {
          alert(data.msg);
          return;
        } else {
          console.log(`${registerData.username}: ${data.msg}`);
        }
      });
    }

    #axiosSetUp = false;

    #setUpAxios() {
      this.#axiosSetUp = true;

      // Add a request interceptor
      axios.interceptors.request.use(
        function (config) {
          $("html").addClass("wait");
          //console.log(`Request time: ${new Date().getTime()}`);
          return config;
        },
        function (error) {
          $("html").removeClass("wait");
          return Promise.reject(error);
        }
      );

      // Add a response interceptor
      axios.interceptors.response.use(
        function (response) {
          $("html").removeClass("wait");
          //console.log(`Response time: ${new Date().getTime()}`);
          return response;
        },
        function (error) {
          $("html").removeClass("wait");
          return Promise.reject(error);
        }
      );
    }

    async #connectFs(_connectData, cb) {
      if (!this.#axiosSetUp) this.#setUpAxios();
      const self = this;

      const rememberMe = _connectData.rememberMe == "on" ? true : false;
      //console.log(rememberMe);
      const connectData = {
        username: _connectData.username,
        password: _connectData.password,
        rememberMe,
      };
      if (typeof connectData === "function") {
        cb = connectData;
        connectData = undefined;
      }

      try {
        const { data } = await axios({
          method: "post",
          url: fsServerUrl + "/connect",
          data: connectData,
        });
        inMemoryToken = data.accessToken;
        if (!self.#sameDomain) {
          self.storeRefreshToken(data.refreshToken);
          self.storeRememberMeToken(data?.rememberMeToken);
        }
        clearTimeout(self.#timer); //ensure any earlier timeout is cleared
        self.#countDown(); //monitor expiration
        self.#configData = data.configData;
        self.#name = self.#configData.rootDir;
        //self.#startIdleTime();
        cb && cb({ error: false, msg: "Connected" });
        $(window).trigger("connected", data.username);

        try {
          const { data } = await axios({
            method: "get",
            url: fsServerUrl + "/data",
            headers: {
              Authorization: "Bearer " + inMemoryToken,
            },
          });
          if (typeof data === "object") choiceStore = data;
        } catch ({ response }) {
          console.log(response.data.msg);
        }
      } catch ({ response }) {
        alert(
          `"${connectData.username}" is ${response.data.msg.toLowerCase()}`
        );
      }
    }

    async #disconnectFs(cb) {
      const self = this;
      $(window).trigger("disconnected");
      self.#stopCountDown();
      const refreshToken = self.getRefreshToken();

      //self.clearRememberMeToken();

      try {
        await axios({
          method: "post",
          url: fsServerUrl + "/data",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          data: choiceStore,
        });
        try {
          await axios({
            method: "post",
            url: fsServerUrl + "/disconnect",
            data: { refreshToken },
          });
          inMemoryToken = null;
          self.clearRefreshToken();
          cb && cb({ error: false, msg: "Disconnected" });
        } catch ({ response }) {
          cb && cb(response.data.msg);
        }
      } catch (error) {
        console.log(error);
        //cb && cb(response.data.msg);
      }
    }

    async isConnected() {
      return inMemoryToken !== null;
    }

    save(filename, fileData /* , _flag */) {
      const self = this;
      return new Promise((resolve, reject) => {
        $(window).trigger("beforeSave", filename);
        var _data = {};
        _data.options = { encoding: "utf8", mode: 0o666, flag: "w" };
        _data.name = filename;
        _data.data = fileData;
        const ext = getFileExtension(filename);
        if (!ext) {
          _data.name += ".all";
        }

        //$("html").addClass("wait");
        axios({
          method: "post",
          url: fsServerUrl + "/writeFile",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          data: _data,
        })
          .then(function (data) {
            //console.log(data);
            if (!data.data.message) {
              //$(window).trigger("afterSave");
              $(window).trigger("fileSaved", [
                filename,
                $("#explorerSaveAsModal").attr("editorName"),
              ]);
            }

            //$("html").removeClass("wait");
            //console.log(789, { data });
            resolve({ data });
          })
          .catch(function (err) {
            //$("html").removeClass("wait");
            reject(err);
          });
      });
    }

    #addNotepadMenuItem() {
      const self = this;
      self.#mongoFsLoginLogoutRegisterMenu2.push({
        name: "Notepad",
        title: "Launch the Mongo File System notepad.",
        fun: self.#doNotepadDlg,
      });
    }

    addSaveAndSaveAsMenuItems() {
      if (
        this.#mongoFsLoginLogoutRegisterMenu2.find(
          (element) => element.name === "Save"
        )
      ) {
        console.error(
          "Attempting to call addSaveAndSaveAsMenuItems() more than once."
        );
        return;
      }
      this.#mongoFsLoginLogoutRegisterMenu2.push({
        name: "Save",
        title: "Saves current document to Mongo File System.",
        fun: () => {
          const event =
            currentEditor.getEditorData().name.replaceAll(" ", "_") + "Save";
          $(window).trigger(event);
          //currentEditor.save();
        },
      });
      this.#mongoFsLoginLogoutRegisterMenu2.push({
        name: "Save As",
        title: "Saves current document to Mongo File System.",
        fun: () => {
          const event =
            currentEditor.getEditorData().name.replaceAll(" ", "_") + "SaveAs";
          $(window).trigger(event);
          //currentEditor.saveAs();
        },
      });
      $("body").keydown(function (e) {
        if (!e.shiftKey && e.ctrlKey && (e.key === "S" || e.key === "s")) {
          e.preventDefault();

          //$("html").addClass("wait");
          const event =
            currentEditor.getEditorData().name.replaceAll(" ", "_") + "Save";
          $(window).trigger(event);
          //currentEditor.save();
          //$("html").removeClass("wait");
        }
        if (e.shiftKey && e.ctrlKey && (e.key === "S" || e.key === "s")) {
          e.preventDefault();
          const event =
            currentEditor.getEditorData().name.replaceAll(" ", "_") + "SaveAs";
          $(window).trigger(event);
          //currentEditor.saveAs();
        }
      });
    }

    currentFilename(filename) {
      if (filename !== undefined) currentFilename = filename;
      return currentFilename;
    }

    registerEditor(editor) {
      editors.push(editor);
    }

    loginModalDlg() {
      if (this.#simpleLoginDialog)
        return '<!-- Modal content--> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">&times;</button> <h4 style="color:rgb(51, 122, 183);" class="modal-title">Sign In</h4> </div> <div class="modal-body"> <form> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="username" class="no-outline" type="text" style="width: 97%; border-style: none;" placeholder="Enter Username" required></div><br><div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="password" class="no-outline" type="password" style="width: 97%; border-style: none;" placeholder="Enter Password" required></div><br><input type="submit" id="dlg-ok-button" style="width:100%" class="btn btn-primary" value="Sign Up" /> </form> </div> </div>';
      return '<!-- Modal content--> <div class="bootstrap-iso modal-content"> <div class="modal-header" style="padding:35px 50px;background-color: #5cb85c;color: white !important;text-align: center;font-size: 30px;"> <button type="button" style="background-color: #5cb85c;color: white !important;text-align: center;font-size: 30px;" class="close" data-dismiss="modal">&times;</button> <h4 style="background-color: #5cb85c;color: white !important;text-align: center;font-size: 30px;"> <p><span class="glyphicon glyphicon-lock"></span> Welcome to</p><p style="color:red"><b>MongoDB Filesystem</b></p></h4> </div> <div class="modal-body" style="padding:40px 50px;"> <form role="form"> <div class="form-group"> <label for="mongodb_username"><span class="glyphicon glyphicon-user"></span> Username</label> <input type="text" class="form-control" name="username" id="mongodb_username" placeholder="Enter username"> </div> <div class="form-group"> <label for="mongodb_password"><span class="glyphicon glyphicon-eye-open"></span> Password</label> <input type="password" class="form-control" name="password" id="mongodb_password" placeholder="Enter password"> </div> <div class="checkbox"> <label><input type="checkbox" name="rememberMe" checked>Remember me</label> </div> <button type="submit" class="btn btn-success btn-block"><span class="glyphicon glyphicon-off"></span> Login</button> </form> </div> <div class="modal-footer"> <button class="btn btn-danger btn-default pull-left" data-dismiss="modal"><span class="glyphicon glyphicon-remove"></span> Cancel</button> <p>Not a member? <button class="btn btn-link" name="signUp">Sign Up</button></p> <p>Forgot <button class="btn btn-link"  name="forgotPassword">Password?</button></p> </div> </div>';
    }

    registerModalDlg() {
      if (this.#simpleRegisterDialog)
        return '<!-- Modal content--> <div class="modal-content"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">&times;</button> <h4 style="color:rgb(51, 122, 183);" class="modal-title">Sign Up</h4> </div> <div class="modal-body"> <form> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="username" class="no-outline" type="text" style="width: 97%; border-style: none;" placeholder="Enter Username" required></div> <br> <div><div class="bottom-border"><span class="glyphicon glyphicon-envelope"></span><input name="email" class="no-outline" type="email" style="width: 97%; border-style: none;" placeholder="Enter Email Address" required></div> <br> </div> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input id="dlg-password"  name="password" class="no-outline" type="password" style="width: 97%; border-style: none;" placeholder="Enter Password" required></div> <br> <div id="dlg-repeat-row"> <div class="bottom-border"><span class="glyphicon glyphicon-user"></span><input name="repeat_password" class="no-outline" type="password" style="width: 97%; border-style: none;" placeholder="Repeat Password" required></div> </div><br><input type="submit" style="width:100%" class="btn btn-primary" value="Sign Up" /> </form> </div> </div>';
      return '<!-- Modal content--> <div class="modal-content"> <div class="modal-header" style=" padding: 35px 50px; background-color: #5cb85c; color: white !important; text-align: center; font-size: 30px; " > <button type="button" style=" background-color: #5cb85c; color: white !important; text-align: center; font-size: 30px; " class="close" data-dismiss="modal" > &times; </button> <h4 style=" background-color: #5cb85c; color: white !important; text-align: center; font-size: 30px; " >  <p><span class="glyphicon glyphicon-lock"></span> Welcome to</p><p style="color:red"><b>MongoDB Filesystem</b></p> </h4> </div> <div class="modal-body" style="padding: 40px 50px"> <form role="form"> <div class="form-group"> <label for="mongodb_username2" ><span class="glyphicon glyphicon-user"></span> Username</label > <input type="text" class="form-control" name="username" id="mongodb_username2" placeholder="Enter username" required /> </div> <div class="form-group"> <label for="email" ><span class="glyphicon glyphicon-envelope"></span> Email</label > <input type="text" class="form-control" name="email" id="email" placeholder="Enter email" required /> </div> <div class="form-group"> <label for="mongodb_password2" ><span class="glyphicon glyphicon-eye-open"></span> Password</label > <input type="password" class="form-control" name="password" id="mongodb_password2" placeholder="Enter password" required /> </div> <div class="form-group"> <label for="repeat_password" ><span class="glyphicon glyphicon-eye-open"></span> Repeat password</label > <input type="password" class="form-control" name="repeat_password" id="repeat_password" placeholder="Repeat password" required /> </div> <div class="checkbox"> <label ><input type="checkbox" name="rememberMe" />Remember me</label > </div> <button type="submit" class="btn btn-success btn-block"> <span class="glyphicon glyphicon-off"></span> Sign up </button> </form> </div> <div class="modal-footer"> <button class="btn btn-danger btn-default pull-left" data-dismiss="modal" > <span class="glyphicon glyphicon-remove"></span> Cancel </button> </div> </div>';
    }

    #refresh(cb) {
      const self = this;
      const refreshToken = self.getRefreshToken();
      //console.log(456, refreshToken);
      if (!self.#sameDomain && !refreshToken) {
        self.clearRefreshToken(); //remove any invalid token
        inMemoryToken = null;
        cb && cb(true, data); //error
        return;
      }

      axios({
        method: "post",
        url: fsServerUrl + "/refresh_token",
        data: { refreshToken },
      })
        .then(function ({ data }) {
          inMemoryToken = data.accessToken;
          if (!self.#sameDomain) {
            self.storeRefreshToken(data.refreshToken);
          }
          clearTimeout(self.#timer);
          self.#countDown();
          cb && cb(false, data);
        })

        .catch(function (data) {
          self.clearRefreshToken(); //remove any invalid token
          cb && cb(true, data); //error
        });
    }

    #addRow(rootData) {
      $($("#filesTable").children()[0]).append(this.#makeRow(rootData));
    }

    #getChildren(nodeName) {
      const self = this;
      var result = [];
      for (var i = 0; i < self.#nodes.length; ++i) {
        if (self.#nodes[i].path.length > nodeName.length) {
          if (
            self.#nodes[i].path.indexOf(nodeName) !== -1 &&
            self.#nodes[i].parentPath == nodeName
          ) {
            result.push(self.#nodes[i]);
          }
        }
      }
      return result;
    }

    async #init() {
      const self = this;
      try {
        await self.#doInit(self.#configData.rootDir);
        return true;
      } catch (err) {
        console.log("self.#doInit failed 13");
        if (!self.getRefreshToken()) {
          self.logout();
          alert(`Please login.`);
          location.reload();
          return false;
        }
        alert(`Initialisation failed. Please retry.`);
        return false;
      }
    }

    #updateFilesTable() {
      const self = this;
      clearFilesTable();
      var children = self.#getChildren(self.#name);
      for (var i = 0; i < children.length; ++i) {
        var _name = children[i].path;
        //console.log(_name)
        if (children[i].isFile) {
          var selectedExtType = $("#saveAsType").val();
          if (
            selectedExtType === ".all" ||
            $("#dlgTitle").html() === "File Explorer"
          ) {
            self.#addRow(children[i]);
            continue;
          } else {
            if (children[i].ext) {
              const dotExt = "." + children[i].ext;
              if (dotExt == selectedExtType) {
                self.#addRow(children[i]);
              }
              continue;
            }
          }
        } else {
          self.#addRow(children[i]);
        }
      }
    }

    #selectRow(row) {
      const self = this;
      if (typeof row == "string") row = $(document.getElementById(row));
      if (
        self.#currentRowSelector &&
        self.#currentRowSelector.hasClass("selected")
      )
        self.#currentRowSelector.toggleClass("selected");
      if (row) {
        row.toggleClass("selected");
      }
      var idAttr = null;
      if (row && row.hasClass("selected")) {
        self.#filesTableRowSelected = false;
        idAttr = row.attr("data-tt-id");

        if (row.attr("data-tt-parent-id")) {
          var nodeIds = row
            .attr("data-tt-parent-id")
            .split(self.#configData.sep);
          var id = "";
          for (var i = 0; i < nodeIds.length; ++i) {
            if (i > 0) {
              id += self.#configData.sep;
            }
            id += nodeIds[i];
            $("#foldersTable").treetable("expandNode", id);
          }
        }
      }
      if (!idAttr) {
        return false;
      }
      self.#currentRowSelector = row;
      self.#name = idAttr; //long name
      self.#parentName = row.attr("data-tt-parent-id");
      return true;
    }

    #makeRow(rootData) {
      const self = this;
      function doDrop(ev) {
        self.#drop(ev, $(this).attr("id"));
      }

      var row = null;
      if (rootData.isFile) {
        if (self.#imageFileSrc)
          row = $(
            '<tr draggable="true"><td style="border-width: 0px; padding:3px"><img src=' +
              self.#imageFileSrc +
              "> " +
              rootData.displayName +
              "</td></tr>"
          );
        else
          row = $(
            '<tr draggable="true"><td style="border-width: 0px;padding:3px"">' +
              rootData.displayName +
              "</td></tr>"
          );
        row.attr("data-tt-file", "file");
        row.attr("data-tt-ext", rootData.ext);
        row.attr("data-tt-path", rootData.path);
      } else {
        if (self.#imageFolderSrc)
          row = $(
            '<tr><td style="border-width: 0px;padding:3px"><img src=' +
              self.#imageFolderSrc +
              "> " +
              rootData.displayName +
              "</td></tr>"
          );
        else
          row = $(
            '<tr><td style="border-width: 0px;padding:3px"">' +
              rootData.displayName +
              "</td></tr>"
          );
        row.attr("data-tt-file", "folder");
        row.attr("data-tt-hasHidden", rootData.hasHidden);
      }
      row.attr("data-tt-displayName", rootData.displayName);
      var _id = rootData.id;
      row.attr("data-tt-id", _id);
      row.attr("id", _id);
      if (rootData.parentPath !== undefined && rootData.parentPath !== "") {
        row.attr("data-tt-parent-id", rootData.parentId); //name is parent
      }
      if (rootData.path == self.#configData.rootDir) {
        self.#currentRowSelector = row;
      }
      row.on("dragstart", drag);
      row.on("dragover", allowDrop);
      row.on("drop", doDrop);

      if (isMobile()) row.attr("draggable", false);
      return row;
    }

    #doInit(selectedFolder) {
      const self = this;
      const optns = {
        expandable: true,
        clickableNodeNames: true,
      };
      //console.log($(".selected")[0]);

      return new Promise((resolve, reject) => {
        $("#dlg-saveDlg").css(
          "background-color",
          self.#configData.dialogBackgroundColor || "#ffffff"
        );
        $(".inputClass").css(
          "background-color",
          self.#configData.inputBackgroundColor || "#ffffff"
        );

        axios({
          method: "get",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          url: fsServerUrl + "/tree",
        })
          .then(function ({ data }) {
            self.#nodes = data.tree;
            if (self.#nodes[0].hasHidden) {
              $("#unHideButton").show();
            } else {
              $("#unHideButton").hide();
            }
            //console.log(1000, self.#nodes);
            if (self.#initialized) {
              $("#foldersTable").treetable("removeNode", self.#prevRoot);
            } else {
              $("#foldersTable").treetable(optns);
              $("#filesTable").treetable(optns /* , true */);
            }
            //selectedFolder = self.#configData.rootDir;
            self.#prevRoot = self.#configData.rootDir;
            seperator = self.#configData.sep;
            for (var i = 0; i < data.tree.length; ++i) {
              if (!data.tree[i].isFile) {
                var parentNode = $("#foldersTable").treetable(
                  "node",
                  data.tree[i].parentId
                );
                $("#foldersTable").treetable(
                  "loadBranch",
                  parentNode,
                  self.#makeRow(data.tree[i])
                );
              }
            }

            self.#initialized = true;
            $("#foldersTable").treetable("collapseAll");
            self.#selectRow(selectedFolder);
            self.#updateFilesTable();
            var m_name = selectedFolder;
            //console.log(222, m_name)
            $("#parent1").val(m_name);

            if (
              $(".selected")[0] &&
              $(".selected").attr("data-tt-hasHidden") === "true"
            ) {
              $("#unHideButton").show();
            } else {
              $("#unHideButton").hide();
            }

            resolve(true);
          })
          .catch(function (returnval) {
            reject(false);
          });

        //////////////////////////////////////////////////////////////
      });
    }

    /**
     * Launches the save-as modal dialog
     * @returns
     */
    async #saveAsDlg() {
      if (await this.#init()) {
        if (!inMemoryToken) return alert("Not connected...");
        $("#dlgTitle").html("Save As");
        $("#inputFields").show();
        //$("#dlgCancelButton").show();
        $("#dlgSaveButton").show();
        // console.log(456, $("#explorerSaveAsModal").parent());
        $("#explorerSaveAsModal").modal();
      }
    }

    #stopCountDown() {
      clearTimeout(this.#timer);
    }

    //Set self.#sameDomain to false to use getRefreshToken() even in same domain
    #countDown() {
      const self = this;
      clearTimeout(self.#timer);
      self.#timer = setTimeout(() => {
        self.#refresh();
      }, (self.#options.accessTokenExpiry - 0.5) * 1000);
    }

    #saveAs(fileData, _flag) {
      const self = this;
      return new Promise((resolve, reject) => {
        //console.log(225)
        const flag = _flag || "wx";
        var _data = {};
        _data.options = { encoding: "utf8", mode: 0o666, flag };
        _data.name =
          $("#parent1").val() + self.#configData.sep + $("#name").val();
        _data.data = fileData;
        const ext = $("#saveAsType").val();
        if (ext !== ".all") {
          _data.name += ext;
        }
        currentFilename = _data.name;
        $(window).trigger("beforeEditorSaveAs", [_data.name]);

        axios({
          method: "post",
          url: fsServerUrl + "/createFile",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          data: _data,
        })
          .then(function (data) {
            $(window).trigger("fileSaved", [
              _data.name,
              $("#explorerSaveAsModal").attr("editorName"),
            ]);
            $(window).trigger("afterEditorSaveAs", [
              _data.name,
              $("#explorerSaveAsModal").attr("editorName"),
            ]);
            //currentFileSaved();
            resolve(true);
          })
          .catch(async function (err) {
            if (
              confirm(
                `A file with the name "${_data.name}" already exist. Would you like to replace it ?`
              )
            ) {
              try {
                await self.#saveAs(fileData, "w");
                $(window).trigger("fileSaved", [
                  _data.name,
                  $("#explorerSaveAsModal").attr("editorName"),
                ]);
                $(window).trigger("afterEditorSaveAs", [
                  _data.name,
                  $("#explorerSaveAsModal").attr("editorName"),
                ]);
                resolve(true);
              } catch (err) {
                $(window).trigger("afterEditorSaveAs", [
                  _data.name,
                  $("#explorerSaveAsModal").attr("editorName"),
                ]);
                reject(false);
              }
            } else {
              $(window).trigger("afterEditorSaveAs", [
                _data.name,
                $("#explorerSaveAsModal").attr("editorName"),
              ]);
              reject(false);
            }
          });

        ///////////////////////////
      });
    }

    /* #resetTimer() {
      console.log(this);
      const self = this;
      clearTimeout(idleTimer);
      //idleTimer = setTimeout(self.logout, idleTime);
      idleTimer = setTimeout(() => {
        self.logout();
      }, idleTime);
    }

    #startIdleTime() {
      const self = this;
      if (idleTime < 5000) return;
      clearTimeout(idleTimer);
      $(window).on(
        "mousemove mousedown click keypress scroll",
        self.#resetTimer
      );
    } */

    // getConfigData() {
    //   return this.#configData;
    // }

    #drop(ev, elementId) {
      const self = this;
      ev.preventDefault();
      var originalNode = $(
        document.getElementById(ev.originalEvent.dataTransfer.getData("text"))
      );
      var finalNode = $(document.getElementById(elementId));
      //console.log("self.#nodes:", originalNode, finalNode)
      if (finalNode.attr("data-tt-file") !== "file") {
        var originalPath =
          originalNode.attr("data-tt-path") || originalNode.attr("id");
        var finalPath = finalNode.attr("data-tt-id");
        if (finalPath.indexOf(originalPath) !== -1) {
          //cannot drop on descendant
          //console.log(789);
          return;
        }
        var parts = originalPath.split(self.#configData.sep);
        var originalBasename = parts[parts.length - 1];
        var newName = finalPath + self.#configData.sep + originalBasename;

        if (originalPath == newName) {
          return;
        }
        let m_data = { name: originalPath, newName: newName };
        axios({
          method: "post",
          url: fsServerUrl + "/rename",
          headers: {
            Authorization: "Bearer " + inMemoryToken,
          },
          data: m_data,
        })
          .then(function (data) {
            (async function () {
              if (originalNode.attr("data-tt-file") === "file") {
                try {
                  await self.#doInit(finalPath);
                } catch {
                  console.log("self.#doInit failed 7");
                  alert(`Initialisation failed. Please retry.`);
                }
              } else {
                try {
                  await self.#doInit(newName);
                } catch {
                  console.log("self.#doInit failed 8");
                  alert(`Initialisation failed. Please retry.`);
                }
              }
            })();
          })

          .catch(function (err) {
            if (err.responseJSON.msg === "File with that name already exist") {
              if (
                confirm(
                  `File with the name "${newName}" already exist. Do you want to replace it?`
                )
              ) {
                m_data.replaceFile = true;
                //console.log(456, m_data)
                axios({
                  method: "post",
                  url: fsServerUrl + "/rename",
                  headers: {
                    Authorization: "Bearer " + inMemoryToken,
                  },
                  data: m_data,
                })
                  .then(function (data) {
                    (async function () {
                      //console.log(457, m_data)
                      if (originalNode.attr("data-tt-file") === "file") {
                        try {
                          await self.#doInit(finalPath);
                        } catch {
                          console.log("self.#doInit failed 9");
                          alert(`Initialisation failed. Please retry.`);
                        }
                      } else {
                        try {
                          await self.#doInit(newName);
                        } catch {
                          console.log("self.#doInit failed 10");
                          alert(`Initialisation failed. Please retry.`);
                        }
                      }
                    })();
                  })
                  .catch(function (err) {
                    //console.log(458, m_data)
                    console.log(err.responseJSON);
                  });
              }
              //console.log(err.responseJSON);
            }
          });
      }
    }

    logout() {
      //console.log(666);
      const self = this;
      self.#disconnectFs((data) => {
        if (data.error) return console.log(data.msg);
        mongoFsLoginLogoutRegisterSeletor.contextMenu(
          mongoFsLoginLogoutRegisterMenu
          /* { zIndex: 2000 } */
        );

        $.cookie("remember", null);

        console.log(data.msg);
      });
    }

    #doNotepadDlg() {
      if (notepad) notepad.openEditor();
    }
  }

  class MongoNotepad extends Editor {
    constructor(obj) {
      super(obj);
      const self = this;

      $(window).bind("fileSaved", function (e, filename, editorName) {
        if (editorName === self.getEditorData().name) {
          $("#myNotepad").focus();
        }
      });

      $("#myNotepad").on("input", function () {
        self.currentFileModified(true);
      });
    }

    initEditor() {
      super.initEditor();
      $(".Text_EditorSave").attr("disabled", true);
      $("#myNotepad")[0].value = "";
    }

    openEditor() {
      this.initEditor();
      $("#notepadModal").modal("show");
    }

    closeEditor() {
      $("#notepadModal").modal("hide");
    }

    getData() {
      return $("#myNotepad").val();
    }

    setData(data, filename) {
      if (!this.editorOpened()) {
        this.openEditor();
      }
      currentFilename = filename;
      $("#myNotepad")[0].value = data;
    }
  }

  window.FileSystemServices = FileSystemServices;
  window.Editor = Editor;
})();
