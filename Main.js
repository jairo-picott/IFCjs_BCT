import { DataBase, Session} from "./src/app"; 

const ifcModel = "./model/Model.ifc";
//const scene = new setScene();


const input = document.getElementById("file-input");
input.addEventListener("change", async (changed) => {
    if (changed) {
        const model = new Session(changed);
        //const dataBase = new DataBase(model, input, changed);
    }
    
})




