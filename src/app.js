import {
  Color, LineBasicMaterial, MeshBasicMaterial} from "three";
import {dimension, IfcViewerAPI} from "web-ifc-viewer";
import { 
  IFCBUILDINGELEMENTPROXY, 
  IFCCURTAINWALL, 
  IFCDOOR, 
  IFCFLOWFITTING, 
  IFCFLOWSEGMENT,
  IFCFLOWTERMINAL,
  IFCMEMBER, 
  IFCPLATE, 
  IFCSPACE, 
  IFCWALL, 
  IFCWALLSTANDARDCASE, 
  IFCWINDOW, 
  IFCSLAB
 } from "web-ifc";
import Dexie from "dexie";

const container = document.getElementById('viewer-container');
//const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

class Session{
  constructor(changed) {
    this.viewer = this.setInstance();
    new ifcViewer(this.viewer, changed);
    new UIEffects(this.viewer);
    return this.viewer;
  }

  setInstance() {
    return new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
  }
}

class ifcViewer{
  constructor(viewer, changed) {
    this.model = this.ifcViewer(viewer, changed);
    this.dimensionTool(viewer);
    this.propertiesMenu(viewer);
    this.clipPlaneTool(viewer);
  }

  clipPlaneTool(viewer) {
    const plane = document.getElementById('plane');
    plane.addEventListener('click', function() {
      if(plane.checked) {
        viewer.clipper.createPlane();
      } else {
        viewer.clipper.deletePlane();
      }
    })

    

  }

  async ifcViewer(viewer, changed) {
    console.log('test times executed');
    var model;
    var model_name;
    const modelID = 0;
    viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
      [IFCSPACE]: false,
    });
    setUpMultiThreading(viewer);
    setupProgressNotification(viewer);

    // Create axes
    viewer.axes.setAxes();

    const input = document.getElementById("file-input");
    
    const ifcURL = URL.createObjectURL(changed.target.files[0]);
    model_name = changed.target.files[0]['name'];
    model = await loadIfcViewer(ifcURL,viewer);
    modelID = model.modelID;

    console.log(model_name);
    /*
    input.addEventListener("change", async (changed) => {
      const ifcURL = URL.createObjectURL(changed.target.files[0]);
      model_name = changed.target.files[0]['name'];
      model = await loadIfcViewer(ifcURL,viewer);
      modelID = model.modelID;

      console.log(model_name);
    })
    
    
    window.ondblclick = async () => { 
      const result =  await viewer.IFC.selector.pickIfcItem();
      if(!result) return;
      const {modelID, id} = result;
      const props = await viewer.IFC.getProperties(modelID, id, true, true);
      console.log(props);
    }*/

    return model;

  }

  dimensionTool(viewer) {
    //--------------------
    viewer.dimensions.active = true;
    viewer.dimensions.previewActive = false;
    const dimensions = document.getElementById("dimensions");

    window.ondblclick = () => {
      if (dimensions.checked) {
        viewer.dimensions.create();
      }
    }

    window.onkeydown = (event) => {
        if (dimensions.checked) {
          if(event.code === 'Delete') {
            viewer.dimensions.delete();
          }
        }
    }
  }

  dipose(viewer) {

  }

  propertiesMenu(viewer) {
    const properties = document.getElementById('properties');
    //const name = document.querySelector('element-name');
    //console.log(name.innerText);

    window.oncontextmenu = async () => {
      if (properties.checked) {
        const result = await viewer.IFC.selector.pickIfcItem(false);
        if (!result) return;
        const { modelID, id } = result;
        const props = await viewer.IFC.getProperties(modelID, id, true, true);
        //name.innerText = props['Name']['value'];
        console.log(getTopFormat(props));
        loadProperties(props);
        viewer.IFC.selector.unpickIfcItems();
      }
      
    };
  }

  
}

class UIEffects{
  constructor(viewer) {
    this.buttonsEffects(viewer);
  }

