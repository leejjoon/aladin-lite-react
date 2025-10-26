import { SurveyOptions } from 'aladin-lite-react';

export const DEFAULT_FOV = 360;
export const DEFAULT_PROJECTION = 'MOL';
export const DEFAULT_COORDINATE_FRAME = 'GAL';
export const DEFAULT_TARGET = 'Sgr a*';
export const LAST_SURVEY_ID = '2025W40_2B';

// const API_BASE_URL = 'http://localhost:8099';
// const API_BASE_URL = 'http://localhost:3001/rendered';
const API_BASE_URL = 'https://spherex-hips-data.web.app';
export const SPECTRAL_CHANNEL_URL_TEMPLATE = `${API_BASE_URL}/SPHx_Allsky_L2_{band}_C{channel:03d}_N2048`;

// const API_BASE_URL_LINE = 'http://localhost:43863';
const API_BASE_URL_LINE =  API_BASE_URL;
export const LINEMAP_URL_TEMPLATE = `${API_BASE_URL_LINE}/lines/SPHx_Allsky_L2_{line_name}`;
// const API_BASE_URL = 'https://spherex-hips-channelmaps.firebaseapp.com';


export const DEFAULT_HIPS_SURVEY: SurveyOptions = {
  id: 'SPX-Coverage',
  name: 'SPHEREx Coverage',
  url: `${API_BASE_URL}/hips_rgb`,
  frame: 'equatorial',
  options: {
    minCut: 0.0,
    maxCut: 1.0,
  },
};

// NOTE: Replace with your actual URL template.
// {band} and {channel} are placeholders.
// {channel:03d} will format the channel number with leading zeros (e.g., 2 -> 002).
// export const SPECTRAL_CHANNEL_URL_TEMPLATE = 'http://localhost:8099/allsky_channel_maps_2048/20250905/rendered/SPHx_Allsky_L2_{band}_C{channel:03d}_N2048';
export const SPECTRAL_CHANNEL_URL_FORMAT = 'fits';

export const LINEMAP_NAMES = [
  "H₂ 1-0 Q(1)",
  "H₂ 1-0 S(1)",
  "Pa α",
  "Br β",
  "PAH",
  "Br α",
  "Pf β",
];

