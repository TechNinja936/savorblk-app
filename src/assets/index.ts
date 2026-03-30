// Central asset registry — import from here, never use raw require paths in screens

export const images = {
  logo: require('../../assets/images/logo.png'),
  heroDiscover: require('../../assets/images/hero-discover.jpg'),
  hbcuHero: require('../../assets/images/hbcu-hero.jpg'),
  guidesHero: require('../../assets/images/guides-hero.jpg'),
  profileCardBg: require('../../assets/images/profile-card-bg.jpg'),
  testKitchenCover: require('../../assets/images/test-kitchen-cover.jpg'),
  appStoreBadge: require('../../assets/images/app-store-badge.png'),
  googlePlayBadge: require('../../assets/images/google-play-badge.png'),
}

export const eventImages: Record<string, any> = {
  'afro-nation-miami': require('../../assets/events/afro-nation-miami.jpg'),
  'art-basel-miami': require('../../assets/events/art-basel-miami.jpg'),
  'atlanta-food-wine': require('../../assets/events/atlanta-food-wine.jpg'),
  'bayou-classic': require('../../assets/events/bayou-classic.jpg'),
  'black-restaurant-week': require('../../assets/events/black-restaurant-week.jpg'),
  'broccoli-city': require('../../assets/events/broccoli-city.jpg'),
  'ciaa-tournament': require('../../assets/events/ciaa-tournament.jpg'),
  'dc-black-food-wine': require('../../assets/events/dc-black-food-wine.jpg'),
  'dreamville-festival': require('../../assets/events/dreamville-festival.jpg'),
  'essence-festival': require('../../assets/events/essence-festival.jpg'),
  'houston-rodeo': require('../../assets/events/houston-rodeo.jpg'),
  'juneteenth': require('../../assets/events/juneteenth.jpg'),
  'labor-day-classic': require('../../assets/events/labor-day-classic.jpg'),
  'made-in-america': require('../../assets/events/made-in-america.jpg'),
  'magic-city-classic': require('../../assets/events/magic-city-classic.jpg'),
  'one-musicfest': require('../../assets/events/one-musicfest.jpg'),
  'roots-picnic': require('../../assets/events/roots-picnic.jpg'),
  'roots-picnic-2026': require('../../assets/events/roots-picnic-2026.jpg'),
  'state-fair-classic': require('../../assets/events/state-fair-classic.jpg'),
  'sxsw': require('../../assets/events/sxsw.jpg'),
  'taste-of-soul': require('../../assets/events/taste-of-soul.jpg'),
  'black-august-cover': require('../../assets/events/black-august-cover.jpg'),
  'black-heritage-night-cover': require('../../assets/events/black-heritage-night-cover.jpg'),
  'black-yacht-weekend-chicago': require('../../assets/events/black-yacht-weekend-chicago.jpg'),
  'labor-day-classic-cover': require('../../assets/events/labor-day-classic-cover.jpg'),
  'setx-fishing-classic': require('../../assets/events/setx-fishing-classic.jpg'),
  'state-fair-classic-cover': require('../../assets/events/state-fair-classic-cover.jpg'),
}

