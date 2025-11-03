import axios from 'axios';

interface HoroscopeToday {
  id: string;
  name: string;
  today_kirill: string;
}

export async function getTodayHoroscopesKirill(): Promise<HoroscopeToday[]> {
  const apiUrl = 'https://gor.uz/app_api.php?param=1';

  const response = await axios.get(apiUrl);
  const data = response.data;

  // Map only id, name, and today_kirill fields
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    today_kirill: item.today_kirill,
  }));
}
