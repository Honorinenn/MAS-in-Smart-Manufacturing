// Custom Tailwind Configuration for Green & Grey Theme
// Add this to your tailwind.config.js

export const greenGreyTheme = {
  theme: {
    extend: {
      colors: {
        // Primary green shades
        'factory-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Grey shades
        'factory-grey': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      backgroundImage: {
        'factory-gradient': 'linear-gradient(135deg, #f0fdf4 0%, #f3f4f6 50%, #dcfce7 100%)',
        'factory-header': 'linear-gradient(90deg, #1f2937 0%, #166534 100%)',
      }
    }
  }
};

// CSS Classes for Quick Styling
export const factoryThemeClasses = {
  // Backgrounds
  mainBg: 'bg-gradient-to-br from-green-50 via-gray-100 to-green-100',
  headerBg: 'bg-gradient-to-r from-gray-800 to-green-900',
  cardBg: 'bg-white',
  hoverBg: 'hover:bg-green-50',
  
  // Text colors
  primaryText: 'text-gray-900',
  secondaryText: 'text-gray-600',
  headerText: 'text-white',
  accentText: 'text-green-700',
  
  // Buttons
  primaryButton: 'bg-green-600 hover:bg-green-700 text-white',
  secondaryButton: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  
  // Borders
  border: 'border-gray-200',
  accentBorder: 'border-green-200',
  
  // Shadows
  cardShadow: 'shadow-md hover:shadow-lg',
  
  // Status colors (keep functionality)
  statusOperational: 'bg-green-100 text-green-800',
  statusWarning: 'bg-yellow-100 text-yellow-800',
  statusCritical: 'bg-red-100 text-red-800',
};
