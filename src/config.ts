export function getConfig(name: 'ENV'): 'production' | 'staging' | 'development' | 'test';
export function getConfig(name: 'NODE_ENV'): 'production' | 'development';
export function getConfig(name: string): string;
export function getConfig(name: string): string {
  const val = process.env[name];

  switch (name) {
    case 'NODE_ENV':
      return val || 'development';
    case 'ENV':
      return val || 'development';
    case 'PORT':
      return val || '3000';
  }

  if (!val) {
    throw new Error(`Cannot find environmental variable: ${name}`);
  }

  return val;
}
export function getPrefixes(): string[] {
  return ['!', 'panie rysiu ', 'ryszard draniu ', 'kierowniku ', 'panie łysiu '];
}

export const isProd = () => getConfig('ENV') === 'production';
