declare namespace Intl {
  interface ListFormatOptions {
    style: 'long' | 'short';
    type: 'conjunction' | 'disjunction';
  }

  class ListFormat {
    constructor(locales?: string | string[], options?: Intl.ListFormatOptions);
    public format(items: string[]): string;
  }
}
