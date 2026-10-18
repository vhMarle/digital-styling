// Sync wardrobe item to Google Sheet "DigitalStyling_Wardrobe"
export async function addClothingToGoogleSheet(accessToken, spreadsheetId, clothingItem) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Items!A:G:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[
          clothingItem.id,
          clothingItem.name,
          clothingItem.category, // Tops, Bottoms, Shoes, etc.
          clothingItem.color,
          clothingItem.style,    // Casual, Formal, Sporty
          clothingItem.imageUrl,
          new Date().toISOString()
        ]]
      })
    }
  );
  return await response.json();
}