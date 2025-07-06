import { generateSlug } from './slug'

// Map of product IDs to their full titles for slug generation
export const productSlugMap: Record<string, string> = {
  'smart-yoga-mat-1': 'Smart Yoga Mat with Posture Tracking & App Integration',
  'organic-sleep-supplements-2': 'Organic Sleep Support Gummies with Melatonin & L-Theanine',
  'pet-camera-treat-3': 'WiFi Pet Camera with Treat Dispenser & Two-Way Audio',
  'bamboo-kitchen-set-4': 'Bamboo Kitchen Utensil Set with Holder (12-Piece)',
  'wireless-charger-station-5': '3-in-1 Wireless Charging Station for Apple Devices',
  'baby-milestone-cards-6': 'Baby Milestone Cards Set with Wooden Stand (48 Cards)',
  'led-desk-organizer-7': 'LED Desk Organizer with Wireless Charging Pad',
  'collagen-face-mask-8': 'Gold Collagen Face Mask Set with Hyaluronic Acid (24 Pack)',
  'magnetic-tool-holder-9': 'Heavy Duty Magnetic Tool Holder Bar (18 inch)'
}

export function getProductSlug(productId: string): string {
  const title = productSlugMap[productId]
  if (!title) {
    // Fallback to using the ID itself
    return productId
  }
  return generateSlug(title)
}