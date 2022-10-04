import {
  Color, LineBasicMaterial, MeshBasicMaterial} from "three";
import {IfcViewerAPI} from "web-ifc-viewer";
import { IFCSPACE,
 } from "web-ifc";



class loadModel{
  constructor() {
    const container = document.getElementById('viewer-container');
    this.viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
    this.model = this.ifcViewer();
  }

  ifcViewer() {
    var model;
    const modelID = 0;
    this.viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
      [IFCSPACE]: false,
    });
    setUpMultiThreading(this.viewer);
    setupProgressNotification(this.viewer);

    // Create axes
    this.viewer.axes.setAxes();

    const input = document.getElementById("file-input");
    const models = document.querySelector(".models");
    
    input.addEventListener("change", async (changed) => {
      const ifcURL = URL.createObjectURL(changed.target.files[0]);
      model = await loadIfcViewer(ifcURL,this.viewer);
      modelID = model.modelID;
      //console.log('Preprocesing BIm data');
      /*
      const result = await this.viewer.IFC.properties.serializeAllProperties(model);
      //----------
      // Download the properties as JSON file
      const file = new File(result, 'properties');
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.href = URL.createObjectURL(file);
      link.download = 'properties.json';
      link.click();
      link.remove();
      console.log('Preprocesing BIm data: DONE!');*/
    })

    models.addEventListener("click", function() {
    
    })
    

    /*
    window.ondblclick = async () => { 
      const result =  await this.viewer.IFC.selector.pickIfcItem();
      if(!result) return;
      const {modelID, id} = result;
      const props = await viewer.IFC.getProperties(modelID, id, true, true);
      console.log(props);
    }*/

    return model;

  }
  
}

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

class buttonsActions extends loadModel{
  constructor(viewer) {
    super(viewer,viewer);
    this.buttons(this.viewer);
  }

  buttons(viewer) {
    const dimensions = document.getElementById("dimensions");
    dimensions.addEventListener("click", function() {
      if (dimensions.checked) {
        document.querySelector('.dimensions').classList.add('button-active');
        viewer.dimensions.active = true;
        viewer.dimensions.previewActive = true;
      } else {
        document.querySelector('.dimensions').classList.remove('button-active');
        viewer.dimensions.active = false;
        viewer.dimensions.previewActive = false;
      }
    })

    window.ondblclick = () => {

      if (viewer.dimensions.active) {
        viewer.dimensions.create();
      }
    }

    window.onkeydown = (event) => {
      if (viewer.dimensions.active) {
        if (event.code === 'Delete') {
          viewer.dimensions.delete();
        }
      }
    }
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

async function serializeProperties(viewer, model) {
  const result = await viewer.IFC.properties.serializeAllProperties(model);
  return result;
}





export {loadModel, PlanViewMode, buttonsActions, preprocData}