  buttonsEffects(viewer) {
    //----------
    const dimensions = document.getElementById("dimensions");    
    dimensions.addEventListener("click", function() {
      if (dimensions.checked) {
        document.querySelector('.dimensions').classList.add('button-active');
        viewer.dimensions.previewActive = true;
      } else {
        document.querySelector('.dimensions').classList.remove('button-active');
        viewer.dimensions.previewActive = false;
      }
    })
    //---------
    const properties = document.getElementById("properties");
    properties.addEventListener("click", function() {
      if (properties.checked) {
        document.querySelector('.properties').classList.add('button-active');
      } else {
        document.querySelector('.properties').classList.remove('button-active');
      }
    })
    //-----------
    const plane = document.getElementById("plane");
    plane.addEventListener("click", function() {
      if(plane.checked) {
        document.querySelector('.plane').classList.add('button-active');
      } else {
        document.querySelector('.plane').classList.remove('button-active');
      }
    })
    
  }
}

class DataBase{
  constructor(viewer, input, event) {
    this.saveButton = document.getElementById('model-save');
    this.saveLabel = document.querySelector('.model-save');
    this.loadButton = document.getElementById('model-load');
    this.loadLabel = document.querySelector('.model-load');
    this.removeButton = document.getElementById('model-remove');
    this.removeLabel = document.querySelector('.model-remove');

    this.preprocessAndSaveIfc(event, viewer);
    this.db = this.createOrOpenDatabase();
    this.updateButtons();
    this.setUP(viewer, input);
  }

  setUP(viewer, input) {
    this.removeButton.onclick = () => this.removeDatabase();
    this.loadButton.onclick = () => this.loadSavedIfc(viewer);
    this.saveButton.onclick = () => input.click();
  }

  removeDatabase() {
    localStorage.removeItem("modelsNames");
    this.db.delete();
    location.reload();
  }

  async loadSavedIfc(viewer) {
    const serializedNames = localStorage.getItem("modelsNames");
    const names = JSON.parse(serializedNames);

    for (const name of names) {
      const savedModel = await this.db.bimModels.where("name").equals(name).toArray();

      const data = savedModel[0].file;
      const file = new File([data], 'example');
      const url = URL.createObjectURL(file);
      await viewer.GLTF.loadModel(url);
    }
  }

  async preprocessAndSaveIfc(event, viewer) {
    const file = event.target.files[0];
    const url = URL.createObjectURL(file);

    console.log('Saving model data')

    const result = await viewer.GLTF.exportIfcFileAsGltf({
      ifcFileUrl: url,
      categories: {
        walls: [IFCWALL, IFCWALLSTANDARDCASE],
        slabs: [IFCSLAB],
        windows: [IFCWINDOW],
        curtainwalls: [IFCMEMBER, IFCPLATE, IFCCURTAINWALL],
        doors: [IFCDOOR],
        pipes: [IFCFLOWFITTING, IFCFLOWSEGMENT, IFCFLOWTERMINAL],
        undefined: [IFCBUILDINGELEMENTPROXY]
      }
    });

    const models = [];

    for (const categoryName in result.GLTF) {
      const category = result.GLTF[categoryName];
      for (const levelName in category) {
        const file = category[levelName].file;
        if (file) {
          const data = await file.arrayBuffer();
          models.push({
            name: result.id + categoryName + levelName,
            id: result.id,
            category: categoryName,
            level: levelName,
            file: data
          })
        }
      }
    }

    await this.db.bimModels.bulkPut(models);

    const serializedNames = JSON.stringify(models.map(model => model.name));
    localStorage.setItem("modelsNames", serializedNames);
    //location.reload();
    console.log('model-' + serializedNames + '-Saved.')
  }

  createOrOpenDatabase() {
    const db = new Dexie("ModelDatabase");

    db.version(1).stores({
      bimModels:`
      name,
      id,
      category,
      level`
    });

    return db;
  }

  updateButtons() {
    const previousData = localStorage.getItem('modelsNames');

    if(!previousData) {
      this.loadLabel.classList.add('disabled');
      this.removeLabel.classList.add('disabled');
      this.saveLabel.classList.remove('disabled');
    } else {
      this.loadLabel.classList.remove('disabled');
      this.removeLabel.classList.remove('disabled');
      this.saveLabel.classList.add('disabled');
    }
  }
  

  
}

//----------------------------------------/
//           FUNCTIONS
//----------------------------------------/
function getPropertyValue(props, name) {
  const pset_lenght = props['psets']['length'];
  const psets = [];

  for (var i = 0; i<pset_lenght; i++) {
    const pset = props['psets'][i];
    psets.push(pset);
  }

  psets.forEach(element => {
    const properties_length = element['HasProperties']['length'];
    for (var i=0; i<properties_length; i++) {
      const property = element['HasProperties'][i];

      const property_name = property['Name']['value'];
      console.log(property_name);
      console.log(property_name + ' - ' +  name);
      if (property_name === name) {
        return property['NominalValue']['value'];
      }
    }

  })

  //return 'N/A'
}

