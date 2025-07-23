import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    // Validate that it's an Amazon image URL
    if (!imageUrl.includes('images-na.ssl-images-amazon.com') && 
        !imageUrl.includes('m.media-amazon.com')) {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl)
    
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
}