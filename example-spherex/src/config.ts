import { SurveyOptions } from 'aladin-lite-react';

// --- Configuration ---
// export const DEFAULT_HIPS_SURVEY: SurveyOptions = {
//   id: 'DSS',
//   name: 'DSS Colored',
//   url: 'P/DSS2/color',
//   frame: 'equatorial',
//   order: 9,
// };

export const DEFAULT_HIPS_SURVEY: SurveyOptions = {
  id: 'SPX-Coverage',
  name: 'SPHEREx Coverage',
    url: 'http://localhost:8099/test/',
  // frame: 'equatorial',
  // order: 9,
};

// NOTE: Replace with your actual URL template.
// {band} and {channel} are placeholders.
// {channel:03d} will format the channel number with leading zeros (e.g., 2 -> 002).
export const SPECTRAL_CHANNEL_URL_TEMPLATE = 'http://localhost:8099/allsky_channel_maps_2048/20250905/rendered/SPHx_Allsky_L2_{band}_C{channel:03d}_N2048';
export const SPECTRAL_CHANNEL_URL_FORMAT = 'fits';
// export const SPECTRAL_CHANNEL_URL_TEMPLATE = 'http://localhost:8099/allsky_channel_maps_2048/20250905/rendered/SPHx_Allsky_L2_B3_C051_N2048example.com/data/SPHx_Allsky_L2_{band}_C{channel:03d}_N2048.fits';
// --- End Configuration ---
