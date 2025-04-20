// Color constants based on the provided design
export const COLORS = {
  // Primary colors
  GREEN: '#008000',  // Green
  RED: '#C00000',    // Red
  YELLOW: '#FFC000', // Yellow
  VIOLET: '#4B0082', // Violet
  WHITE: '#FFFFFF',  // White
  BLACK: '#000000',  // Black
  GREY: '#F0F0F0',   // Light Grey
  DARK_GREY: '#A9A9A9', // Dark Grey

  // Text colors
  TEXT_PRIMARY: '#000000',   // Black for primary text
  TEXT_SECONDARY: '#A9A9A9', // Dark Grey for secondary text
  
  // Background colors
  BG_PRIMARY: '#FFFFFF',     // White for primary background
  BG_SECONDARY: '#F0F0F0',   // Light Grey for secondary background
};

// Status colors mapping
export const STATUS_COLORS = {
  APPROVED: COLORS.GREEN,
  REJECTED: COLORS.RED,
  PENDING: COLORS.YELLOW,
  SELECTED: COLORS.GREEN,
  SHORTLISTED: COLORS.VIOLET,
  INTERVIEW: COLORS.YELLOW,
  NEW: COLORS.GREY,
};
