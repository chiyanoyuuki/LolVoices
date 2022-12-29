import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import champions from '../assets/champions.json';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public start: boolean = false;
  public champs: { nom: string, other?: string, code: string }[] = champions.data;
  public randomChamps: { nom: string, other?: string, code: string }[] = [];
  public champActuel!: { nom: string, other?: string, code: string };
  public typing: string = "";
  public nbFound: number = -1;
  public timer: number = 0;
  public timer2: number = 3;
  public interval: any;
  public interval2: any;
  public pickMusic: any;
  public best!: number;
  public overallBest!: number;
  public pause: boolean = false;
  public sound: any;
  public victory: any;
  public end!: boolean;
  public newRecord!: number;
  public nomJoueur = "";
  public pick_en: { id: number, nbgame: number, pseudo: string, temps: number, lastgame: string }[] = [];
  public pick_fr: { id: number, nbgame: number, pseudo: string, temps: number, lastgame: string }[] = [];
  public page = "start";
  public typeGame = "Pick Français";
  public pass = 3;

  public debug = false;

  public headers!: HttpHeaders;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getData();
    this.pickMusic = new Audio();
    this.pickMusic.loop = true;
    this.pickMusic.src = "./assets/pickMusic.mp3";
    this.pickMusic.volume = 0.4;
    this.victory = new Audio();
    this.victory.src = "./assets/victory.wav";
  }

  async newRecordd() {
    if (this.debug) return;
    console.log("newRecord");
    let langue = this.typeGame == "Pick Anglais" ? "en" : "fr";
    from(
      fetch(
        "https://www.chiya-no-yuuki.fr/pick_" + langue + "_record?pseudo=" + this.nomJoueur.replaceAll(" ", "%20") + "&temps=" + this.timer.toFixed(1),
        {
          body: "",
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'no-cors'
        }
      ).then(res => { this.getData(); })
    );
  }

  async addGame() {
    if (this.debug) return;
    console.log("addGame");
    let langue = this.typeGame == "Pick Anglais" ? "en" : "fr";
    from(
      fetch(
        "https://www.chiya-no-yuuki.fr/pick_" + langue + "_addgame?pseudo=" + this.nomJoueur.replaceAll(" ", "%20"),
        {
          body: "",
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'no-cors'
        }
      ).then(res => { this.getData(); })
    );
  }

  async newData() {
    if (this.debug) return;
    console.log("newData");
    let langue = this.typeGame == "Pick Anglais" ? "en" : "fr";
    from(
      fetch(
        "https://www.chiya-no-yuuki.fr/pick_" + langue + "_insert?nbgame=1&pseudo=" + this.nomJoueur.replaceAll(" ", "%20") + "&temps=" + this.timer.toFixed(1),
        {
          body: "",
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'no-cors'
        }
      ).then(res => { this.getData(); })
    );
  }

  async getData() {
    if (this.debug) return;
    console.log("getData");
    this.http.get<any>("https://www.chiya-no-yuuki.fr/pick_en_select").subscribe(data => { this.pick_en = data; this.pick_en.sort((a: any, b: any) => { return a.temps < b.temps ? -1 : 1; }); })
    this.http.get<any>("https://www.chiya-no-yuuki.fr/pick_fr_select").subscribe(data => { this.pick_fr = data; this.pick_fr.sort((a: any, b: any) => { return a.temps < b.temps ? -1 : 1; }); })
  }

  @HostListener('window:keyup', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    if (this.start) {
      if (event.key == "Control") {
        if (!(this.sound && this.sound.currentTime < 1))
          this.play();
      }
      else if (event.key == "Tab" && this.pass > 0) {
        this.passer();
      }
      else if (event.key == "Escape") {
        this.clickReplay();
      }
    }
  }

  public clickMenu() {
    this.pickMusic.currentTime = 0;
    this.pickMusic.pause();
    if (this.sound) this.sound.pause();
    if (!this.end) {
      let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
      if (this.typeGame == "Pick Français") { exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur); }
      if (exists) { this.addGame(); }
      this.getData();
    }
    this.end = false;
    this.page = 'start'
  }

  public topText() {
    if (this.invalidName()) return "Pseudo invalide";
    if (this.end) {
      if (this.newRecord != -1) return "Record battu : " + this.newRecord + "s gagnées";
      else return "Bien joué !"
    }
    else if (this.page == "start") { return "Choisissez un mode de jeu" }
    else if (this.page == "pause") { return "Attention ! La partie va commencer !" }
    else if (this.page == "jeu") {
      if (this.overallBest && this.timer < this.overallBest) return "Record mondial";
      else if (this.best && this.timer < this.best) return "Record personnel";
      else if (this.best && this.timer >= this.best) return "Pour le beau jeu";
      else return (10 - this.nbFound) + " personnages restants";
    }
    else
      return "&nbsp;";
  }

  public invalidName() {
    let rgx = /^[a-zA-Z0-9 \-\_]{3,16}$/g;
    let res = this.nomJoueur.match(rgx);
    if (res && res[0] == this.nomJoueur) return false;
    return true;
  }

  passer() {
    this.pass--;
    this.timer += 10;
    this.good();
  }

  play() {
    this.sound.currentTime = 0;
    this.sound.play();
  }

  newSound() {
    this.sound = new Audio();
    this.sound.src = "./assets/pick/" + (this.typeGame == "Pick Anglais" ? "en" : "fr") + "/" + this.champActuel.code + ".wav";
  }

  getTop(i: number) {
    if (i < 5) {
      return (119 + 90 * i) + 'px';
    }
    else {
      return (119 + 90 * (i - 5)) + 'px';
    }
  }

  getLeft(i: number) {
    if (i < 5) return 31 + "px";
    else return 1347 + "px";
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timer += 0.1;
    }, 100)
  }

  beginGame() {
    this.pass = 3;
    this.end = false;
    this.newRecord = -1;
    this.timer = 0;
    this.timer2 = 3;
    this.nbFound = -1;
    this.pause = false;
    this.start = true;
    this.startTimer();
    clearInterval(this.interval2);
    this.focus();
    this.good();
  }

  over() {
    this.victory.play();
    this.pickMusic.currentTime = 0;
    this.pickMusic.pause();
    let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
    if (this.typeGame == "Pick Français") { exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur); }
    if (!exists) { this.newData(); }
    else if (this.timer < this.best) { this.newRecord = this.best - this.timer; this.newRecordd(); }
    else { this.addGame(); }
    this.typing = "";
    this.end = true;
    clearInterval(this.interval);
  }

  good() {
    this.nbFound++;
    if (this.nbFound == 10) {
      if (this.sound) this.sound.pause();
      this.over();
    }
    else {
      if (this.sound) this.sound.pause();
      this.champActuel = this.randomChamps[this.nbFound];
      this.newSound();
      this.sound.play();
    }

  }

  focus() {
    let el = document.getElementById("typeBar");
    if (el) {
      el.focus();
    }
  }

  startTimer2() {
    this.interval2 = setInterval(() => {
      this.timer2 -= 0.1;
      if (this.timer2 <= 0.1) {
        this.page = "jeu";
        this.beginGame();
      }
    }, 100)
  }

  getColor() {
    if (this.overallBest && this.timer < this.overallBest) return "#c5c900";
    if (this.best && this.timer > this.best) return "red";
    if (!this.best) return "white";
    return "green";
  }

  clickReplay() {
    this.nbFound = 0;
    if (this.sound) this.sound.pause();
    if (!this.end) {
      let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
      if (this.typeGame == "Pick Français") { exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur); }
      if (exists) { this.addGame(); }
      this.getData();
    }
    this.end = false;
    this.clickStart()
  }

  clickStart() {
    clearInterval(this.interval);
    this.pickMusic.currentTime = 0;
    this.page = "pause";
    if (this.typeGame == "Pick Français" && this.pick_fr[0]) this.overallBest = this.pick_fr[0].temps;
    else if (this.typeGame == "Pick Anglais" && this.pick_en[0]) this.overallBest = this.pick_en[0].temps;
    let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
    if (this.typeGame == "Pick Français") { exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur); }
    if (exists) {
      this.best = exists.temps;
    }
    this.randomChamps = [];
    while (this.randomChamps.length < 10) {
      let rdm = Math.floor(Math.random() * this.champs.length);
      let champ = this.champs[rdm];
      if (!this.randomChamps.includes(champ)) this.randomChamps[this.randomChamps.length] = champ;
    }
    this.pause = true;
    this.pickMusic.play();
    this.startTimer2();
  }


  validate() {
    let good: boolean = false;
    let typingtmp = this.format(this.typing);
    if (this.champActuel.other) {
      let othertmp = this.format(this.champActuel.other);
      if (typingtmp == othertmp) {
        good = true;
      }

    }

    let nomtmp = this.format(this.champActuel.nom);
    if (nomtmp == typingtmp) {
      good = true;
    }

    this.typing = "";
    if (good) { this.good(); }
  }

  format(s: string) {
    s = s.toLowerCase();
    s = s.replaceAll("\.", "");
    s = s.replaceAll("_", "");
    s = s.replaceAll(" ", "");
    s = s.replaceAll("-", "");
    s = s.replaceAll("'", "");
    return s;
  }
}