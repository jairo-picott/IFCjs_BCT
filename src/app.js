import {
  Color, LineBasicMaterial, MeshBasicMaterial} from "three";
import {dimension, IfcViewerAPI} from "web-ifc-viewer";
import { IFCSPACE,
 } from "web-ifc";

const container = document.getElementById('viewer-container');
//const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

class Session{
  constructor(changed) {
    this.viewer = this.setInstance();
    new ifcViewer(this.viewer, changed);
    new UIEffects(this.viewer);
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

  propertiesMenu(viewer) {
    window.ondblclick = async () => {
      const result = await viewer.IFC.selector.highlightIfcItem();
      if (!result) return;
      const { modelID, id } = result;
      const props = await viewer.IFC.getProperties(modelID, id, true, false);
      console.log(props);
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
    
  }
}

//----------------------------------------/
//           FUNCTIONS
//----------------------------------------/
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

function createModelBtn(name,) {
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





export {Session}