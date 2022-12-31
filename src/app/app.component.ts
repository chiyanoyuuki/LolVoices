import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit, isDevMode } from '@angular/core';
import { environment } from 'src/environments/environment';
import champions from '../assets/champions.json';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  public pick_en: {
    id: number;
    nbgame: number;
    pseudo: string;
    temps: number;
    lastgame: string;
    checkpoints?: any;
    actif?: boolean;
  }[] = [];
  public pick_fr: {
    id: number;
    nbgame: number;
    pseudo: string;
    temps: number;
    lastgame: string;
    checkpoints?: any;
    actif?: boolean;
  }[] = [];
  public data: {
    id: number;
    nbgame: number;
    pseudo: string;
    temps: number;
    lastgame: string;
    checkpoints?: any;
    actif?: boolean;
  }[] = [];
  public page = 'start';
  public typeGame = 'Pick Français';
  public actualData: any;
  public nbGames = 0;
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
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [1.8, 3.5, 5.3, 7, 8.8, 10.5, 12.3, 14, 15.8, 17.5],
    },
    {
      id: 3,
      nbgame: 354,
      pseudo: 'Yet',
      temps: 18.8,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [1.9, 3.8, 5.6, 7.5, 9.4, 11.3, 13.2, 15, 16.9, 18.8],
    },
    {
      id: 6,
      nbgame: 629,
      pseudo: 'Yozz',
      temps: 18.9,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [1.9, 3.8, 5.7, 7.6, 9.4, 11.3, 13.2, 15.1, 17, 18.9],
    },
    {
      id: 9,
      nbgame: 946,
      pseudo: 'Paul',
      temps: 22.3,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [2.2, 4.5, 6.7, 8.9, 11.2, 13.4, 15.6, 17.8, 20.1, 22.3],
    },
    {
      id: 14,
      nbgame: 110,
      pseudo: 'Hyrolia',
      temps: 24.6,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [2.5, 4.9, 7.4, 9.8, 12.3, 14.8, 17.2, 19.7, 22.1, 24.6],
    },
    {
      id: 2,
      nbgame: 271,
      pseudo: 'Beta',
      temps: 24.8,
      lastgame: '2022-12-31 11:01:56',
      checkpoints: [2.5, 5, 7.4, 9.9, 12.4, 14.9, 17.4, 19.8, 22.3, 24.8],
    },
    {
      id: 18,
      nbgame: 2,
      pseudo: 'Test',
      temps: 73.6,
      lastgame: '2022-12-31 11:47:19',
      checkpoints: '[10.1,19.9,30.9,40.0,49.9,60.0,62.6,65.6,69.5,73.6]',
    },
  ];
  public debug = false;

  public headers!: HttpHeaders;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.debug = isDevMode();
    this.debug = false;
    if (this.debug) {
      this.pick_fr = this.debugData;
      this.pick_en = [this.debugData[0], this.debugData[1], this.debugData[2]];
      this.checkValues();
      this.checkPresence();
      this.data = this.pick_fr;
      this.nomJoueur = this.data[0].pseudo;
    }
    this.getData();
    this.pickMusic = new Audio();
    this.pickMusic.loop = true;
    this.pickMusic.src = './assets/pickMusic.mp3';
    this.pickMusic.volume = 0.4;
    this.victory = new Audio();
    this.victory.src = './assets/victory.wav';
  }

  public checkValues() {
    for (let i = 0; i < this.pick_fr.length; i++) {
      if (typeof this.pick_fr[i].checkpoints == 'string') {
        this.pick_fr[i].checkpoints = JSON.parse(this.pick_fr[i].checkpoints);
      }
    }
    for (let i = 0; i < this.pick_en.length; i++) {
      if (typeof this.pick_en[i].checkpoints == 'string') {
        this.pick_en[i].checkpoints = JSON.parse(this.pick_en[i].checkpoints);
      }
    }
  }

  public changeData() {
    if (this.typeGame == 'Pick Anglais') this.data = this.pick_en;
    else if (this.typeGame == 'Pick Français') this.data = this.pick_fr;
  }

  async newRecordd() {
    if (this.debug) return;
    console.log('newRecord');
    let langue = this.typeGame == 'Pick Anglais' ? 'en' : 'fr';
    from(
      fetch(
        'https://www.chiya-no-yuuki.fr/pick_' +
          langue +
          '_record?pseudo=' +
          this.nomJoueur.replaceAll(' ', '%20') +
          '&temps=' +
          this.timer.toFixed(1) +
          '&checkpoints="[' +
          this.checkpoints +
          ']"',
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
    let langue = this.typeGame == 'Pick Anglais' ? 'en' : 'fr';
    from(
      fetch(
        'https://www.chiya-no-yuuki.fr/pick_' +
          langue +
          '_addgame?pseudo=' +
          this.nomJoueur.replaceAll(' ', '%20'),
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
    let langue = this.typeGame == 'Pick Anglais' ? 'en' : 'fr';
    from(
      fetch(
        'https://www.chiya-no-yuuki.fr/pick_' +
          langue +
          '_insert?nbgame=1&pseudo=' +
          this.nomJoueur.replaceAll(' ', '%20') +
          '&temps=' +
          this.timer.toFixed(1) +
          '&checkpoints="[' +
          this.checkpoints +
          ']"',
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
    console.log('getData(en)');
    this.http
      .get<any>('https://www.chiya-no-yuuki.fr/pick_en_select')
      .subscribe((data) => {
        this.pick_en = data;
        this.sort(this.pick_en);
        this.getdata2();
      });
  }

  async getdata2() {
    console.log('getData(fr)');
    this.http
      .get<any>('https://www.chiya-no-yuuki.fr/pick_fr_select')
      .subscribe((data) => {
        this.pick_fr = data;
        this.sort(this.pick_fr);
        this.nbGames = this.getNbGames();
        this.checkPresence();
        this.changeData();
        this.checkValues();
      });
  }

  public checkPresence() {
    //3600000 = 1h
    //60000 = 1min
    let date = new Date();
    for (let i = 0; i < this.pick_fr.length; i++) {
      this.pick_fr[i].actif = false;
      let tmp = this.pick_en.find(
        (a: any) => a.pseudo == this.pick_fr[i].pseudo
      );
      if (tmp) tmp.actif = false;
      let last = this.pick_fr[i].lastgame;
      let dat = new Date(last);
      if (date.getTime() - dat.getTime() < 1800000) {
        this.pick_fr[i].actif = true;
        if (tmp) tmp.actif = true;
      }
    }
    for (let i = 0; i < this.pick_en.length; i++) {
      let tmp = this.pick_fr.find(
        (a: any) => a.pseudo == this.pick_en[i].pseudo
      );
      if (!tmp) {
        this.pick_en[i].actif = false;
        let last = this.pick_en[i].lastgame;
        let dat = new Date(last);
        if (date.getTime() - dat.getTime() < 1800000) {
          this.pick_en[i].actif = true;
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
    for (let x = 0; x < this.pick_en.length; x++) {
      let nb = this.pick_en[x].nbgame;
      total += nb;
    }
    for (let x = 0; x < this.pick_fr.length; x++) {
      let nb = this.pick_fr[x].nbgame;
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
    this.pickMusic.currentTime = 0;
    this.pickMusic.pause();
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
    this.pickMusic.currentTime = 0;
    this.pickMusic.pause();
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
    this.checkpoints[this.nbFound] = this.timer.toFixed(1);
    this.nbFound++;
    if (this.nbFound == 10) {
      if (this.audios[this.nbFound - 1]) this.audios[this.nbFound - 1].pause();
      this.over();
    } else {
      if (this.audios[this.nbFound - 1]) this.audios[this.nbFound - 1].pause();
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
    while (this.randomChamps.length < 10) {
      let rdm = Math.floor(Math.random() * this.champs.length);
      let champ = this.champs[rdm];
      if (!this.randomChamps.includes(champ)) {
        this.randomChamps[this.randomChamps.length] = champ;
        let audio = new Audio();
        audio.src =
          './assets/pick/' +
          (this.typeGame == 'Pick Anglais' ? 'en' : 'fr') +
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
