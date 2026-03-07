export interface ColoringImage {
  id: string;
  title: string;
  category: 'manusia' | 'alam' | 'hewan';
  prompt: string;
}

const generateItems = (category: 'manusia' | 'alam' | 'hewan', count: number, themes: string[]): ColoringImage[] => {
  return Array.from({ length: count }).map((_, i) => {
    const theme = themes[i % themes.length];
    return {
      id: `${category}-${i + 1}`,
      title: `${theme} ${i + 1}`,
      category,
      prompt: `Simple black and white line art coloring page for kids, ${theme}, thick black outlines, white background, no shading, high contrast, minimalist style.`
    };
  });
};

export const COLORING_IMAGES: ColoringImage[] = [
  ...generateItems('manusia', 50, [
    'Astronaut', 'Doctor', 'Chef', 'Firefighter', 'Teacher', 'Pilot', 'Artist', 'Farmer', 'Scientist', 'Ballerina',
    'Superhero', 'Pirate', 'Knight', 'Princess', 'Prince', 'Explorer', 'Athlete', 'Musician', 'Diver', 'Gardener'
  ]),
  ...generateItems('alam', 50, [
    'Mountain', 'Forest', 'Beach', 'Waterfall', 'Desert', 'Island', 'River', 'Garden', 'Rainbow', 'Volcano',
    'Park', 'Lake', 'Sky with Clouds', 'Sunset', 'Flower Field', 'Jungle', 'Cave', 'Snowy Hill', 'Farm', 'Underwater'
  ]),
  ...generateItems('hewan', 50, [
    'Lion', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Tiger', 'Panda', 'Koala', 'Kangaroo', 'Penguin',
    'Dolphin', 'Whale', 'Shark', 'Octopus', 'Turtle', 'Butterfly', 'Bee', 'Ladybug', 'Dog', 'Cat'
  ])
];