export const skylineImages: Record<string, any> = {
  'atlanta': require('../../assets/skylines/atlanta.jpg'),
  'austin': require('../../assets/skylines/austin.jpg'),
  'baltimore': require('../../assets/skylines/baltimore.jpg'),
  'baton-rouge': require('../../assets/skylines/baton-rouge.jpg'),
  'birmingham': require('../../assets/skylines/birmingham.jpg'),
  'charlotte': require('../../assets/skylines/charlotte.jpg'),
  'chicago': require('../../assets/skylines/chicago.jpg'),
  'dallas': require('../../assets/skylines/dallas.jpg'),
  'dc': require('../../assets/skylines/washington-dc.jpg'),
  'washington-dc': require('../../assets/skylines/washington-dc.jpg'),
  'detroit': require('../../assets/skylines/detroit.jpg'),
  'houston': require('../../assets/skylines/houston.jpg'),
  'jackson': require('../../assets/skylines/jackson.jpg'),
  'los-angeles': require('../../assets/skylines/los-angeles.jpg'),
  'memphis': require('../../assets/skylines/memphis.jpg'),
  'miami': require('../../assets/skylines/miami.jpg'),
  'nashville': require('../../assets/skylines/nashville.jpg'),
  'new-orleans': require('../../assets/skylines/new-orleans.jpg'),
  'new-york': require('../../assets/skylines/new-york-city.jpg'),
  'new-york-city': require('../../assets/skylines/new-york-city.jpg'),
  'norfolk': require('../../assets/skylines/norfolk.jpg'),
  'oakland': require('../../assets/skylines/oakland.jpg'),
  'philadelphia': require('../../assets/skylines/philadelphia.jpg'),
  'raleigh': require('../../assets/skylines/raleigh.jpg'),
  'richmond': require('../../assets/skylines/richmond.jpg'),
  'st-louis': require('../../assets/skylines/st-louis.jpg'),
  'tampa': require('../../assets/skylines/tampa.jpg'),
}

export const hbcuPhotos: Record<string, any> = {
  'bethune-cookman': require('../../assets/hbcu/photos/bethune-cookman.jpg'),
  'bowie-state': require('../../assets/hbcu/photos/bowie-state.jpg'),
  'clark-atlanta': require('../../assets/hbcu/photos/clark-atlanta.jpg'),
  'coppin-state': require('../../assets/hbcu/photos/coppin-state.jpg'),
  'delaware-state': require('../../assets/hbcu/photos/delaware-state.jpg'),
  'dillard': require('../../assets/hbcu/photos/dillard.jpg'),
  'fisk': require('../../assets/hbcu/photos/fisk.jpg'),
  'florida-am': require('../../assets/hbcu/photos/florida-am.jpg'),
  'hampton': require('../../assets/hbcu/photos/hampton.jpg'),
  'howard': require('../../assets/hbcu/photos/howard.jpg'),
  'jackson-state': require('../../assets/hbcu/photos/jackson-state.jpg'),
  'morehouse': require('../../assets/hbcu/photos/morehouse.jpg'),
  'morgan-state': require('../../assets/hbcu/photos/morgan-state.jpg'),
  'nc-at': require('../../assets/hbcu/photos/nc-at.jpg'),
  'norfolk-state': require('../../assets/hbcu/photos/norfolk-state.jpg'),
  'spelman': require('../../assets/hbcu/photos/spelman.jpg'),
  'tennessee-state': require('../../assets/hbcu/photos/tennessee-state.jpg'),
  'tuskegee': require('../../assets/hbcu/photos/tuskegee.jpg'),
  'xavier': require('../../assets/hbcu/photos/xavier.jpg'),
}

export const hbcuCampusBackgrounds = {
  gameday: require('../../assets/hbcu/covers/campus-gameday.jpg'),
  historic: require('../../assets/hbcu/covers/campus-historic.jpg'),
  modern: require('../../assets/hbcu/covers/campus-modern.jpg'),
  south: require('../../assets/hbcu/covers/campus-south.jpg'),
  urban: require('../../assets/hbcu/covers/campus-urban.jpg'),
}

/**
 * Get a skyline image for a city slug, falling back to a default.
 */
export function getSkyline(citySlug: string): any {
  return skylineImages[citySlug] ?? skylineImages['atlanta']
}

/**
 * Get an HBCU campus photo by school slug, with generic fallback.
 */
export function getHBCUPhoto(slug: string): any {
  return hbcuPhotos[slug] ?? hbcuCampusBackgrounds.south
}

/**
 * Get an event image by slug key, with Juneteenth as fallback.
 */
export function getEventImage(key: string): any {
  return eventImages[key] ?? eventImages['juneteenth']
}
