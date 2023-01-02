import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit, isDevMode, LOCALE_ID } from '@angular/core';
import { environment } from 'src/environments/environment';
import champions from '../assets/champions.json';
import { formatDate } from '@angular/common';
import { from } from 'rxjs';
import { Data } from './model';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
  ]
})
export class AppComponent implements OnInit {
  public start: boolean = false;
  public champs: { nom: string; other?: string; code: string }[] =
    champions.data;
  public randomChamps: { nom: string; other?: string; code: string }[] = [];
  public champActuel!: { nom: string; other?: string; code: string };
  public typing: string = '';
  public nbFound: number = -1;
  public timer: number = 0;
  public timer2: number = 3;
  public interval: any;
  public interval2: any;
  public pickMusic: any;
  public best!: number;
  public overallBest!: number;
  public pause: boolean = false;
  public victory: any;
  public end!: boolean;
  public newRecord!: number;
  public checkpoints: any = [];
  public nomJoueur = '';
  public audios: any = [];
  public allData: Data[] = [];
  public pick_en: Data[] = [];
  public pick_fr: Data[] = [];
  public ban_en: Data[] = [];
  public ban_fr: Data[] = [];
  public data: Data[] = [];
  public page = 'start';
  public typeGame = 'Pick Français';
  public actualData: any;
  public nbGames = 0;
  public classement: { pseudo: string, score: number, actif?: boolean }[] = [];
  public creatures = [
    'Gromp',
    'Scuttle Crab',
    'Raptor',
    'Fire Dragon',
    'Baron Nashor',
    'Wolf',
    'Blue buff',
    'Golem',
    'Earth Drake',
    'Red Buff',
  ];
  public debugData = [
    {
      id: 1,
      nbgame: 617,
      pseudo: 'Charles',
      temps: 17.5,
      lastgame: '2023-01-02 17:01:56',
      checkpoints: [1.8, 3.5, 5.3, 7, 8.8, 10.5, 12.3, 14, 15.8, 17.5],
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 3,
      nbgame: 354,
      pseudo: 'Yet',
      temps: 18.8,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [1.9, 3.8, 5.6, 7.5, 9.4, 11.3, 13.2, 15, 16.9, 18.8],
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 6,
      nbgame: 629,
      pseudo: 'Yozz',
      temps: 18.9,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [1.9, 3.8, 5.7, 7.6, 9.4, 11.3, 13.2, 15.1, 17, 18.9],
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 9,
      nbgame: 946,
      pseudo: 'Paul',
      temps: 22.3,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [2.2, 4.5, 6.7, 8.9, 11.2, 13.4, 15.6, 17.8, 20.1, 22.3],
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 14,
      nbgame: 110,
      pseudo: 'Hyrolia',
      temps: 24.6,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [2.5, 4.9, 7.4, 9.8, 12.3, 14.8, 17.2, 19.7, 22.1, 24.6],
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 2,
      nbgame: 271,
      pseudo: 'Beta',
      temps: 24.8,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [2.5, 5, 7.4, 9.9, 12.4, 14.9, 17.4, 19.8, 22.3, 24.8],
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 18,
      nbgame: 2,
      pseudo: 'Test',
      temps: 73.6,
      lastgame: '2022-12-31 08:47:19',
      checkpoints: '[10.1,19.9,30.9,40.0,49.9,60.0,62.6,65.6,69.5,73.6]',
      type: "pick",
      langue: "fr",
      lastgametext:"",
    },
    {
      id: 24,
      nbgame: 30,
      pseudo: 'Charles',
      temps: 20.7,
      lastgame: '2023-01-01 12:12:04',
      checkpoints: '[1.8,3.3,5.6,8.2,10.7,12.4,14.3,15.8,18.6,20.7]',
      type: "pick",
      langue: "en",
      lastgametext:"",
    },
    {
      id: 24,
      nbgame: 30,
      pseudo: 'Yet',
      temps: 22.7,
      lastgame: '2022-12-31 12:12:04',
      checkpoints: '[1.8,3.3,5.6,8.2,10.7,12.4,14.3,15.8,18.6,20.7]',
      type: "ban",
      langue: "en",
      lastgametext:"",
    },
    {
      id: 24,
      nbgame: 30,
      pseudo: 'Yozz',
      temps: 22.7,
      lastgame: '2023-01-02 15:05:04',
      checkpoints: '[1.8,3.3,5.6,8.2,10.7,12.4,14.3,15.8,18.6,20.7]',
      type: "ban",
      langue: "fr",
      lastgametext:"",
    }
  ];
  public debug = false;

