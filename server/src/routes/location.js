import 'dotenv/config';
import { cultureFromState } from '../knowledge/nigeriaStates.js';
import { getCulture } from '../knowledge/cultures.js';

export default function mountLocation(app) {
  app.get('/api/location/lookup', async (req, res) => {
    try {
      // IP-based geolocation — free, no key required for limited use
      const r = await fetch('https://ipapi.co/json/', {
        headers: { 'User-Agent': '9jaWonderPal/1.0' },
      });
      if (!r.ok) return res.json({ ok: false, error: 'lookup failed' });
      const j = await r.json();
      const region = j.region || j.region_code || '';
      const city = j.city || '';
      const countryCode = j.country_code || '';
      const country = j.country_name || '';

      if (countryCode !== 'NG') {
        return res.json({
          ok: true,
          country,
          countryCode,
          city,
          region,
          culture: null,
          note: country ? 'You are in ' + country + '.' : '',
          message: 'You are outside Nigeria. Welcome! You will learn about Nigerian cultures.',
        });
      }

      const cultureKey = cultureFromState(region);
      const culture = cultureKey ? getCulture(cultureKey) : null;

      res.json({
        ok: true,
        country,
        countryCode,
        city,
        region,
        culture: cultureKey,
        cultureName: culture ? culture.name : null,
        note: region ? 'You are in ' + region + ' State.' : '',
        message: culture
          ? 'This is ' + culture.name + ' country. ' + culture.greeting.hi + '!'
          : 'You are in Nigeria. Every culture is here.',
      });
    } catch (e) {
      res.json({ ok: false, error: String(e.message || e) });
    }
  });
}
