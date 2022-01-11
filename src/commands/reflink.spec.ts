/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */

import { expect } from 'chai';
import { helionReflink, xKomReflink } from './reflink';

describe('reflink', () => {
  describe('x-kom', () => {
    [
      [
        'https://www.x-kom.pl/p/690347-notebook-laptop-140-apple-macbook-pro-m1-pro-16gb-512-mac-os-space-gray.html',
        'https://www.x-kom.pl/p/690347-notebook-laptop-140-apple-macbook-pro-m1-pro-16gb-512-mac-os-space-gray.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&106',
      ],
      [
        'https://www.x-kom.pl/p/590802-klawiatura-bezprzewodowa-logitech-mx-keys-for-mac-space-gray.html',
        'https://www.x-kom.pl/p/590802-klawiatura-bezprzewodowa-logitech-mx-keys-for-mac-space-gray.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&95',
      ],
      [
        'https://www.x-kom.pl/p/523891-monitor-led-27-lg-27ul850-w-4k-hdr.html',
        'https://www.x-kom.pl/p/523891-monitor-led-27-lg-27ul850-w-4k-hdr.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&69',
      ],
      [
        'https://www.x-kom.pl/p/617252-mikrofon-novox-nc-1-game-box.html',
        'https://www.x-kom.pl/p/617252-mikrofon-novox-nc-1-game-box.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&63',
      ],
      [
        'https://www.x-kom.pl/p/78034-kamera-internetowa-logitech-c920-pro-full-hd.html',
        'https://www.x-kom.pl/p/78034-kamera-internetowa-logitech-c920-pro-full-hd.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&78',
      ],
      [
        'https://www.x-kom.pl/p/297064-dysk-sieciowy-nas-macierz-synology-ds216j-2xhdd-2x1ghz-512mb-2xusb-1xlan.html',
        'https://www.x-kom.pl/p/297064-dysk-sieciowy-nas-macierz-synology-ds216j-2xhdd-2x1ghz-512mb-2xusb-1xlan.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&107',
      ],
      [
        'https://www.x-kom.pl/p/690347-notebook-laptop-140-apple-macbook-pro-m1-pro-16gb-512-mac-os-space-gray.html',
        'https://www.x-kom.pl/p/690347-notebook-laptop-140-apple-macbook-pro-m1-pro-16gb-512-mac-os-space-gray.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&106',
      ],
      [
        'https://www.x-kom.pl/p/590802-klawiatura-bezprzewodowa-logitech-mx-keys-for-mac-space-gray.html',
        'https://www.x-kom.pl/p/590802-klawiatura-bezprzewodowa-logitech-mx-keys-for-mac-space-gray.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&95',
      ],
      [
        'https://www.x-kom.pl/p/523891-monitor-led-27-lg-27ul850-w-4k-hdr.html',
        'https://www.x-kom.pl/p/523891-monitor-led-27-lg-27ul850-w-4k-hdr.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&69',
      ],
      [
        'https://www.x-kom.pl/p/617252-mikrofon-novox-nc-1-game-box.html',
        'https://www.x-kom.pl/p/617252-mikrofon-novox-nc-1-game-box.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&63',
      ],
      [
        'https://www.x-kom.pl/p/78034-kamera-internetowa-logitech-c920-pro-full-hd.html',
        'https://www.x-kom.pl/p/78034-kamera-internetowa-logitech-c920-pro-full-hd.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&78',
      ],
      [
        'https://www.x-kom.pl/p/297064-dysk-sieciowy-nas-macierz-synology-ds216j-2xhdd-2x1ghz-512mb-2xusb-1xlan.html',
        'https://www.x-kom.pl/p/297064-dysk-sieciowy-nas-macierz-synology-ds216j-2xhdd-2x1ghz-512mb-2xusb-1xlan.html?partnerid=100162370&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd&107',
      ],
    ].forEach(([input, expected]) =>
      it(`should generate link for ${input}`, () => {
        expect(xKomReflink(input)).to.eql(expected);
      }),
    );
  });

  describe('helion', () => {
    [
      [
        `https://helion.pl/ksiazki/jezyk-c-i-przetwarzanie-wspolbiezne-w-akcji-wydanie-ii-anthony-williams,jcppw2.htm#format/d`,
        `https://helion.pl/view/117666/jcppw2.htm`,
      ],

      [
        `https://helion.pl/ksiazki/jak-zarabiac-na-kryptowalutach-wydanie-ii-tomasz-waryszak,jakzk2.htm#format/d`,
        `https://helion.pl/view/117666/jakzk2.htm`,
      ],
      [
        `https://onepress.pl/ksiazki/sir-ernest-shackleton-i-wyprawa-endurance-sekrety-przywodztwa-odpornego-na-kryzys-adam-staniszewski,sirern.htm#format/d`,
        `https://onepress.pl/view/117666/sirern.htm`,
      ],
      [
        `https://septem.pl/ksiazki/pietno-morfeusza-k-n-haner,piemor.htm`,
        `https://septem.pl/view/117666/piemor.htm`,
      ],
      [
        `https://sensus.pl/ksiazki/skutecznosc-gora-mechanizmy-inspiracje-techniki-wplywajace-na-twoje-decyzje-marek-skala,trzyfi.htm#format/d`,
        `https://sensus.pl/view/117666/trzyfi.htm`,
      ],
      [
        `https://dlabystrzakow.pl/ksiazki/dieta-keto-dla-bystrzakow-rami-abrams-vicky-abrams,dikeby.htm#format/d`,
        `https://dlabystrzakow.pl/view/117666/dikeby.htm`,
      ],
      [
        `https://bezdroza.pl/ksiazki/szlaki-polski-30-najpiekniejszych-tras-dlugodystansowych-lukasz-supergan,beszpo.htm#format/d`,
        `https://bezdroza.pl/view/117666/beszpo.htm`,
      ],
      [
        `https://ebookpoint.pl/ksiazki/wojna-w-kosmosie-przewrot-w-geopolityce-jacek-bartosiak-george-friedman,e_25zw.htm#format/e`,
        `https://ebookpoint.pl/view/117666/e_25zw.htm`,
      ],
      [
        `https://videopoint.pl/kurs/machine-learning-i-jezyk-python-kurs-video-praktyczne-wykorzystanie-popularnych-bibliotek-piotr-szajowski,vprwyp.htm#format/w`,
        `https://videopoint.pl/view/117666/vprwyp.htm`,
      ],
    ].forEach(([input, expected]) =>
      it(`should generate link for ${input}`, () => {
        expect(helionReflink(input)).to.eql(expected);
      }),
    );
  });
});
