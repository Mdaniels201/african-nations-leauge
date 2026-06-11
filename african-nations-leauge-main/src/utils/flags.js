// Minimal country -> ISO2 mapping for teams you use. Extend as needed.
export const countryToIso2 = {
  'Algeria': 'dz',
  'Angola': 'ao', 
  'Benin': 'bj',
  'Botswana': 'bw',
  'Burkina Faso': 'bf',
  'Burundi': 'bi',
  'Cameroon': 'cm',
  'Cape Verde': 'cv',
  'Central African Republic': 'cf',
  'Chad': 'td',
  'Comoros': 'km',
  'Congo': 'cg',
  "Côte d'Ivoire": 'ci',
  'Democratic Republic of Congo': 'cd',
  'Djibouti': 'dj',
  'Egypt': 'eg',
  'Equatorial Guinea': 'gq',
  'Eritrea': 'er',
  'Eswatini': 'sz',
  'Ethiopia': 'et',
  'Gabon': 'ga',
  'Gambia': 'gm',
  'Ghana': 'gh',
  'Guinea': 'gn',
  'Guinea-Bissau': 'gw',
  'Kenya': 'ke',
  'Lesotho': 'ls',
  'Liberia': 'lr',
  'Libya': 'ly',
  'Madagascar': 'mg',
  'Malawi': 'mw',
  'Mali': 'ml',
  'Mauritania': 'mr',
  'Mauritius': 'mu',
  'Morocco': 'ma',
  'Mozambique': 'mz',
  'Namibia': 'na',
  'Niger': 'ne',
  'Nigeria': 'ng',
  'Rwanda': 'rw',
  'São Tomé and Príncipe': 'st',
  'Senegal': 'sn',
  'Seychelles': 'sc',
  'Sierra Leone': 'sl',
  'Somalia': 'so',
  'South Africa': 'za',
  'South Sudan': 'ss',
  'Sudan': 'sd',
  'Tanzania': 'tz',
  'Togo': 'tg',
  'Tunisia': 'tn',
  'Uganda': 'ug',
  'Zambia': 'zm',
  'Zimbabwe': 'zw'
};

// Use SVG endpoint (more reliable and crisp). Width/height controlled by img attrs.
export const flagUrl = (iso2) =>
  `https://flagcdn.com/${String(iso2 || '').toLowerCase()}.svg`;

export const isoForTeam = (team) => {
  if (!team) return '';
  if (team.iso2) return team.iso2.toLowerCase();
  return countryToIso2[team.country] || '';
};

// Fallback: convert ISO to regional indicator emoji for cases where CDN fails
const isoToEmoji = (iso2) =>
  String(iso2 || '')
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

export const FlagIcon = ({ iso2, country, width = 24, height = 18, style, className }) => {
  if (!iso2) {
    return (
      <div 
        className={className}
        style={{ 
          width, 
          height, 
          backgroundColor: '#f0f0f0', 
          borderRadius: 2, 
          display: 'inline-block', 
          verticalAlign: 'middle',
          ...style 
        }}
      />
    );
  }
  
  const src = flagUrl(iso2);
  return (
    <img
      src={src}
      alt={`${country} flag`}
      width={width}
      height={height}
      className={className}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle', 
        borderRadius: 2, 
        objectFit: 'cover',
        border: '1px solid #e0e0e0',
        ...style 
      }}
      onError={(e) => {
        const el = e.currentTarget;
        // Create emoji fallback
        const emoji = isoToEmoji(iso2);
        if (emoji) {
          el.style.display = 'none';
          const span = document.createElement('span');
          span.textContent = emoji;
          span.style.fontSize = `${Math.min(width, height) * 0.8}px`;
          span.style.lineHeight = `${height}px`;
          span.style.display = 'inline-block';
          span.style.verticalAlign = 'middle';
          el.parentNode && el.parentNode.insertBefore(span, el.nextSibling);
        } else {
          // Fallback to colored box with country code
          el.style.display = 'inline-block';
          el.style.backgroundColor = '#ddd';
          el.style.border = '1px solid #ccc';
          el.src = '';
        }
      }}
    />
  );
};