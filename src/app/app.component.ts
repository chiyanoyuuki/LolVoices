import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import champions from '../assets/champions.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public start: boolean = false;
  public champs: { nom: string, other?: string }[] = champions.data;
  public randomChamps: { nom: string, other?: string }[] = [];
  public champActuel!: { nom: string, other?: string };
  public typing: string = "";
  public nbFound: number = -1;
  public timer: number = -0.5;
  public timer2: number = 0.5;
  public interval: any;
  public interval2: any;
  public pickMusic: any;
  public pause: boolean = false;
  public sound: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getData();
    this.setData();

    while (this.randomChamps.length < 10) {
      let rdm = Math.floor(Math.random() * this.champs.length);
      let champ = this.champs[rdm];
      if (!this.randomChamps.includes(champ)) this.randomChamps[this.randomChamps.length] = champ;
    }

    this.pickMusic = new Audio();
    this.pickMusic.loop = true;
    this.pickMusic.src = "./assets/pickMusic.mp3";
  }

  async setData() {
    this.http.post<any>("http://www.chiya-no-yuuki.fr/pickscoreUpload?nbgame=1&pseudo=ASC%20Arma%20TV&temps=28.5", { headers:new HttpHeaders({'Access-Control-Allow-Origin': '*'}),title: 'Angular POST Request Example' }).subscribe(data => {
        console.log("INSERT",data);
    })
  }

  async getData() {
    this.http.get<any>("http://www.chiya-no-yuuki.fr/pickscoreDownload",{headers:new HttpHeaders({'Access-Control-Allow-Origin': '*'})}).subscribe(data => {
        console.log("GET",data);
    })
  }

  @HostListener('window:keyup', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    if (event.key == "Control") {
      if (!(this.sound && !this.sound.paused))
        this.play();
    }
  }

  play() {
    this.sound.play();
  }

  newSound() {
    this.sound = new Audio();
    this.sound.src = "./assets/pick/" + this.champActuel.nom + ".wav";
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timer += 0.1;
    }, 100)
  }

  beginGame() {
    this.nbFound = -1;
    this.pause = false;
    this.start = true;
    this.startTimer();
    clearInterval(this.interval2);
    this.focus();
    this.good();
  }

  over() {

  }

  good() {
    if (this.nbFound == 9) {
      this.over();
    }
    else {
      if (this.sound) this.sound.pause();
      this.nbFound++;
      this.typing = "";
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
        this.beginGame();
      }
    }, 100)
  }

  clickStart() {
    this.pause = true;
    this.pickMusic.play();
    this.startTimer2();
  }


  validate() {
    let good: boolean = false;
    let typingtmp = this.format(this.typing);
    if (this.champActuel.other) {
      let othertmp = this.format(this.champActuel.other);
      console.log("other:", typingtmp, othertmp);
      if (typingtmp == othertmp) {
        good = true;
      }

    }

    let nomtmp = this.format(this.champActuel.nom);
    console.log("nom:", nomtmp, typingtmp);
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