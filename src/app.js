import {
  Color, LineBasicMaterial, MeshBasicMaterial} from "three";
import {dimension, IfcViewerAPI} from "web-ifc-viewer";
import { IFCSPACE,
 } from "web-ifc";

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

class loadModel{
  constructor() {
    this.model = this.ifcViewer();
    this.dimensionTool();
  }

  ifcViewer() {
    console.log('test times executed');
    var model;
    const modelID = 0;
    viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
      [IFCSPACE]: false,
    });
    setUpMultiThreading(viewer);
    setupProgressNotification(viewer);

    // Create axes
    viewer.axes.setAxes();

    const input = document.getElementById("file-input");
    const models = document.querySelector(".models");
    
    input.addEventListener("change", async (changed) => {
      const ifcURL = URL.createObjectURL(changed.target.files[0]);
      model = await loadIfcViewer(ifcURL,viewer);
      modelID = model.modelID;
    })
    /*
    window.ondblclick = async () => { 
      const result =  await viewer.IFC.selector.pickIfcItem();
      if(!result) return;
      const {modelID, id} = result;
      const props = await viewer.IFC.getProperties(modelID, id, true, true);
      console.log(props);
    }*/

    return model;

  }

  dimensionTool() {
    //--------------------
    viewer.dimensions.active = true;
    viewer.dimensions.previewActive = true;
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
  
}

class UIEffects{
  constructor() {
    this.buttonsEffects();
  }

  buttonsEffects() {
    const dimensions = document.getElementById("dimensions");
    
    dimensions.addEventListener("click", function() {
      if (dimensions.checked) {
        document.querySelector('.dimensions').classList.add('button-active');
      } else {
        document.querySelector('.dimensions').classList.remove('button-active');
      }
    })
  }
}
/*
class PlanViewMode extends loadModel{
  constructor(viewer) {
   super(viewer, viewer);
  }

  async plans() {
    const lineMaterial = new LineBasicMaterial({color: 'black'});
    const baseMaterial = new MeshBasicMaterial({
      polygonOffset:true,
      polygonOffserFactor: 1,
      polygonOffsetUnits: 1
    })

    
  }
}

class preprocData extends loadModel{
  constructor(viewer) {
    super(viewer, viewer)
    this.getData();
  }

  getData(){
    
  }
}
*/
//----------------------------------------/
//           FUNCTIONS
//----------------------------------------/


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





export {loadModel, UIEffects}