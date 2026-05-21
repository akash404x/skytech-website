export const PRODUCT_FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'arduino', label: 'Arduino' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'iot', label: 'IoT' },
  { id: 'robotics', label: 'Robotics' },
  { id: 'modules', label: 'Modules' },
  { id: 'components', label: 'Components' },
] as const;

export type ProductFilterId = (typeof PRODUCT_FILTER_CHIPS)[number]['id'];

export function matchesProductFilter(category: string, filterId: ProductFilterId): boolean {
  const cat = category.toLowerCase();
  switch (filterId) {
    case 'all':
      return true;
    case 'arduino':
      return cat.includes('arduino');
    case 'sensors':
      return cat.includes('sensor');
    case 'iot':
      return cat.includes('iot') || cat.includes('esp') || cat.includes('wifi') || cat.includes('smart home');
    case 'robotics':
      return cat.includes('robot') || cat.includes('motor') || cat.includes('driver');
    case 'modules':
      return cat.includes('module') || cat.includes('display') || cat.includes('power');
    case 'components':
      return cat.includes('component') || cat.includes('cable') || cat.includes('connector') || cat.includes('diy');
    default:
      return true;
  }
}
