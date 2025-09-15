import { SurveyOptions } from 'aladin-lite-react';

export const DEFAULT_FOV = 360;
export const DEFAULT_PROJECTION = 'MOL';
export const DEFAULT_COORDINATE_FRAME = 'GAL';
export const DEFAULT_TARGET = 'Sgr a*';

const API_BASE_URL = 'http://localhost:8099';
// const API_BASE_URL = 'http://localhost:3001/rendered';

export const DEFAULT_HIPS_SURVEY: SurveyOptions = {
  id: 'SPX-Coverage',
  name: 'SPHEREx Coverage',
  url: `${API_BASE_URL}/hips_nexp_fk5_combined_upto_2025W31_2A_RGB/`,
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
export const SPECTRAL_CHANNEL_URL_TEMPLATE = `${API_BASE_URL}/SPHx_Allsky_L2_{band}_C{channel:03d}_N2048`;
export const SPECTRAL_CHANNEL_URL_FORMAT = 'fits';
