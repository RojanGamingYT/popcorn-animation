const VOLUME = {
  // Popcorn size (multiple)
  LENGTH: 1,

  // Initial number of popcorns
  NUM: 100,
  
  // Maximum number of popcorns
  MAX_NUM: 500,
  
  // Initial value of gravity (multiple)
  G: 1,
  
  // Minimum value of gravity (multiple)
  MIN_G: 0.3,
};

class Init {
  static canvas = document.getElementById('canvas');
  static ctx = Init.canvas.getContext('2d');
  static W = window.innerWidth; // Canvas-size
  static H = window.innerHeight;
  static IMG = getImg(); // Array of images

  /* Pass value for each loop */
  static getInitValue() {
    const image = new Image();
    const imgNum = Math.floor(Math.random() * Init.IMG.length);
    image.src = Init.IMG[imgNum];

    const now = new Date();
    const initTime = now.getTime();

    const v0y = Math.random() * -45 - 25;

    const value = {
      // Coordinates to draw first
      X: Math.floor(Math.random() * -100) + Init.W / 6,
      Y: Math.floor(Math.random() * -100) + Init.H / 2,

      // Image-size
      LENGTH: v0y / -2.8 * VOLUME.LENGTH,

      // Time at start
      INIT_TIME: initTime,

      // Initial velocity
      V0X: Math.random() * 10 + 10,
      V0Y: v0y,

      // Gravitational acceleration
      G: 9.8 * VOLUME.G,

      // Initial angle of the particle
      DEG: Math.random() * 360,

      // Particle rotation speed
      R_S: Math.random() * 0.7,

      // Particle zoom speed
      PERS: v0y / -300 * VOLUME.G * VOLUME.LENGTH,

      IMG: image,
    }

    return value;
  }

  constructor() {
    this.crrent_num = 1;

    // Number of instances to generate
    this.NUM = VOLUME.MAX_NUM;

    this.particles = [];
    for (let i = 0; i < this.NUM; i++) {
      const part = new ParticleEngine();
      this.particles.push(part);
    }

    this.render_bind = this.render.bind(this);
    this.console_bind = this.console.bind(this);
    
    Init.canvas.width = Init.W;
    Init.canvas.height = Init.H;
    
    this.initialize();
  }

  initialize() {
    this.render();

    const RANDOM_TIME = 2000;

    for (let i = 0; i < VOLUME.NUM; i++) {
      setTimeout(() => {
        this.crrent_num += 1;
      }, Math.floor(Math.random() * RANDOM_TIME));
    }

    setTimeout(() => {
      this.console();
      LoadingSpinner.style.display = 'none';
    }, RANDOM_TIME);
  }

  render() {
    Init.ctx.clearRect(0, 0, Init.W, Init.H);

    for (let i = 0; i < this.crrent_num; i++) {
      this.particles[i].draw(true);
    }

    for (let i = this.crrent_num - 1; i < this.NUM; i++) {
      this.particles[i].draw(false);
    }

    requestAnimationFrame(this.render_bind);
  }

  console() {
    this.crrent_num = VOLUME.NUM;
    requestAnimationFrame(this.console_bind);
  }
}

class ParticleEngine {
  detectStop = false;

  initialize(stopFlag) {
    if (!stopFlag) {
      this.detectStop = false;
    }

    const { X, Y, LENGTH, INIT_TIME, V0X, V0Y, G, DEG, R_S, PERS, IMG } = Init.getInitValue();
    this.x = X;
    this.y = Y;
    this.length = LENGTH;
    this.initTime = INIT_TIME;
    this.v0x = V0X;
    this.v0y = V0Y;
    this.g = G;
    this.deg = DEG;
    this.r_s = R_S;
    this.pers = PERS;
    this.img = IMG;
  }

  draw(stopFlag) {
    if (stopFlag && !this.detectStop) {
      this.initialize(stopFlag);
      this.detectStop = true;
      return;
    }

    if (!this.detectStop) {
      return;
    }

    /* Gravitational acceleration */
    const now = new Date();
    const currentTime = now.getTime();

    const diffSecond = (currentTime - this.initTime) * 0.01;

    const x = this.x + (this.v0x * diffSecond);

    const y = this.y + ((this.v0y * diffSecond) + (0.5 * this.g * diffSecond * diffSecond));

    /* Image rotation */
    Init.ctx.save();

    const cx = x + this.length / 2;
    const cy = y + this.length / 2;

    const rad = this.deg * Math.PI / 180;
    Init.ctx.setTransform(Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), cx - cx * Math.cos(rad) + cy * Math.sin(rad), cy - cx * Math.sin(rad) - cy * Math.cos(rad));

