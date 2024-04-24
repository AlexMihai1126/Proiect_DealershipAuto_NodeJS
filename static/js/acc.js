window.addEventListener("DOMContentLoaded", function(){
    if(document.getElementById("nr_rez").innerHTML==0){
        document.getElementById("eroarePlaceholderRez").innerHTML=`<div class="alert alert-primary" role="alert">Nu exista rezervari</div>`;
        this.document.getElementById("rezervari_tabel").style.display="none";
    }
    if(document.getElementById("nr_m").innerHTML==0){
        document.getElementById("eroarePlaceholderM").innerHTML=`<div class="alert alert-primary" role="alert">Nu exista masini</div>`;
        this.document.getElementById("masini_tabel").style.display="none";
    }
});