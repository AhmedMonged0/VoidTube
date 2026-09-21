/**
 * Pre-configured Invidious public instances with fallback rankings
 */
export const INVIDIOUS_INSTANCES = [
  {
    name: 'Flokinet',
    url: 'https://invidious.flokinet.to',
    cors: true,
    region: 'IS',
    flag: '🇮🇸',
    isHealthy: true
  },
  {
    name: 'F5.si',
    url: 'https://invidious.f5.si',
    cors: true,
    region: 'JP',
    flag: '🇯🇵',
    isHealthy: true
  },
  {
    name: 'Tux Pizza',
    url: 'https://inv.tux.pizza',
    cors: true,
    region: 'US',
    flag: '🇺🇸',
    isHealthy: true
  },
  {
    name: 'NerdVPN',
    url: 'https://invidious.nerdvpn.de',
    cors: false,
    region: 'DE',
    flag: '🇩🇪',
    isHealthy: true
  },
  {
    name: 'Yewtu.be',
    url: 'https://yewtu.be',
    cors: true,
    region: 'DE',
    flag: '🇩🇪',
    isHealthy: true
  },
  {
    name: 'DRGNS Space',
    url: 'https://invidious.drgns.space',
    cors: true,
    region: 'US',
    flag: '🇺🇸',
    isHealthy: true
  },
  {
    name: 'Tiekoetter',
    url: 'https://invidious.tiekoetter.com',
    cors: false,
    region: 'DE',
    flag: '🇩🇪',
    isHealthy: true
  }
];

export const DEFAULT_INSTANCE = INVIDIOUS_INSTANCES[0].url;