function getTopFormat(props) {
  return getPropertyValue(props, 'TOPFORMAT_INSTANCE');
}

function loadProperties(props) {
  const explorer = document.getElementById('my-explorer');
  while (explorer.lastChild) {
    explorer.removeChild(explorer.lastChild);
  }

  const name = props['Name']['value'];
  const pset_lenght = props['psets']['length'];
  const psets = [];
  const properties = [];
  
  const name_element = document.createElement('h2');
  name_element.innerText = name;
  explorer.appendChild(name_element);


  for (var i = 0; i<pset_lenght; i++) {
    const pset = props['psets'][i];
    psets.push(pset);
  }
  psets.forEach(element => {
    const pset_container = document.createElement('div');
    pset_container.classList.add('pset-container');

    const pset_title = document.createElement('div');
    pset_title.classList.add('pset-title');
    pset_container.appendChild(pset_title);

    const pset_li = document.createElement('li');
    const pset_span = document.createElement('span');
    pset_span.innerText = element['Name']['value'];
    pset_li.appendChild(pset_span);
    pset_container.appendChild(pset_li);

    const br = document.createElement('br');
    pset_container.appendChild(br);

    const properties_length = element['HasProperties']['length'];
    
    for (var i=0; i<properties_length; i++) {
      const property = element['HasProperties'][i];

      const property_container = document.createElement('div');
      property_container.classList.add('property-container');

      const property_name = document.createElement('div');
      property_name.classList.add('property-name');
      const property_name_li = document.createElement('li');
      const property_name_span = document.createElement('span')
      property_name_span.innerText = property['Name']['value'] + ': ';
      property_name_li.appendChild(property_name_span);
      property_name.appendChild(property_name_li);
      property_container.appendChild(property_name);

      const property_nomValue = document.createElement('div');
      property_nomValue.classList.add('property-value');
      const property_nomValue_li = document.createElement('li');
      const property_nomValue_span = document.createElement('span')
      property_nomValue_span.innerText = property['NominalValue']['value'];
      property_nomValue_li.appendChild(property_nomValue_span);
      property_nomValue.appendChild(property_nomValue_li);
      property_container.appendChild(property_nomValue);

      pset_container.appendChild(property_container);
      pset_container.appendChild(br);

    }
    explorer.appendChild(pset_container);

  });


}

function disposeModel(viewer) {
  viewer.dispose();
}

async function loadIfcViewer(url, viewer) {
  // Load the model
  const model = await viewer.IFC.loadIfcUrl(url,true);
  
    // Add dropped shadow and post-processing efect
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;
  //await viewer.plans.computeAllPlanViews(this.modelID);
  return model;
}

async function setUpMultiThreading(viewer) {
  const manager = viewer.IFC.loader.ifcManager;
  await manager.useWebWorkers(true, '../IFCWorker.js');
}

function setupProgressNotification(viewer) {
  const progressBar = document.getElementById("progress-bar");
  viewer.IFC.loader.ifcManager.setOnProgress((event) => {
    const percent = event.loaded / event.total * 100;
    const result = Math.trunc(percent);
    progressBar.setAttribute("style", "width:"+result+"%");
    if (result === 100) {
      setInterval(progressBar.setAttribute("style", "width:0%"), 2000);
    }
  })

  
}

function createModelBtn(name) {
  const myModelsExplorer = document.getElementById('my-models-explorer');
  const id = 'Model_'+name;


  const input = document.createElement('input');
  input.type = "checkbox";
  input.id = id;
  input.hidden = true;
  myModelsExplorer.appendChild(input);

  const label = document.createElement('label');
  label.classList.add('button');
  label.classList.add(id);
  label.setAttribute('for', id);

  const ionIcon = document.createElement('ion-icon');
  ionIcon.name = 'cube-outline';

  const span = document.createElement('span');
  span.classList.add('title');
  span.innerText = id;

  label.appendChild(ionIcon);
  label.appendChild(span);
  myModelsExplorer.appendChild(label);



  
}





export {Session, DataBase}