    Init.ctx.drawImage(this.img, x, y, this.length, this.length);
    Init.ctx.restore();

    // when off screen
    if (y > Init.H) {
      this.initialize(stopFlag);
      return;
    }

    // Change the angle
    this.deg += this.r_s;
    if (this.deg > 360) {
      this.deg = 0;
    }

    // Enlarge the image
    this.length += this.pers;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const popCorn = new Init();

  RangeLabel.textContent = VOLUME.NUM;
  RangeBar.setAttribute("value", VOLUME.NUM);
  RangeBar.setAttribute("max", VOLUME.MAX_NUM);
  
  RangeBar.addEventListener('input', (e) => {
    VOLUME.NUM = Number(e.target.value);
    RangeLabel.textContent = VOLUME.NUM;
  });

  GRangeLabel.textContent = 'G ' + VOLUME.G;
  GRangeBar.setAttribute("value", VOLUME.G);
  GRangeBar.setAttribute("max", VOLUME.G);
  GRangeBar.setAttribute("min", VOLUME.MIN_G);
  
  GRangeBar.addEventListener('input', (e) => {
    VOLUME.G = Number(e.target.value);
    GRangeLabel.textContent = 'G ' + VOLUME.G;
  });
  
  window.addEventListener("resize", (e) => {
    Init.canvas.width = Init.W = window.innerWidth;
    Init.canvas.height = Init.H = window.innerHeight;
  });
});

