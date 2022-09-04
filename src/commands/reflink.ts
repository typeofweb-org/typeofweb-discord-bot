const X_KOM_PATTERN = /^https?:\/\/([^.]+\.)?x-kom.pl/;
const X_KOM_PARTNER_ID = `100162370`;

const HELION_PARTNER_ID = '117666';
const HELION_ID_PATTERN = /^https?:\/\/([^.]+).*,(.*?)\.htm/;
const HELION_DOMAINS = [
  `helion`,
  `onepress`,
  `septem`,
  `sensus`,
  `dlabystrzakow`,
  `bezdroza`,
  `ebookpoint`,
  `videopoint`,
];

export const isXKomReflink = (url: string) => X_KOM_PATTERN.test(url);

export const xKomReflink = (url: string) => {
  if (!isXKomReflink(url)) {
    return null;
  }

  const suffix = `?partnerid=${X_KOM_PARTNER_ID}&sm12=NDY=&ts=1641758054&token=6ab7b9cde43c838f9e76042a3b8bfdcd`;
  const mainLink = url.split('#')[0];
  return mainLink + suffix + '&' + mainLink.length.toString();
};

export const isHelionReflink = (url: string) => {
  const maybeMatch = url.match(HELION_ID_PATTERN);
  if (!maybeMatch) {
    return false;
  }

  const [_, domain, productId] = maybeMatch;

  if (!HELION_DOMAINS.includes(domain) || !productId) {
    return false;
  }

  return true;
};

export const helionReflink = (url: string) => {
  if (!isHelionReflink(url)) {
    return null;
  }

  const [_, domain, productId] = url.match(HELION_ID_PATTERN)!;

  return `https://${domain}.pl/view/${HELION_PARTNER_ID}/${productId}.htm`;
};

export const myDevilReflink = () => {
  return `https://www.mydevil.net/pp/9UVOSJRZIV`;
};

export const messageToReflinks = (message: string): readonly string[] => {
  const maybeLinks = message.match(/https?:\/\/[^\s]+/g);
  if (!maybeLinks) {
    return [];
  }

  return maybeLinks
    .map((maybeLink) => {
      if (isXKomReflink(maybeLink)) {
        return xKomReflink(maybeLink);
      }
      if (isHelionReflink(maybeLink)) {
        return helionReflink(maybeLink);
      }
      return null;
    })
    .filter((x): x is Exclude<typeof x, null | undefined | '' | 0 | false> => !!x);
};