  public headers!: HttpHeaders;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.debug = isDevMode();
    if (this.debug) {
      this.allData = this.debugData;
      this.pick_fr = this.allData.filter((dat: Data) => dat.type == "pick" && dat.langue == "fr");
      this.pick_en = this.allData.filter((dat: Data) => dat.type == "pick" && dat.langue == "en");
      this.ban_fr = this.allData.filter((dat: Data) => dat.type == "ban" && dat.langue == "fr");
      this.ban_en = this.allData.filter((dat: Data) => dat.type == "ban" && dat.langue == "en");
      this.nbGames = this.getNbGames();
      this.getLastGame();
      this.checkPresence();
      this.changeData();
      this.checkValues();
      this.getClassements();
      this.nomJoueur = this.data[0].pseudo;
    }
    this.getData();
    this.pickMusic = new Audio();
    this.pickMusic.src = './assets/pickMusic.mp3';
    this.pickMusic.volume = 0.4;
    this.victory = new Audio();
    this.victory.src = './assets/victory.wav';
  }

  public getClassements() {
    this.classement = [];
    let tmp: string[] = [];
    for (let i = 0; i < this.allData.length; i++) {
      let pseudo = this.allData[i].pseudo;
      if (!tmp.includes(pseudo)) {
        tmp.push(pseudo);
        let joueur = { pseudo: pseudo, score: 0, actif: this.allData[i].actif }
        for (let x = 0; x < this.pick_fr.length; x++) { if (this.pick_fr[x].pseudo == pseudo) { joueur.score += 9 - (x>8?8:x) } }
        for (let x = 0; x < this.pick_en.length; x++) { if (this.pick_en[x].pseudo == pseudo) { joueur.score += 9 - (x>8?8:x) } }
        for (let x = 0; x < this.ban_fr.length; x++) { if (this.ban_fr[x].pseudo == pseudo) { joueur.score += 9 - (x>8?8:x) } }
        for (let x = 0; x < this.ban_en.length; x++) { if (this.ban_en[x].pseudo == pseudo) { joueur.score += 9 - (x>8?8:x) } }
        this.classement.push(joueur);
      }
    }
    this.classement.sort((a: any, b: any) => { return b.score - a.score });
  }

  public checkValues() {
    for (let i = 0; i < this.allData.length; i++) {
      if (typeof this.allData[i].checkpoints == 'string') {
        this.allData[i].checkpoints = JSON.parse(this.allData[i].checkpoints);
      }
    }
  }

  public changeData() {
    if (this.typeGame == 'Pick Anglais') this.data = this.pick_en;
    else if (this.typeGame == 'Pick Français') this.data = this.pick_fr;
    else if (this.typeGame == 'Ban Anglais') this.data = this.ban_en;
    else if (this.typeGame == 'Ban Français') this.data = this.ban_fr;
  }

  async newRecordd() {
    if (this.debug) return;
    console.log('newRecord');
    let langue = this.typeGame.endsWith("Anglais") ? 'en' : 'fr';
    let type = this.typeGame.startsWith("Ban") ? 'ban' : 'pick';
    from(
      fetch(
        'https://www.chiya-no-yuuki.fr/record?pseudo=' +
        this.nomJoueur.replaceAll(' ', '%20') +
        '&temps=' +
        this.timer.toFixed(1) +
        '&checkpoints="[' +
        this.checkpoints +
        ']"' +
        "&type=" + type +
        "&langue=" + langue,
        {
          body: '',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'no-cors',
        }
      ).then((res) => {
        this.getData();
      })
    );
  }

  async addGame() {
    if (this.debug) return;
    console.log('addGame');
    let langue = this.typeGame.endsWith("Anglais") ? 'en' : 'fr';
    let type = this.typeGame.startsWith("Ban") ? 'ban' : 'pick';
    from(
      fetch(
        'https://www.chiya-no-yuuki.fr/addgame?pseudo=' +
        this.nomJoueur.replaceAll(' ', '%20') +
        "&type=" + type +
        "&langue=" + langue,
        {
          body: '',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'no-cors',
        }
      ).then((res) => {
        this.getData();
      })
    );
  }

  async newData() {
    if (this.debug) return;
    console.log('newData');
    let langue = this.typeGame.endsWith("Anglais") ? 'en' : 'fr';
    let type = this.typeGame.startsWith("Ban") ? 'ban' : 'pick';
    from(
      fetch(
        'https://www.chiya-no-yuuki.fr/insert?nbgame=1&pseudo=' +
        this.nomJoueur.replaceAll(' ', '%20') +
        '&temps=' +
        this.timer.toFixed(1) +
        '&checkpoints="[' +
        this.checkpoints +
        ']"' +
        "&type=" + type +
        "&langue=" + langue,
        {
          body: '',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          mode: 'no-cors',
        }
      ).then((res) => {
        this.getData();
      })
    );
  }

  async getData() {
    if (this.debug) return;
    console.log('getData()');
    this.http
      .get<any>('https://www.chiya-no-yuuki.fr/select')
      .subscribe((data) => {
        this.allData = data;
        this.pick_en = data.filter((dat: any) => dat.type == "pick" && dat.langue == "en");
        this.sort(this.pick_en);
        this.pick_fr = data.filter((dat: any) => dat.type == "pick" && dat.langue == "fr");
        this.sort(this.pick_fr);
        this.ban_en = data.filter((dat: any) => dat.type == "ban" && dat.langue == "en");
        this.sort(this.ban_en);
        this.ban_fr = data.filter((dat: any) => dat.type == "ban" && dat.langue == "fr");
        this.sort(this.ban_fr);
        this.nbGames = this.getNbGames();
        this.getLastGame();
        this.checkPresence();
        this.changeData();
        this.checkValues();
        this.getClassements();
      });
  }

  public getLastGame() {
    let tmp: string[] = [];
    for (let i = 0; i < this.allData.length; i++) {
      let j = this.allData[i];
      if (!tmp.includes(j.pseudo)) {
        tmp.push(j.pseudo);
        let allDataFromPlayer = this.allData.filter((dat: any) => dat.pseudo == j.pseudo);
        allDataFromPlayer.sort((a: Data, b: Data) => {
          let ad = new Date(a.lastgame);
          let bd = new Date(b.lastgame);
          if (ad > bd) return -1;
          else return 1;
        });
        let jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        let today = new Date();
        let tmpdate = new Date(allDataFromPlayer[0].lastgame);
        let jour = jours[tmpdate.getDay()];
        if (tmpdate.toDateString() == today.toDateString()) jour = "Auj"
        let date: string = "" + (tmpdate.getHours() < 10 ? "0" : "") + tmpdate.getHours() + ":" + (tmpdate.getMinutes() < 10 ? "0" : "") + tmpdate.getMinutes() + " " + jour + " " + (tmpdate.getDate() < 10 ? "0" : "") + tmpdate.getDate() + "/" + (tmpdate.getMonth() + 1 < 10 ? "0" : "") + (tmpdate.getMonth() + 1);
        let lastgame = allDataFromPlayer[0].type + " " + allDataFromPlayer[0].langue;
        for (let x = 0; x < allDataFromPlayer.length; x++) { 
          allDataFromPlayer[x].lastgame = allDataFromPlayer[0].lastgame; 
          allDataFromPlayer[x].lastgametext = date; 
          allDataFromPlayer[x].typelastgame = lastgame; 
        }
      }
    }
  }

  public checkPresence() {
    //3600000 = 1h
    //60000 = 1min
    let date = new Date();
    let tmp: string[] = [];
    for (let i = 0; i < this.allData.length; i++) {
      let j = this.allData[i];
      if (!tmp.includes(j.pseudo)) {
        tmp.push(j.pseudo);
        let last = j.lastgame;
        let dat = new Date(last);
        let actif = false;
        if (date.getTime() - dat.getTime() < 1800000) {
          actif = true;
        }
        let tmpx = this.allData.filter((dat: Data) => dat.pseudo == j.pseudo);
        for (let x = 0; x < tmpx.length; x++) {
          tmpx[x].actif = actif;
        }
      }
    }
  }

  public sort(tab: any) {
    tab.sort((a: any, b: any) => {
      if (a.temps < b.temps) return -2;
      else if (a.temps > b.temps) return 2;
      else if (a.nbgame < b.nbgame) return -1;
      else return 1;
    });
  }

  public getNbGames() {
    let total = 0;
    for (let x = 0; x < this.allData.length; x++) {
      let nb = this.allData[x].nbgame;
      total += nb;
    }
    return total;
  }

  @HostListener('document:keydown.tab', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    event.preventDefault();
  }

  @HostListener('window:keyup', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    if (this.start) {
      if (event.key == 'Control' && this.page == 'jeu' && !this.end) {
        if (
          !(
            this.audios[this.nbFound] &&
            this.audios[this.nbFound].currentTime < 1
          )
        )
          this.play();
      } else if (event.key == 'Tab' && this.page == 'jeu' && !this.end) {
        this.passer();
      } else if (event.key == 'Escape' && this.page == 'jeu') {
        this.clickReplay();
      }
    }
  }

  public clickMenu() {
    this.pickMusic.pause();
    this.pickMusic.currentTime = 0;
    if (this.audios[this.nbFound]) this.audios[this.nbFound].pause();
    if (!this.end) {
      let exists = this.data.find((j: any) => j.pseudo == this.nomJoueur);
      if (exists) {
        this.addGame();
      }
      this.getData();
    }
    this.end = false;
    this.page = 'start';
  }

  public topText() {
    if (this.invalidName()) return 'Pseudo invalide';
    if (this.end) {
      if (this.newRecord != -1)
        return 'Record battu : ' + this.newRecord.toFixed(1) + 's gagnées';
      else return 'Bien joué !';
    } else if (this.page == 'start') {
      return 'Choisissez un mode de jeu';
    } else if (this.page == 'pause') {
      return 'Attention ! La partie va commencer !';
    } else if (this.page == 'jeu') {
      if (this.overallBest && this.timer < this.overallBest)
        return 'Record mondial';
      else if (this.best && this.timer < this.best) return 'Record personnel';
      else if (this.best && this.timer >= this.best) return 'Pour le beau jeu';
      else return 10 - this.nbFound + ' personnages restants';
    } else return '&nbsp;';
  }

  public invalidName() {
    let rgx = /^[a-zA-Z0-9 \-\_]{3,16}$/g;
    let res = this.nomJoueur.match(rgx);
    if (res && res[0] == this.nomJoueur) return false;
    return true;
  }

  passer() {
    this.timer += 10;
    this.good();
  }

  play() {
    this.audios[this.nbFound].currentTime = 0;
    this.audios[this.nbFound].play();
  }

  getTop(i: number, x: number) {
    if (i < 5) {
      if (x == 1) return 119 + 90 * i + 'px';
      else if (x == 2) return 115 + 90 * i + 'px';
      else if (x == 3) return 82 + 90 * i + 'px';
    } else {
      if (x == 1) return 119 + 90 * (i - 5) + 'px';
      else if (x == 2) return 115 + 90 * (i - 5) + 'px';
      else if (x == 3) return 75 + 90 * (i - 5) + 'px';
    }
    return '';
  }

  smallFormat(nom: string) {
    nom = nom.replaceAll('_', ' ');
    nom = nom.replaceAll(' ', ' ');
    nom = nom.replaceAll('-', ' ');
    nom = nom.replaceAll("'", ' ');
    return nom;
  }

  getLeft(i: number, x: number) {
    if (i < 5) {
      if (x == 1) return 31 + 'px';
      else if (x == 2) return 28 + 'px';
      else if (x == 3) return -2 + 'px';
    } else {
      if (x == 1) return 1111 + 'px';
      else if (x == 2) return 1115 + 'px';
      else if (x == 3) return 1110 + 'px';
    }
    return '';
  }

  getJustify(i: number) {
    if (i < 5) return 'left';
    else return 'right';
  }

  startTimer() {
    this.interval = setInterval(() => {
      this.timer += 0.1;
    }, 100);
  }

  beginGame() {
    this.checkpoints = [];
    this.actualData = this.data.find((x: any) => x.pseudo == this.nomJoueur);
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
    this.pickMusic.pause();
    this.pickMusic.currentTime = 0;
    let exists = this.data.find((j: any) => j.pseudo == this.nomJoueur);
    if (!exists) {
      this.newData();
    } else if (this.timer < this.best) {
      this.newRecord = this.best - this.timer;
      this.newRecordd();
    } else {
      this.addGame();
    }
    this.typing = '';
    this.end = true;
    clearInterval(this.interval);
  }

  good() {
    if (this.audios[this.nbFound]) this.audios[this.nbFound].pause();
    this.checkpoints[this.nbFound] = this.timer.toFixed(1);
    this.nbFound++;
    if (this.nbFound == 10) {
      this.over();
    } else {
      this.champActuel = this.randomChamps[this.nbFound];
      this.audios[this.nbFound].play();
    }
  }

  focus() {
    let el = document.getElementById('typeBar');
    if (el) {
      el.focus();
    }
  }

  blur() {
    let el = document.getElementById('typeBar');
    if (el) {
      el.blur();
    }
  }

  startTimer2() {
    this.interval2 = setInterval(() => {
      this.timer2 -= 0.1;
      if (this.timer2 <= 0.1) {
        this.page = 'jeu';
        this.beginGame();
      }
    }, 100);
  }

  getColor() {
    if (this.overallBest && this.timer < this.overallBest) return '#c5c900';
    if (this.best && this.timer > this.best) return '#772323';
    if (!this.best) return 'rgb(209, 209, 199)';
    return 'green';
  }

  clickReplay() {
    if (this.audios[this.nbFound]) this.audios[this.nbFound].pause();
    this.nbFound = 0;
    if (!this.end) {
      let exists = this.data.find((j: any) => j.pseudo == this.nomJoueur);
      if (exists) {
        this.addGame();
      }
      this.getData();
    }
    this.end = false;
    this.clickStart();
  }

  clickStart() {
    clearInterval(this.interval);
    this.typing = '';
    this.pickMusic.currentTime = 0;
    this.page = 'pause';
    if (this.data[0]) this.overallBest = this.data[0].temps;
    let exists = this.data.find((j: any) => j.pseudo == this.nomJoueur);
    if (exists) {
      this.best = exists.temps;
    }
    this.randomChamps = [];
    this.audios = [];
    let langue = this.typeGame.endsWith("Anglais") ? 'en' : 'fr';
    let type = this.typeGame.startsWith("Ban") ? 'ban' : 'pick';
    while (this.randomChamps.length < 10) {
      let rdm = Math.floor(Math.random() * this.champs.length);
      let champ = this.champs[rdm];
      if (!this.randomChamps.includes(champ)) {
        this.randomChamps[this.randomChamps.length] = champ;
        let audio = new Audio();
        audio.src =
          './assets/' + type + '/' +
          langue +
          '/' +
          champ.code +
          '.wav';
        this.audios[this.audios.length] = audio;
      }
    }
    this.blur();
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

    this.typing = '';
    if (good) {
      this.good();
    }
  }

  format(s: string) {
    s = s.toLowerCase();
    s = s.replaceAll('.', '');
    s = s.replaceAll('_', '');
    s = s.replaceAll(' ', '');
    s = s.replaceAll('-', '');
    s = s.replaceAll("'", '');
    return s;
  }
}
