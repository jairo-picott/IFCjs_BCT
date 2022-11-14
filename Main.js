import {Session, WeatherManager} from "./src/app"; 

const ifcModel = "./model/Model.ifc";
//const scene = new setScene();


const weatherManager = new WeatherManager('Braga');


const input = document.getElementById("file-input");
input.addEventListener("change", async (changed) => {
    if (changed) {
        const model = new Session(changed);
    }
    
})




