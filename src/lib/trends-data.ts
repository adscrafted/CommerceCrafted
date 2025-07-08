// Amazon Top Search Terms Data Structure
export interface TrendItem {
  id: string
  keyword: string
  searchFrequencyRank: number
  searchFrequencyRankChange: number
  weeklySearchVolume: number
  weeklySearchVolumeChange: number
  weeklySearchVolumeGrowth: number
  topClickShare: number
  topClickShareChange: number
  top3ConversionShare: number
  top3ConversionShareChange: number
  top3ASINs: {
    asin: string
    image: string
    clickShare: number
    conversionShare: number
  }[]
  searchFrequencyHistory: number[] // Weekly data points
  searchVolumeHistory: number[] // Weekly volume data
  clickShareHistory: number[] // Weekly click share data
  conversionHistory: number[] // Weekly conversion data
}

export const mockTrends: TrendItem[] = [
  {
    id: '1',
    keyword: 'the chosen',
    searchFrequencyRank: 1,
    searchFrequencyRankChange: 0,
    weeklySearchVolume: 980077,
    weeklySearchVolumeChange: 0.00,
    weeklySearchVolumeGrowth: 41.82,
    topClickShare: 0.00,
    topClickShareChange: 0.00,
    top3ConversionShare: 0.00,
    top3ConversionShareChange: 0.00,
    top3ASINs: [
      { asin: 'B07K9J4F5V', image: '/placeholder.jpg', clickShare: 15.09, conversionShare: 0.00 },
      { asin: 'B07K9J4F5V', image: '/placeholder.jpg', clickShare: 15.03, conversionShare: 0.00 },
      { asin: 'B07K9J4F5V', image: '/placeholder.jpg', clickShare: 11.70, conversionShare: 0.00 }
    ],
    searchFrequencyHistory: [1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    searchVolumeHistory: [750000, 780000, 820000, 850000, 880000, 920000, 950000, 980077, 990000, 985000, 980000, 975000],
    clickShareHistory: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
    conversionHistory: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]
  },
  {
    id: '2',
    keyword: 'methylene blue',
    searchFrequencyRank: 2,
    searchFrequencyRankChange: 4,
    weeklySearchVolume: 966654,
    weeklySearchVolumeChange: 51556,
    weeklySearchVolumeGrowth: 45.10,
    topClickShare: 0.09,
    topClickShareChange: 0.09,
    top3ConversionShare: 0.00,
    top3ConversionShareChange: 0.00,
    top3ASINs: [
      { asin: 'B0C5XQ4VRN', image: '/placeholder.jpg', clickShare: 16.14, conversionShare: 0.09 },
      { asin: 'B0B6GQXQJF', image: '/placeholder.jpg', clickShare: 15.26, conversionShare: 0.00 },
      { asin: 'B0C82Y8GBH', image: '/placeholder.jpg', clickShare: 13.70, conversionShare: 0.00 }
    ],
    searchFrequencyHistory: [6, 5, 4, 3, 2, 2, 2, 2, 3, 2, 2, 2],
    searchVolumeHistory: [650000, 700000, 750000, 800000, 850000, 900000, 915098, 966654, 960000, 955000, 950000, 945000],
    clickShareHistory: [0.00, 0.02, 0.04, 0.06, 0.08, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09, 0.09],
    conversionHistory: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]
  },
  {
    id: '3',
    keyword: 'hydrogen water tablets',
    searchFrequencyRank: 3,
    searchFrequencyRankChange: -1,
    weeklySearchVolume: 953448,
    weeklySearchVolumeChange: -13206,
    weeklySearchVolumeGrowth: 39.28,
    topClickShare: 0.23,
    topClickShareChange: 0.23,
    top3ConversionShare: 0.00,
    top3ConversionShareChange: 0.23,
    top3ASINs: [
      { asin: 'B09XF8VH5K', image: '/placeholder.jpg', clickShare: 14.17, conversionShare: 0.00 },
      { asin: 'B0BT5BDJGF', image: '/placeholder.jpg', clickShare: 13.22, conversionShare: 0.23 },
      { asin: 'B09MFCV85L', image: '/placeholder.jpg', clickShare: 11.89, conversionShare: 0.00 }
    ],
    searchFrequencyHistory: [2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3],
    searchVolumeHistory: [800000, 820000, 850000, 880000, 900000, 920000, 940000, 953448, 950000, 945000, 940000, 935000],
    clickShareHistory: [0.10, 0.12, 0.15, 0.18, 0.20, 0.21, 0.22, 0.23, 0.23, 0.23, 0.23, 0.23],
    conversionHistory: [0.00, 0.05, 0.10, 0.15, 0.18, 0.20, 0.22, 0.23, 0.23, 0.23, 0.23, 0.23]
  },
  {
    id: '4',
    keyword: 'tinnitus relief for ringing ears',
    searchFrequencyRank: 4,
    searchFrequencyRankChange: -1,
    weeklySearchVolume: 940455,
    weeklySearchVolumeChange: -12993,
    weeklySearchVolumeGrowth: 35.16,
    topClickShare: 0.84,
    topClickShareChange: 0.84,
    top3ConversionShare: 0.00,
    top3ConversionShareChange: 0.28,
    top3ASINs: [
      { asin: 'B07RZ7F8XP', image: '/placeholder.jpg', clickShare: 12.92, conversionShare: 0.00 },
      { asin: 'B0C94J1GP4', image: '/placeholder.jpg', clickShare: 11.66, conversionShare: 0.28 },
      { asin: 'B0B3GRWHTP', image: '/placeholder.jpg', clickShare: 10.58, conversionShare: 0.56 }
    ],
    searchFrequencyHistory: [3, 4, 4, 4, 4, 4, 4, 4, 3, 4, 4, 4],
    searchVolumeHistory: [850000, 870000, 890000, 910000, 920000, 930000, 935000, 940455, 938000, 935000, 932000, 930000],
    clickShareHistory: [0.50, 0.60, 0.70, 0.75, 0.80, 0.82, 0.83, 0.84, 0.84, 0.84, 0.84, 0.84],
    conversionHistory: [0.00, 0.10, 0.20, 0.25, 0.27, 0.28, 0.28, 0.28, 0.28, 0.28, 0.28, 0.28]
  },
  {
    id: '5',
    keyword: 'tankinis',
    searchFrequencyRank: 5,
    searchFrequencyRankChange: 8,
    weeklySearchVolume: 927673,
    weeklySearchVolumeChange: 95088,
    weeklySearchVolumeGrowth: 12.95,
    topClickShare: 1.11,
    topClickShareChange: 1.11,
    top3ConversionShare: 0.07,
    top3ConversionShareChange: 0.69,
    top3ASINs: [
      { asin: 'B0BV3ZX7XL', image: '/placeholder.jpg', clickShare: 5.16, conversionShare: 0.07 },
      { asin: 'B0B9YTQD4P', image: '/placeholder.jpg', clickShare: 4.79, conversionShare: 0.69 },
      { asin: 'B0BV3Z5JHN', image: '/placeholder.jpg', clickShare: 3.00, conversionShare: 0.35 }
    ],
    searchFrequencyHistory: [13, 12, 10, 8, 7, 6, 5, 5, 5, 5, 5, 5],
    searchVolumeHistory: [600000, 650000, 700000, 750000, 800000, 850000, 900000, 927673, 925000, 920000, 915000, 910000],
    clickShareHistory: [0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.05, 1.11, 1.11, 1.11, 1.11, 1.11],
    conversionHistory: [0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.69, 0.69, 0.69, 0.69, 0.69]
  },
  {
    id: '6',
    keyword: 'portable air conditioners',
    searchFrequencyRank: 6,
    searchFrequencyRankChange: 13,
    weeklySearchVolume: 915098,
    weeklySearchVolumeChange: 135944,
    weeklySearchVolumeGrowth: 17.26,
    topClickShare: 9.92,
    topClickShareChange: 9.92,
    top3ConversionShare: 3.52,
    top3ConversionShareChange: 4.16,
    top3ASINs: [
      { asin: 'B08P7MCDPT', image: '/placeholder.jpg', clickShare: 6.80, conversionShare: 3.52 },
      { asin: 'B0C9XFRS3V', image: '/placeholder.jpg', clickShare: 5.76, conversionShare: 4.16 },
      { asin: 'B0CRLC4YJT', image: '/placeholder.jpg', clickShare: 4.70, conversionShare: 2.24 }
    ],
    searchFrequencyHistory: [19, 18, 15, 12, 10, 8, 7, 6, 6, 6, 6, 6],
    searchVolumeHistory: [500000, 550000, 600000, 650000, 700000, 750000, 850000, 915098, 910000, 905000, 900000, 895000],
    clickShareHistory: [4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 9.50, 9.92, 9.92, 9.92, 9.92, 9.92],
    conversionHistory: [1.00, 1.50, 2.00, 2.50, 3.00, 3.50, 4.00, 4.16, 4.16, 4.16, 4.16, 4.16]
  }
]