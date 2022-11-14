import {
  Color} from "three";
import {IfcViewerAPI} from "web-ifc-viewer";
import { 
  IFCSPACE } from "web-ifc";
import { IfcAPI } from "web-ifc/web-ifc-api";

var models = [];
var index;


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
    //this.disposeViewer(viewer, container);
    this.model = this.ifcViewer(viewer, changed);
    this.EventHandler(viewer);
  }

  EventHandler(viewer) {
    viewer.clipper.active = true;
    const plane = document.getElementById('plane'); 

    //--------------------
    viewer.dimensions.active = true;
    viewer.dimensions.previewActive = false;
    const dimensions = document.getElementById("dimensions");

    //-------------------------
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
        console.log(props);
        console.log('This is the pset Name:' + props['psets']['0']['Name']['value']);
        loadProperties(props);
        viewer.IFC.selector.unpickIfcItems();
      }
      
    };

    window.ondblclick = () => {
      if (dimensions.checked) {
        viewer.dimensions.create();
      } else if (plane.checked) {
        viewer.clipper.createPlane();
      } else {
        
      }
    }

    window.onkeydown = (event) => {
        
      if(event.code === 'Delete') {
        viewer.dimensions.delete();
        viewer.clipper.deletePlane();
      }
        
    }
  }


  async ifcViewer(viewer, changed) {
    
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

    models.push(model);

    console.log(model_name);
    return model;

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

class WeatherManager{
  constructor(city) {
    this.GetWeather(city);
  }

  async GetWeather(city) {
    const weather = await getWeatherData("GET", city);
    const responseCode = weather.cod;
    const dateTime = document.getElementById('weather-date-time p');

    if (responseCode === 200) {
      displayWeather(weather);
      var intervalId = window.setInterval(function(){
        displayWeather(weather);
      }, 60000);
      
    } else {
      console.log('The weather could not be loaded, error code ' + weather.cod);
    }
  }
}




//----------------------------------------/
//           FUNCTIONS
//----------------------------------------/
function displayWeather (weather) {
  const iconElement = document.getElementById('weather-icon-img');
  const tempElement = document.querySelector('.weather-temperature-value p');
  const descElement = document.querySelector('.weather-temperature-description p');
  const locationElement = document.querySelector('.weather-location p');
  const feelsLikeDescription = document.querySelector('.weather-feels-like p');
  const windPressure = document.querySelector('.weather-wind-pressure p');
  const humidityVisibility = document.querySelector('.weather-humidity-visibility p');
  const dateTime = document.querySelector('.date-time p');
  var currentDate = new Date();

  iconElement.setAttribute('src', "http://openweathermap.org/img/w/" + weather.weather.icon + ".png");
  tempElement.innerText = weather.main.temp + '°C';
  descElement.innerText = weather.weather.description;
  locationElement.innerText = weather.city + ', ' + weather.sys.country;
  feelsLikeDescription.innerText = 'Feels like: ' + weather.main.feels_like + '°C'; 
  windPressure.innerText = 'Wind: ' + weather.wind.speed + 'm/s ' + windDirectionToString(weather.wind.deg) + ', Pressure:' + weather.main.pressure + 'mPa';
  humidityVisibility.innerText = 'Humidity: ' + weather.main.humidity + '%, Visibility: ' + weather.visibility/1000 + 'Km';

}

function windDirectionToString(deg) {
    
  var degStr;
  if (deg >= 0 && deg < 22.5 ) {
      degStr = 'N';
  } else if (deg >= 22.5 && deg < 67.5) {
      degStr = 'NE';
  } else if (deg >= 67.5 && deg < 112.5) {
      degStr = 'E';
  } else if (deg >= 112.5 && deg < 157.5) {
      degStr = 'SE';
  } else if (deg >= 157.5 && deg < 202.5) {
      degStr = 'S';
  } else if (deg >= 202.5 && deg < 247.5) {
      degStr = 'SW';
  } else if (deg >= 247.5 && deg < 292.5) {
      degStr = 'W';
  } else if (deg >= 292.5 && deg < 337.5) {
      degStr = 'NW';
  } else if (deg >= 337.5 && deg <= 360) {
      degStr = 'N';
  }

  return degStr;
}

async function getWeatherData(method, city) {
  let url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=c81ac3256fda648135a8832648f65b8e&units=metric";
  var requestOptions = {
    method: method,
    redirect: 'follow'
  };

  var obj;
  var requestResult;

  const request = await fetch(url, requestOptions)
  .then(response => response.json())
  .then(data => obj = data)
  .then(result => requestResult = result)
  .catch(error => console.log('error', error));

  // Load data from the request into weather Object
  const weather = {
    cod: requestResult['cod'],
    weather: {
        main: requestResult['weather']['0']['main'],
        description: requestResult['weather']['0']['description'],
        icon: requestResult['weather']['0']['icon']
    },
    main: {
        temp: requestResult['main']['temp'],
        feels_like: requestResult['main']['feels_like'],
        temp_min: requestResult['main']['temp_min'],
        temp_max: requestResult['main']['temp_max'],
        pressure: requestResult['main']['pressure'],
        humidity: requestResult['main']['humidity']
    },
    visibility: requestResult['visibility'],
    wind: {
        speed: requestResult['wind']['speed'],
        deg: requestResult['wind']['deg']
    },
    clouds: {
        all: requestResult['clouds']['all']
    },
    sys: {
        country: requestResult['sys']['country']
    },
    timezone: requestResult['timezone'],
    city: requestResult['name']
  }
  //console.log(weather);
  return weather;

}

/*
function createModelButton(model, model_name, viewer) {
    //-----------Model
    const id = 'model-' + model.modelID;
    const models_explorer = document.getElementById('my-models-explorer');

    const input = document.createElement('input');
    const label = document.createElement('label');

    input.type = 'chekbox';
    input.id = id;
    input.hidden = true;

    label.setAttribute('for', id);
    label.classList.add('button');
    label.classList.add(id);

    const icon = document.createElement('ion-icon');
    icon.name = 'business-outline';
    label.appendChild(icon);

    const span = document.createElement('span');
    span.classList.add('title');
    span.innerText = model_name;
    label.appendChild(span);

    models_explorer.appendChild(input);
    models_explorer.appendChild(label);

    //---------------Trash
    const id_t = 'trash-' + model.modelID;

    const input_t = document.createElement('input');
    const label_t = document.createElement('label');

    input_t.type = 'chekbox';
    input_t.id = id_t;
    input_t.hidden = true;

    label_t.setAttribute('for', id_t);
    label_t.classList.add('button');
    label_t.classList.add(id_t);

    const t_icon = document.createElement('ion-icon');
    t_icon.name = 'trash-outline';
    label_t.appendChild(t_icon);

    const t_span = document.createElement('span');
    t_span.classList.add('title');
    t_span.innerText = 'Remove';
    label_t.appendChild(t_span);

    models_explorer.appendChild(input_t);
    models_explorer.appendChild(label_t);

    //----------- Events
    input_t.addEventListener('click', function() {
      disposeModel(viewer, id);
      //console.log('dispose')
    })

    input.addEventListener('click', function() {
      if (input.checked) {
        
      }
    })
    

  }*/

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
      property_name_span.innerText =property['Name']['value'] + ': ';
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

function DecodeIFCString (ifcString) {
  const ifcUnicodeRegEx = /\\X2\\(.*?)\\X0\\/;
  let resutlString = ifcString;
  let match = ifcUnicodeRegEx.exec(ifcString);
  while(match) {
    const unicodeChart = String.fromCharCode (parseInt (match[1], 16));
    resutlString = resutlString.replace (match[0], unicodeChart);
    match = ifcUnicodeRegEx.exec(ifcString);
  }
  return resutlString;
}

function disposeModel(viewer, id) {
  viewer.dispose();
  viewer = null;
  try{
    const input = document.getElementById('file-input');
    input.value = '';
  } catch (e) {console.log(e)}

  
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
  await manager.useWebWorkers(true, './IFCWorker.js');
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






export {Session, WeatherManager}