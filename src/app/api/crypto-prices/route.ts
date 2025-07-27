import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Fetch crypto prices and USD to IDR rate in parallel
    const [cryptoResponse, forexResponse] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd",
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; CryptoWalletApp/1.0)',
          },
        }
      ),
      fetch("https://api.exchangerate-api.com/v4/latest/USD", {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; CryptoWalletApp/1.0)',
        },
      }),
    ]);

    if (!cryptoResponse.ok || !forexResponse.ok) {
      throw new Error('Failed to fetch data from external APIs');
    }

    const cryptoPrices = await cryptoResponse.json();
    const forexData = await forexResponse.json();

    const result = {
      ethPrice: cryptoPrices.ethereum?.usd || 3000, // Fallback to 3000 if API fails
      solPrice: cryptoPrices.solana?.usd || 100, // Fallback to 100 if API fails
      usdToIdr: forexData.rates?.IDR || 15000, // Fallback to 15000 if API fails
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error fetching real-time prices:", error);
    
    // Return fallback values if API calls fail
    const fallbackResult = {
      ethPrice: 3000,
      solPrice: 100,
      usdToIdr: 15000,
    };

    return NextResponse.json(fallbackResult);
  }
}
