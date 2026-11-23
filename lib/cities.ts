// Liste de secours si l'API Ozon n'est pas joignable (les IDs Ozon sont résolus à l'envoi).
export const FALLBACK_CITIES = [
  "Agadir","Al Hoceima","Azrou","Beni Mellal","Benslimane","Berkane","Berrechid","Casablanca",
  "Chefchaouen","Dakhla","El Jadida","Errachidia","Essaouira","Fes","Fnideq","Guelmim","Ifrane",
  "Kenitra","Khemisset","Khenifra","Khouribga","Ksar El Kebir","Laayoune","Larache","Marrakech",
  "Martil","Meknes","Mohammedia","Nador","Ouarzazate","Oujda","Rabat","Safi","Sale","Settat",
  "Sidi Kacem","Sidi Slimane","Skhirat","Tanger","Taroudant","Taza","Temara","Tetouan","Tiznit",
].map((name) => ({ id: "", name }));
