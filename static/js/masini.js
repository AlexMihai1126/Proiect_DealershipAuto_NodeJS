function rstErr(){
    document.getElementById("eroarePlaceholder").innerHTML="";
} //reseteaza erorile

function rst(){
    var conf= confirm("Doresti sa resetezi filtrele?");
    if(conf){
        rstErr();
        var masini = document.getElementsByClassName("masini");
        for (let masina of masini){
            masina.style.display = "block";
        }
        document.getElementById("inp_pret").value=document.getElementById("inp_pret").max;
        document.getElementById("inp_km").value=document.getElementById("inp_km").max;
        document.getElementById("inp_brand").value="";
        document.getElementById("pret_range").innerHTML = `(${document.getElementById("inp_pret").max})`
        document.getElementById("km_range").innerHTML = `(${document.getElementById("inp_km").max})`
      
    }
    
} 
function filtrare(){
    rstErr();

    let val_pret = document.getElementById("inp_pret").value;
    let val_km = document.getElementById("inp_km").value;
    let val_brand = document.getElementById("inp_brand").value;

    var masini = document.getElementsByClassName("masini");
    let nr_rez=0;
    for (let masina of masini){
        masina.style.display = "none";
        let pret_masina = parseInt(masina.getElementsByClassName("val_pret")[0].innerHTML);
        let brand_masina = masina.getElementsByClassName("val_brand")[0].innerHTML;
        let km_masina = parseInt(masina.getElementsByClassName("val_km")[0].innerHTML);
        console.log("brand masina: ",brand_masina);
        console.log("pret masina: ",pret_masina);
        console.log("km masina: ",km_masina);
        let cond_pret = (val_pret>=pret_masina);
        let cond_km = (val_km >= km_masina);
        let cond_tip = (val_brand == brand_masina || val_brand == "");
        // console.log("brand ales: ",val_brand);
        // console.log("pret ales: ",val_pret);
        // console.log("km ales: ",val_km);
       
        if(cond_pret && cond_tip && cond_km){
            masina.style.display = "block";
            nr_rez+=1;
        } //aplicam filtrele
    }

    if(nr_rez==0){
        document.getElementById("eroarePlaceholder").innerHTML=`<div class="alert alert-danger" role="alert">Nu exista rezultate conform filtrelor!</div>`;
    }

}

function sorteaza(semn){
    var masini=document.getElementsByClassName("masini");
    var v_masini=Array.from(masini); //transformam in vector static si aplicam metode pt vector

    v_masini.sort(function(a,b){
        var pret_a=parseFloat(a.getElementsByClassName("val_pret")[0].innerHTML);
        var pret_b=parseFloat(b.getElementsByClassName("val_pret")[0].innerHTML);
        if(pret_a==pret_b){
            var brand_a=a.getElementsByClassName("val_brand")[0].innerHTML;
            var brand_b=b.getElementsByClassName("val_brand")[0].innerHTML;
            return semn*brand_a.localeCompare(brand_b); //-1 0 1 returneaza (ca in C)
        } 
        return (pret_a-pret_b)*semn; //functie comparator
    })
    for (let masina of v_masini){
        masina.parentNode.appendChild(masina);
    }      
}

window.addEventListener("DOMContentLoaded", function(){
    if(document.getElementById("nr_masini").innerHTML==0){
        document.getElementById("eroarePlaceholder").innerHTML=`<div class="alert alert-danger" role="alert">Nu exista rezultate</div>`;
        this.document.getElementById("optiuni").style.display="none";
    }
    document.getElementById("pret_range").innerHTML = `(${document.getElementById("inp_pret").max})`;
    document.getElementById("km_range").innerHTML = `(${document.getElementById("inp_km").max})`;
    document.getElementById("filtrare").onclick = filtrare;
    document.getElementById("sortCrescPret").onclick=function(){
        sorteaza(1);
    }
    document.getElementById("sortDescrescPret").onclick=function(){
        sorteaza(-1);
    }
    document.getElementById("rst").onclick = rst;
});

window.addEventListener("change", function(){
    document.getElementById("inp_brand").onchange = filtrare;
    document.getElementById("inp_pret").onchange = function(){
        document.getElementById("pret_range").innerHTML = `(${this.value})`;
        filtrare();
    }//update valoare afisata input range
    document.getElementById("inp_km").onchange = function(){
        document.getElementById("km_range").innerHTML = `(${this.value})`;
        filtrare();
    }
});