function getImg() {
  const img = [];

  img.push('data:image/webp;base64,UklGRmAEAABXRUJQVlA4WAoAAAAQAAAAQQAAQQAAQUxQSEcCAAABkHVtkyHJ+iOrmqO1bdu2bdu27b0yL22zcbe2bZtj1ollVkZkR8QEAGH6qt0nL55QXIC2ovzu2GQLrce9swpdStzDf6deGF4xi6GBMOel/gcRP12YlIGbKDp83iO0ud7DSmTocwftR/cJZyTqnkGlsb7qgk2Zl6j6SzkuEbtRvS8DCxExzSLA4SZZZPnKLXYi6ZlIInf1A9HfkpE2sRyJWXZdNDIcZRJETviILGc51GXajExHmcqitiLX7oayIci2OvztKVqySCbDxgE2m7wA4G6w9fHzx5cX5pE7wuVoRgBnja1f8J93agqZA0yeFwFP1TWf8P/vawp2V5s12fcFpX2Z2KVGx6PNjzXZqZweAm6FgMQQ8CgE7NUveYR+1/NK+HRZ6pDYqMmP8iBZ5KIe61wyUOSqDl/KgnxRnwYLHTYgw9CL3K7mBNtGljbzd5y6c/UOl4/VQaUwvZlyZ8m1NJVFYjeh5L+5r3OIH2QCZcYzHJY7gTTPDbrXw6KANttFOl8UEGc+RfeoONkZOms8VfgOOjyajsi1lMGXWkTGaAY4WdCILskM1rlpoH40gx0RRIUfMziagSjdCQbHMxK5VzPYFk5kTmMw2yCCDqlkn2oBdYFHZIfCyYy5VIndgT6zj+hGJgaQeRtNX2CZ7gDFSjcPKHhVVXywjRu4FjqnIv7p5lrhAvjmO2frx9YWOZ3Au8AJSyb+1LzqbuCfef7L/1hXu2cUoKWj8org04/vHwQm5wZ9nTkbDOtTOaMAnY3w7FncAmgBAFZQOCDyAQAAEA4AnQEqQgBCAD6JOJhHpSOioTH4C6CgEQljAM1AnW4QToUDb33cAOWG46IeLs1ICHHJK+wWTcJdC0vuXw9hjvpE84hANYXO2HKzS+yllPCJJ4MvAjGwaeftgBJcl1p1qV1Oq5nHujOyWnQYqfuQE7Q1C+PzEgiqAAD+/ocD/93XkiVX3uZ6dm5U2YRCJdPGdRoqoz/dEaqoQXqUpTPLGJOMDshz/rwzxWcbRISTxHtgJqGISeWAn99XSEPZ29dKipqVkConmcAcr0jyD5R+54u/eXfYwhepOgTLzqf7f3OqIV3MvqIP/LwY57TnVWeGVwn1ZUA5SHcnfXg75yXxhz5/4O7pLeNlSojsdLfAWFFsWlwHBnGNYsW9MM4CPcM1FrxVn+BLq/MKpQhe3CdCELXb+pHAA10CwFSxpo5GKPNGUjN69nyb2FpnRg/vu5/IJ0hKEJE4+1mRf/xAdH6ETbDX6aKBa7kAtw7jMfT+6qefneZdeVVkPm10ouMfLTEOQpjg8L//VHo6ZeU5STGonnxAhEI0mAY5AsenGFFkOCvF33i3GnEGF5Mm3n5vf7Ft9Yx+bpH9x25L2/8m0WGQ4fBPCD+Qff2WJpQt7kFKAF1ww//+GM6nAAtnBfzjBvS9913/39ODZEaFpZFkwupgAAAA');

  img.push('data:image/webp;base64,UklGRhoFAABXRUJQVlA4WAoAAAAQAAAATwAATwAAQUxQSKcCAAABkARtmyFJf1Yba9u2bdu2bdu2be/Ys7Zte2xXVFRU5KHQWZV520tETAD814nsJdsOm7pu7769W9aPr+LwAOWsN3rHkdUTapiMY85RofeOe18iUgVRyEz/fXxQcaTGmZ0VJwZ+56XUvxercwYxN9v+6Gcq1pz+YUp2BVR5xsbg7zxW/rk0jyFsK+IxQeFKcVnjryLWHpLfAOZ5IibrlRMgdwj2+IBdN24ojwlLJ1sO9Mn0TFxo1atBMiYuZfKYpDDWpE++m9jwYg1dLCsxhfPMejTkafB3kUBIwXYE0/i3sGe5O08Z1am8G6B2OhW4P/LA3PopxhhLV5rlXIPpvJ5dm32BhJUTgyMowWU0WZZiBlbUwo3HLGyopRHPhB5IzXIaM7ElqNdPZEJEXjWnH2biBCtSKfadCelzx05om0OhegQThFgRJ3tV4gCg4ncmKH9dWAKgwFOGYLwGwB3GlMMA1jMsedkKwHKMIR/KmAAsu9khDgUAQEPZ8dKt0FlkxliQ2w5iVl5xyFA7np6oq7GawgoAAKBSbzC10tbsHeI13MkP8oonMb0RjQA18UmVCY8W5gXF9QJFd3IBgLXlDi+vNZ3zguoVTK+0xQxyZLOB1lsUfS0PRGnaZSJzhZ7ExkC2y01qjlsJcXmGPqbjbwUgjgrfoWIMIgdQM56CAw7Q07TCcF8muUHfvFcMlXpvZmkO9C58OJ7PFPV4PGqhf7DXg78xL4+MrZubAwPaa3Qa9FiHmJZgypbdla9y9UJ2BIa1nNfhiguoXKNHNjoq/CQX6KQDzROJnTHRAY5NIikfCyXg3EvqAEcL5L4tEeGbA72dMNElJopyviIQu9QOFKMuoifv9jYxA9XOEG1vZpQyA+2VX2n4Mrc4AgYWmnhVkL0aX5SD/1ABAFZQOCBMAgAA8BAAnQEqUABQAD6BNJZHpT+iITW1rvvwEAlAGZJCa2PTIoZDA9HwLAW+e7MZwiEf/T/2Xz7wbFuo+bOgsggkCHdsa1+UWuVn/4KKeGFaIvLioOKnIWJnzE7JU/bY8kR4P1rTIVESRguco388KgMvgCFDvHOSDUa48EULUo6a7ZytI7TVVlX2KKe48UxH5D2wAP78rRcP//AC8lQNuaFhaQZHnsn0kVAWG6VS583qAlYOitGsAKNGIaXrorQNqg5iq5x+zAd4tGTemK22fMNPdK9a3k+1HQtLsbuVe27/dE14uD/vg7dL/EWFAGov+ZZL37P1HawxTepV2/Dnr6Pn6qpDdcomnpAHDszfNFd11E03GD56W6taK5S5b1Co1vQOOTRcc+ZKdSwUERDYH4jhEt8+byL7rewEsZrzRPhUnc3H4OB2CXe73eWDImrENLQFZS3JRuPhaw4GZDVvSDCSsbOrUL9apm6k6a9GxQCaR7qrPNVKqbAeuboSXZiDoiCTvbqEuTiImq5eA8TBVmtmcPFjjHZAtlctPF+1NV0rMW6XRMIQOVliXM8jyaj2fzve5qiMG9i1X0D4mcc6+Y130lpjZBNuGHp3vCx9V9KoaMrTGP22V4HkOx6Vj2Mr9CfQv+u1uRbVmU+ngMGpIfoSEZJJsgNjqyqamDCxSE8EeP38OM/EZ5SFNjGXD5FEfkFJKJsMKjSkdx/Nbzf//hiHd0Q4y2/5UAJBZ/cv//8cP//GSH//jQYypP9WkkEKc15Q7Z/8MKH9nQAAAAAA');

  img.push('data:image/webp;base64,UklGRlIFAABXRUJQVlA4WAoAAAAQAAAAQgAAQgAAQUxQSJICAAABkAXbtmlH+1zENt9L2rZt27Zt27Zt27Zt292v4rz41v64Pqf1GRETAP89udzDxzfxUSAcT5gQ2/yQpNRFWXMXzpanWudulT0ZcBiNigmpKEmIiJvdqONao+6YogCiu4dniJ9Ai/WVvuThWWrPPHP5atS7CRaOCtIZ9UsxdlR9NTArocBlqwE6oyrz5uX6ZhZG9bEQs5oihc+rmkS60IBvfM3hh1OB60JM8ThEB96wmGF5Qwke9zUh109acI5gXPYv1NgKGRf0kBqpm3HeF6jBzS6GOa+j52dlw0hfepI7GkIs1TKHLKQnrr4O4uCftXCFgY8TfrxKoCeqtCY+W5flt2z25HSk+6SPFqFjnIT0S/fLgkbSFFmUdkQQLZE/mXiXA7TyI5HJi56ainxjInUcp6k/MhlVm+dkoiBrzYb9wLTuJSIjSs8e7A0A9diQ25+/tCPuzkwg8jEzqi+zA2nDGtYBqMnaw3Bwms/aJlcoGcPaEhGqIestAdy3MXbDDwCyfmIquQ7Ii7xiabygEPmBoau+IBfGSOzYqoMiPxLZnSoqQTmJmQNeoOp5hJWrESDnBQCobmfjfg6Qi537AYA4n4momgAAxKl96nkAgNLJLDwOAz6sXLPNiAoeR1mwTSrd8zHKj8ugVhwDWocp8MOZKqIAbvtNkCSzjrgpgeWCUV/mtehx35yHWUA9bJ0xd4o7EnGaKfdyglbXFs/1fZsaAQBkkhn7I0A7ybb0h7Y3G/KLIGtinG2oF+h2Ltht1dVPdkx+fvnQnCZZXUDZaZJB9tUFBTCScw7MVbZ2+Sz+Hg4ENDr1idKXfmtyYRcwkYB+vsDsx5pSzw0vEeIA1Iv++ev3mbH15On9+6fVzubFw39LVlA4IJoCAACQEACdASpDAEMAPoE6lUelJCIhMLneqKAQCUAZN4JySRnnsz3vnqtNA3m8iU0sRQPJzCCUmiTxmaSSmRhqErHH+dX/t1kIO4bh4ZCx3mYUwiZTjfXXiOFxExY3zXTxQSHgcjm++f2vfbz3nrXpIDFluUKHwb/t2Es0rDzkVnwInUqQdBSzQauqmNRYQsAA/veL//8/7//n5j//zxwK7MwP+BoGVAdD/KNWVPJwsgepkL5pjYkVeR1B5JHo1OwV95sK+cNbLChfn/q/GI7eIckabe3hqpiI/8i4PR7eV4o7Iu0ob28FWQJDip3rykZnHE1Tl275y9nfwr/1vxKHdUUHK64F7IYZxi9agWUbVfPoRS53KpvQbphAm/8vCq6S2f2lx8ywbnn1ax4r1WP5FqYC6S+IfZ/Xzjni8NEooRDKSRHWJ2PDmhV1EfvLyCzVIGSqdo7WvzIyPIzo/qxru5ods5EL7P967hXAms/o9KxZ+kiw0t9T1K0Wt5rCEGrsIXFT017c3eOt6Y39RzlRNSp1uqUd2jBk1pGHy7Kyogs9jXwI/JU62Dw6x1R152fJ+5gqgzpEnj9lLb0eJDZldf2jMBcUt+zsI94HOJrbxOOBwPQMDe43ZOVGGZxap3FiHD33JZSolSvuYzQUoX9cMmBT/lZf9Jj7bTRnBIPAOfNGW6RMChVtrkfsB22Gd32is823cc/GG597Efkaqf/9Dfxyqn/HLQRvqTqGxQI4Mt9jrxY0WOmALok1rthlcU1jj6SzSG1DDkwSVLcfTEZJ9HP/yEb08A3yVjqH35ahu1axDeIaW06po4nlBXig7z9LSRutwJks34EtRCpTaXu6gvzPrdePOWj2Iv4Ygk/bB/975hQFfwZdXLgnJAA=');

  img.push('data:image/webp;base64,UklGRt4EAABXRUJQVlA4WAoAAAAQAAAAPwAAPwAAQUxQSIoCAAABkHDb1hnJO3pB2z22bdu2bdu2bdu2jVSPbbPdVeNa7cnKeoP096W+FxETAMySd+HR+zVN086dmZ0eUgyos0jTNG3n2Pa5FHCp5FO088q3OpobR7KYSIW2fkdTI/HBuLI+1gVVH7LdjuwhGQDAr28oMjv3tPa3Rq57wYn8q93BfxNyG3s6VPTiUzt/RysTW+dYgVYa39eX9ORItSAWrY18rluCiKF7aruz5LuABB0rsqaU9R7SfF5DNpEHIVV7G+m/1BfJ4PN0//Uz6CQPkgDgNRL+kB8ADEq4xh0ASYcXBtBJ6Z0BBl05s3HZzPlbb8ZSwEUqyKmCvTxUN+80rd9RsAUBa+kHBD7lY4JcNvEcFdmgtVO42GYc5SOFw34cJcRLbs/hvdcQzV6OA/olihZZhKd9rGghqXmqfBdtpsLjeVIwoz1wl/ou1slUfIpNqOT+Eh8MEAo/jU7Nlz5SKNSv88EQQyhEC1JHEnMvG0or+3wnkir2HIXnKPYBaWV9jrS8DiKxUj+pVbRTK0+uXTwxZYJOTJ5sEMt8EWn5bdVpqaN0pFUhEmm5LUBiqS5Sy/qYWv63lsSHR+uiSE2dFiQfa5Mq+0lRoHEsn2OYGwA0sIuS/SnXzSoyAEBam6viU1BGGzzDZPi/6GsXRXdIAYLP8PQ3UacbrnlUCRhLh7I9zQn/p7+DvLGxDM7HkzMDq1TjNYveRTIpE8nmvDyuQePhex+HOhz2m5NrZFCBXSq8n+F1OjBtjayf1lQLUgEUn3T5y1csmcoNLPTt8dRM7y+b5T8S7rDHIya/C5lW0ANcL+dZ9Pgron2QJ5hLQcWqVGq2aFP7AmlUEDN9y8n7z431A1ZJUlJldAMXAlZQOCAuAgAAMA0AnQEqQABAAD6JOJRHpSOiITf1WACgEQliALb7oD656WFgKenWZ2+Iu6moQBO19A4/Nvqctu1Y1TZChVVqvb/JGM8Gyu58t8iXTOpflZlQY8IPttawyYtsB/UxELfoq1fPUtJps20L2KTZVBqlm3YAAP77pjDYSoQAbggAy4ONA7FhBEzvcnw42afL5wwJ44Gy+1luGpLDtpRtpbryo92TFfGf5RJMHf0Z7mP1qZ+wlIRvdLkpOLcHdxwAbYxB3oeqReJeHEMvPasvrkB9KQ2G+r5+K+70/lcWT9+VJRoLlUvd8InIvD/P/W4G4KwymelKQGuBdKpoY0UZhlLShjEpCVoGTfhNyKIghfbe856HrHpoYr7Nfx8n/MPE4TbEw2ceFkqSXO/uJQ6vd7X1uLYET+b83vZklS0ZkoOy2e0Uyy2Q0J/WvqUP/5oonQ3iKgGgN0BEASDs7vvHiTNOy+Pb/QQowrSYZsRXIoZgBS2aXvUCfwfO+DmJCrL32s4NnslMO0Zijv8g1iZ+uRmb05/jT4dwboYh2Lpi/Qx0r689TcBtArO2Ol8X8Fh7UGii5CCTXDptS80/2e9VH31F7UX8DQ7eZvMvH5cAN7p5NcNpBCivhNmZFGyptsL4aDzeVn5tVnzyQ4kUOzOJ261K9+UQweIXl3exEbSHLoup53eBGyunK6A/M07cl2z1jwrPL/+yQAPATQ8zOQp15A3PnWzg5ZVXwmjZ1XqMAAAA');

  img.push('data:image/webp;base64,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');

  img.push('data:image/webp;base64,UklGRloFAABXRUJQVlA4WAoAAAAQAAAAQAAAQAAAQUxQSFsCAAABkCjbtulK+yJ5tm2jbdu2bdu2bdu2bdt2p56ZupXajeTm3H1+ICImAKyUPaKTC7jrC64+vGJCe38ByItetcbvu3RlTNODiIiG+UkOMi25QL/zafh/Dpr/uGViNR0hXZ/PCjJMGaojI/fJQrY5bQQiQoMUZP0qkIjzQWSe1YBI9Gt2xp40bKcr7PCEKwWhQwZqaNoYLomO7naiJj5XUNtXS2ftO7tzZt1AJ1lgVStDI4vGZyfW9wiVBRbSKIWG2a87mzoxcDuKtPcUtLUq4gUxNB4oKVkR/5YaoqmfXl34M3qIY/SqnLbwgINENUJ3hQdjBTVQMoUHvOKuxvkEF9heDRR9xsU6vRohePK1NHofC+tVAEjudV+QwwN1VQHIi+mZTljhcZQevlWnn2nk4L26+jnI4VlV/jeQwxs91IgDjTwMDFEhNv+JPA4JtSQ0S0Eud9a2INQwIJ/76lmI/4ycDgszJw5DTpVqtuZst/By1FUwoyvwmpNfBcB817vIp7GNYOErcjpFBotpnBxzAsspfKQkAm99Ba5SMgwTbIAjZUVS4QI64GmPK1h9iVpPsH5+FrE2DNo+I1aXQcQCWoYCDPQVDKTOOjIAj4uU0ioBS91cQi9KCkyg5GcyP5OAsdjXRCSjKjB3WElD6SmyA7dtJLbbgZZuSwlkFQJtbRvdNCnaKN0ljQC8Spcak6FBRjsZKMqlnzC7WUYEotG32fwc4Q10Qx4w+Do3XgLKYat/qlLenxgRqwPi+uTxFz+nZOSlvb+5e2ztcAcR6Aue9eeu23Zw27TOJb1k0B4AVlA4INgCAACQEACdASpBAEEAPlkijUSjoiEaOIeMOAWEsoMUAH3OgNzbOv87YX0b+Wj0ceeL03jebX2xnq/1wxseDWY/bq1NkaBk04f7/Xz4meC8figzl6XCJ1S4P5nWHJNroSHI9cSRxTzKlb6kwmgK8XHhlLnRHXK4VywbLtUO4GPTR8gscw+ioJ6OBG2LExxyTYAA/vxyjS6ZwBJudDkE2YAeMfRxz3+oJxsxtHSLN85zLiMWz1RAu3V3hN6J76XR/BuTVJ3SZ40x1fvHrvRVxjXptDnpY5LedoINsmIif/tBVKI2/z6V4HS+4uTlElRfWtGyniFUhncZ+Bw5CNbwlPOyIhFio32tB5tENb665x674BieB40VgT6+IuHZ7Oxd2533YVeSllrrtNUXb0eqqWLoeXpa4AJ1NGGRmcdM9TyUYQq//8cYYuEf8NdZuj/Iz3CLQBSii+bL/qtxkN8d81zk6StjQT45wXtOCPyKpTFQkJtQ5nyhXnPatH1ZHPhQ2rQsmS2gEszkGbC+Nk2JsbymiqsjSGa1/bs6DcvLzJOUt369N+E9n/smJoOcugFhXjB3ux0uPzShJuQTUYiUsmVp/+mPc/Uh3OKjYFrZhAFMUM/gwoqWI7n1hGWVwE/OAVlCGEwSMGUmFS72Fp8yD4Dwj7feIC0wypxOTudDpwy+3Z9xndzyI73daUd/vxbT3Akhg+/P6qIPcWrw8UFXr0oV6j2A7sBWl4Xoqigpd11hxU8wHTG8jfl9d7AZzINz8cu2ajCRhOhyDEBM+9OrEtU02Sxq8UVMe4X6fBAJR0f41n2a8XaZd1YAbzu8mYEu13Fz6dAAO2xfvLSX7OmfovnS8y6S7tkYemn39pTiv3cyAF/3nnoEAPOmbMT/WT///bU//7Zm//9sKCLsExuqPmLx0uIF/3+PXLX1o6AjAh+7x65rSjygDmoWlI4QNOT8cZumS+d5u3aYQAAAAA==');

  img.push('data:image/webp;base64,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');

  img.push('data:image/webp;base64,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');

  return img;
}