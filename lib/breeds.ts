/**
 * African Livestock Breeds Database
 * Comprehensive list of breeds found in Africa for different animal types
 */

export type AnimalType = 'cattle' | 'goat' | 'sheep' | 'pig' | 'other';

export interface Breed {
  name: string;
  origin?: string;
  description?: string;
}

export const AFRICAN_BREEDS: Record<AnimalType, Breed[]> = {
  cattle: [
    { name: 'Ankole-Watusi', origin: 'East Africa', description: 'Long-horned cattle, excellent heat tolerance' },
    { name: 'Boran', origin: 'Kenya/Ethiopia', description: 'Hardy beef breed, drought resistant' },
    { name: 'Nguni', origin: 'Southern Africa', description: 'Multi-colored, disease resistant' },
    { name: 'Afrikaner', origin: 'South Africa', description: 'Large-framed, heat tolerant' },
    { name: 'Bonsmara', origin: 'South Africa', description: 'Composite breed, good meat quality' },
    { name: 'Tuli', origin: 'Zimbabwe', description: 'Sanga type, heat and disease resistant' },
    { name: 'Sanga', origin: 'East/Southern Africa', description: 'Zebu-Sanga cross, adaptable' },
    { name: 'Zebu', origin: 'East Africa', description: 'Humped cattle, heat tolerant' },
    { name: 'Fulani', origin: 'West Africa', description: 'Long-horned, pastoral breed' },
    { name: 'Muturu', origin: 'West Africa', description: 'Dwarf breed, trypanotolerant' },
    { name: 'N\'Dama', origin: 'West Africa', description: 'Trypanotolerant, disease resistant' },
    { name: 'West African Shorthorn', origin: 'West Africa', description: 'Dual-purpose, hardy' },
    { name: 'Kenana', origin: 'Sudan', description: 'Dairy breed, high milk production' },
    { name: 'Butana', origin: 'Sudan', description: 'Dairy breed, good milk yield' },
    { name: 'Fogera', origin: 'Ethiopia', description: 'Dual-purpose, local breed' },
    { name: 'Horro', origin: 'Ethiopia', description: 'Dual-purpose, indigenous' },
    { name: 'Holstein-Friesian', origin: 'Europe (imported)', description: 'High milk production' },
    { name: 'Jersey', origin: 'Europe (imported)', description: 'Small dairy breed' },
    { name: 'Simmental', origin: 'Europe (imported)', description: 'Dual-purpose, large frame' },
    { name: 'Angus', origin: 'Europe (imported)', description: 'Beef breed, good marbling' },
    { name: 'Brahman', origin: 'Asia (imported)', description: 'Zebu type, heat tolerant' },
    { name: 'Crossbreed', origin: 'Mixed', description: 'Mixed breed' },
    { name: 'Other', origin: 'Unknown', description: 'Other breed not listed' },
  ],
  
  goat: [
    { name: 'Boer', origin: 'South Africa', description: 'Meat breed, large and fast-growing' },
    { name: 'Kalahari Red', origin: 'South Africa', description: 'Meat breed, heat tolerant' },
    { name: 'Savanna', origin: 'South Africa', description: 'Meat breed, white coat' },
    { name: 'West African Dwarf', origin: 'West Africa', description: 'Small, trypanotolerant' },
    { name: 'Nigerian Dwarf', origin: 'West Africa', description: 'Small dairy breed' },
    { name: 'Red Sokoto', origin: 'Nigeria', description: 'Meat breed, red coat' },
    { name: 'Sahelian', origin: 'Sahel Region', description: 'Large, long-legged, meat breed' },
    { name: 'Somali', origin: 'Somalia/Ethiopia', description: 'Dairy breed, long ears' },
    { name: 'Galla', origin: 'Kenya/Ethiopia', description: 'Dairy breed, good milk yield' },
    { name: 'Small East African', origin: 'East Africa', description: 'Indigenous, hardy' },
    { name: 'Toggenburg', origin: 'Switzerland (imported)', description: 'Dairy breed, brown with white markings' },
    { name: 'Alpine', origin: 'Europe (imported)', description: 'Dairy breed, various colors' },
    { name: 'Saanen', origin: 'Switzerland (imported)', description: 'Dairy breed, white' },
    { name: 'Angora', origin: 'Turkey (imported)', description: 'Fiber breed, mohair production' },
    { name: 'Cashmere', origin: 'Asia (imported)', description: 'Fiber breed, cashmere wool' },
    { name: 'Crossbreed', origin: 'Mixed', description: 'Mixed breed' },
    { name: 'Other', origin: 'Unknown', description: 'Other breed not listed' },
  ],
  
  sheep: [
    { name: 'Dorper', origin: 'South Africa', description: 'Meat breed, hair sheep' },
    { name: 'Damara', origin: 'Namibia', description: 'Fat-tailed, hardy' },
    { name: 'Van Rooy', origin: 'South Africa', description: 'Fat-tailed, meat breed' },
    { name: 'Persian', origin: 'South Africa', description: 'Fat-tailed, black head' },
    { name: 'Blackhead Persian', origin: 'Somalia (via South Africa)', description: 'Fat-tailed, meat breed' },
    { name: 'Red Maasai', origin: 'Kenya/Tanzania', description: 'Indigenous, disease resistant' },
    { name: 'Somali', origin: 'Somalia', description: 'Fat-tailed, long-legged' },
    { name: 'West African Dwarf', origin: 'West Africa', description: 'Small, trypanotolerant' },
    { name: 'Djallonké', origin: 'West Africa', description: 'Small, hardy, trypanotolerant' },
    { name: 'Fulani', origin: 'West Africa', description: 'Long-legged, pastoral breed' },
    { name: 'Balami', origin: 'Nigeria', description: 'Fat-tailed, meat breed' },
    { name: 'Uda', origin: 'West Africa', description: 'Large, long-legged' },
    { name: 'Yankasa', origin: 'Nigeria', description: 'White, meat breed' },
    { name: 'Balami', origin: 'Nigeria', description: 'Fat-tailed, meat breed' },
    { name: 'Merino', origin: 'Spain (imported)', description: 'Wool breed, fine wool' },
    { name: 'Dorset', origin: 'UK (imported)', description: 'Dual-purpose, white' },
    { name: 'Hampshire', origin: 'UK (imported)', description: 'Meat breed, black face' },
    { name: 'Suffolk', origin: 'UK (imported)', description: 'Meat breed, black head' },
    { name: 'Crossbreed', origin: 'Mixed', description: 'Mixed breed' },
    { name: 'Other', origin: 'Unknown', description: 'Other breed not listed' },
  ],
  
  pig: [
    { name: 'Kolbroek', origin: 'South Africa', description: 'Indigenous, hardy, spotted' },
    { name: 'Windsnyer', origin: 'South Africa', description: 'Indigenous, feral type' },
    { name: 'Mukota', origin: 'Zimbabwe', description: 'Indigenous, hardy' },
    { name: 'West African Dwarf', origin: 'West Africa', description: 'Small, trypanotolerant' },
    { name: 'Nigerian Indigenous', origin: 'Nigeria', description: 'Local breed, hardy' },
    { name: 'Large White', origin: 'UK (imported)', description: 'Commercial, white, fast-growing' },
    { name: 'Landrace', origin: 'Denmark (imported)', description: 'Commercial, white, long body' },
    { name: 'Duroc', origin: 'USA (imported)', description: 'Meat breed, red' },
    { name: 'Hampshire', origin: 'UK (imported)', description: 'Meat breed, black with white belt' },
    { name: 'Pietrain', origin: 'Belgium (imported)', description: 'Meat breed, heavily muscled' },
    { name: 'Berkshire', origin: 'UK (imported)', description: 'Meat breed, black with white points' },
    { name: 'Crossbreed', origin: 'Mixed', description: 'Mixed breed' },
    { name: 'Other', origin: 'Unknown', description: 'Other breed not listed' },
  ],
  
  other: [
    { name: 'Not Specified', origin: 'N/A', description: 'Breed not specified' },
    { name: 'Mixed/Crossbreed', origin: 'Mixed', description: 'Mixed breed' },
    { name: 'Other', origin: 'Unknown', description: 'Other breed' },
  ],
};

/**
 * Get breeds for a specific animal type
 */
export function getBreedsForAnimalType(animalType: AnimalType | string): Breed[] {
  if (!animalType || animalType === '') {
    return [];
  }
  return AFRICAN_BREEDS[animalType as AnimalType] || AFRICAN_BREEDS.other;
}

/**
 * Get breed names only (for dropdown options)
 */
export function getBreedNamesForAnimalType(animalType: AnimalType | string): string[] {
  return getBreedsForAnimalType(animalType).map(breed => breed.name);
}

/**
 * Get breed by name and animal type
 */
export function getBreedByName(animalType: AnimalType | string, breedName: string): Breed | undefined {
  const breeds = getBreedsForAnimalType(animalType);
  return breeds.find(breed => breed.name === breedName);
}








