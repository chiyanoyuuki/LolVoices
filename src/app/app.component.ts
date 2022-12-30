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
  public nomJoueur = '';
  public audios: any = [];
  public pick_en: {
    id: number;
    nbgame: number;
    pseudo: string;
    temps: number;
    lastgame: string;
  }[] = [];
  public pick_fr: {
    id: number;
    nbgame: number;
    pseudo: string;
    temps: number;
    lastgame: string;
  }[] = [];
  public page = 'start';
  public typeGame = 'Pick Français';
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
      id: 6,
      nbgame: 450,
      pseudo: 'DEBUG J1',
      temps: 20,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 7,
      nbgame: 450,
      pseudo: 'DEBUG J2',
      temps: 30,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 8,
      nbgame: 450,
      pseudo: 'DEBUG J3',
      temps: 40,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 9,
      nbgame: 450,
      pseudo: 'DEBUG J4',
      temps: 50,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 10,
      nbgame: 450,
      pseudo: 'DEBUG J5',
      temps: 60,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 7,
      nbgame: 450,
      pseudo: 'DEBUG J6',
      temps: 70,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 8,
      nbgame: 450,
      pseudo: 'DEBUG J7',
      temps: 80,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 9,
      nbgame: 450,
      pseudo: 'DEBUG J8',
      temps: 90,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 10,
      nbgame: 450,
      pseudo: 'DEBUG J9',
      temps: 95,
      lastgame: '2022-12-29 20:27:31',
    },
    {
      id: 11,
      nbgame: 450,
      pseudo: 'DEBUG J10',
      temps: 95,
      lastgame: '2022-12-29 20:27:31',
    },
  ];
  public debug = false;

  public headers!: HttpHeaders;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.debug = isDevMode();
    if (this.debug) this.nomJoueur = 'DEBUG J2';
    this.getData();
    this.pickMusic = new Audio();
    this.pickMusic.loop = true;
    this.pickMusic.src = './assets/pickMusic.mp3';
    this.pickMusic.volume = 0.4;
    this.victory = new Audio();
    this.victory.src = './assets/victory.wav';
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
          this.timer.toFixed(1),
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
          this.timer.toFixed(1),
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
      });
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
      let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
      if (this.typeGame == 'Pick Français') {
        exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur);
      }
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
      else return 115 + 90 * i + 'px';
    } else {
      if (x == 1) return 119 + 90 * (i - 5) + 'px';
      else return 115 + 90 * (i - 5) + 'px';
    }
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
      else return 28 + 'px';
    } else {
      if (x == 1) return 1111 + 'px';
      else return 1115 + 'px';
    }
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
    if (this.typeGame == 'Pick Français') {
      exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur);
    }
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
      let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
      if (this.typeGame == 'Pick Français') {
        exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur);
      }
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
    if (this.typeGame == 'Pick Français' && this.pick_fr[0])
      this.overallBest = this.pick_fr[0].temps;
    else if (this.typeGame == 'Pick Anglais' && this.pick_en[0])
      this.overallBest = this.pick_en[0].temps;
    let exists = this.pick_en.find((j: any) => j.pseudo == this.nomJoueur);
    if (this.typeGame == 'Pick Français') {
      exists = this.pick_fr.find((j: any) => j.pseudo == this.nomJoueur);
    }
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
