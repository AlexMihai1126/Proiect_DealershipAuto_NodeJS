const sass = require('sass');
const fs = require("fs");
const path = require('path');

var fileNameTS = null;

var folderScss = path.join(__dirname, "static/scss");
var folderCss = path.join(__dirname, "/static/css");
var folderBkp = path.join(__dirname, "bkp");

var saveCssBackups = 0;

function getCurrentDate() {
    var time = new Date().getTime();
    var date = new Date(time);
    var timeStampVector = date.toString().split(" ");
    var dateTimeSec = timeStampVector[4].split(":");
    return fileNameTS = "_" + timeStampVector[1] + "_" + timeStampVector[2] + "_" + timeStampVector[3] + "_" + dateTimeSec[0] + "_" + dateTimeSec[1] + "_" + dateTimeSec[2];
}

getCurrentDate();

function compileScss(pathScss, reason, pathCss) {
    if (!pathCss) {
        let extPathScss = path.basename(pathScss); //luam numele fisierului in var separata
        let currentFileScss = extPathScss.split(".")[0]; //luam numele fisierului fara extensie pt a crea cel cu .css
        pathCss = currentFileScss + ".css"; //adaugam extensia .css la fisier
    }

    if (!path.isAbsolute(pathScss)) {
        pathScss = path.join(folderScss, pathScss);
    }

    if (!path.isAbsolute(pathCss)) {
        pathCss = path.join(folderCss, pathCss);
    }

    if (fs.existsSync(pathCss) && saveCssBackups == 1) {
        let pathBkp = path.parse(pathCss).name + fileNameTS + "_" + reason + ".css";
        if (!fs.existsSync(folderBkp)) {
            fs.mkdirSync(folderBkp);
        }
        fs.copyFileSync(pathCss, path.join(folderBkp, pathBkp));
        console.log("Creare fisier backup in folderul", folderBkp, "fisierul", pathBkp);
    }

    let rez = sass.compile(pathScss, { "sourceMap": true });
    fs.writeFileSync(pathCss, rez.css);
    console.log("Fisierul SCSS", pathScss, "a fost compilat in", pathCss);
}

let scssFiles = fs.readdirSync(folderScss);
for (let fileName of scssFiles) {
    if (path.extname(fileName) == ".scss") {
        compileScss(fileName, "startup");
    }
}

process.exit();