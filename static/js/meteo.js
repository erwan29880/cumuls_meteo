// retourne un dataset = une courbe
function create_json_dataset(somme_cumulee, bw, pr, color, label, order){
    if(color != "blue") color = "#"+(Math.floor(Math.random()*16777215)).toString(16).toUpperCase();
    return {
        "type":"line",
        "fill":"true",
        "data":somme_cumulee,
        "borderWidth":bw,
        "pointRadius": pr,
        "pointHoverRadius": pr,
        "backgroundColor":color,
        "borderColor": color,
        "label":label.toString(),
        "order":order
    };
}

/*
calcul somme cumulée en fonction d'un décage de jours de 0 à 364
génère le json des datasets correspondant à chaque année en fonction du décalage
retourne toutes les courbes et un barplot 
*/
function generate_cum_sum(data, decalage, col){

    // décla variables 
    decalage = parseInt(decalage);
    let an = 2016; let inc=0; let somme=0; let maxi = 0; let order = 1;
    const idx = []; 
    const idx2 = [];
    const myDatasets = []; let somme_cumulee = [];
    let tm = data[0]; 
    let no_semaine = tm['aujdui']; 
    let doy = tm['dates'];
    let moyenne = tm['moyenne_temperature'];
    tm = tm[col];

    // changement de fenêtre en fonction du décalge de jours
    if(decalage!=0){
        if(decalage>=360) decalage=0;
        tm = tm.slice(decalage);
    }   

    // récupérer l'index du jour, en fonction du décalage
    for(let i=1+decalage;i<=365+decalage;i++){
        i<=365 ? idx.push(i.toString()) : idx.push((i-364).toString());
        i<=365 ? idx2.push(doy[i]) : idx2.push(doy[i-364]);
    }
     

    // création json des datasets
    for(let i=0;i<tm.length;i++){
        if(inc%365==0 && i!=0){
            inc=0;
            if(somme>maxi) maxi=somme;
            myDatasets.push(create_json_dataset(somme_cumulee, 1, 1, "notblue", an, order));
            an += 1; somme = 0; order++; somme_cumulee = [];
            if(i==tm.length-1) break;
        }
        inc++; somme+=tm[i]; somme_cumulee.push(somme);
        // dernier dataset, donc l'année en cours ou n-1 si décalage
        if(i==tm.length-2) myDatasets.push(create_json_dataset(somme_cumulee, 3, 3, "blue", an, null));
    }

    // affichage jour en cours
    const semaine = new Array(idx.indexOf(no_semaine.toString())).fill(""); semaine.push(maxi); 
    myDatasets.push({"type":"bar","fill":false,"data":semaine,"backgroundColor":"red","label":"semaine en cours","order":0});

    // création du json data à intégrer dans le json final
    return {
        "labels":idx2,
        "datasets": myDatasets
    }   
} // end generate_cum_sum


/* 
génération du json final
- data : json ou dictionnaire python 
- décalage : nombre de jour de 0 à 364 (ex : commencer le cumul au jour 50)
- col : tmin ou tmax
*/
function generate_graphe(data, decalage, col){
    
    let myText = "cumul de températures : moyenne des températures minimiales et maximales par jour"; 
    if(col == "tmin" || col == "tmax" || col == "pluie")
        myText = `cumul ${col.replace('t', 'T°C ')} à Cléder`;

    return {'type': 'bar',
            "data": generate_cum_sum(data, decalage, col),
            "options": {
                        "responsive": "false",
                        "interaction":{"intersect":"true",
                                    "mode":"index"
                                    },
                        "plugins": {
                            "title": {
                                "display": "true",
                                "text": myText
                            },
                            "legend": { 
                                "display": "true",
                                "position": "bottom" 
                            }
                        },
                        "scales": {
                            "y": {
                                "display":"true",
                                "ticks": {
                                    "min": 0,
                                    "beginAtZero": "true"
                                    },
                                "title":{
                                    "display": "true",
                                    "text": "t°C cumulée"
                                }
                            },
                        "x": {
                                "display":"true",
                                "ticks": {
                                    "min": 0,
                                    "beginAtZero": "true"
                                    },
                                "title":{
                                    "display": "true",
                                    "text": "jour de l'année"
                                }
                            }
                        }
                    }
            };
} // end generate_graphe 


// manipulation DOM et récupération données en ajax

var myChart = "";
var dat2 = "";
var canvas = document.getElementById("myChart3");
var ctx = canvas.getContext('2d');
var slider = document.getElementById("myRange2");
var variable_meteo = 'tmin'


async function firstGraph(){
    const url = "/1431766f-b5ce-4603-9e17-1de15d0e6c81"; 
    await fetch(url).then((prom) => prom.json()).then(function(d){
        dat2 = d;
        myChart = new Chart(ctx, generate_graphe(dat2, 0, variable_meteo));
    });
}

function genNewGraph(sliderValue){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    myChart.destroy(); 
    myChart = new Chart(ctx, generate_graphe(dat2, sliderValue, variable_meteo));
}

// changement graphique en fonction de la valeur du slider
slider.oninput = function(){
    document.getElementById("sel").value = this.value;
    genNewGraph(this.value);
}

// changement graphique en fonction du select
document.getElementById("sel").onchange = function(){
    slider.value = this.value;
    genNewGraph(this.value)
}

// changements en fonction des variables météo
document.getElementById("cum_sum_button1").addEventListener('click', function(){
    variable_meteo = "tmin";
    genNewGraph(0);
})

document.getElementById("cum_sum_button2").addEventListener('click', function(){
    variable_meteo = "tmax";
    genNewGraph(0);
})

document.getElementById("cum_sum_button3").addEventListener('click', function(){
    variable_meteo = "pluie";
    genNewGraph(0);
})

firstGraph();