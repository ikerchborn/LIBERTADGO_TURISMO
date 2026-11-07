/**
 * Geographic models, bounding box constraints, and catalog metadata for La Libertad, Perú.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface Locality {
  id: string;
  name: string;
  department: 'La Libertad';
  province: string;
  coordinates: Coordinates;
  defaultZoom: number;
  isPriority: boolean;
  description: string;
  highlights: string[];
  heroImage: string;
}

/**
 * Strict geographic bounding box covering the entire region of La Libertad, Perú.
 * Coastal waters to Andean highlands:
 * - South: Virú / Chao border with Ancash (~ -8.95)
 * - North: Chepén border with Lambayeque / Cajamarca (~ -6.95)
 * - West: Pacific coastal shelf (~ -79.80)
 * - East: Pataz / Bolívar border with San Martín (~ -77.00)
 */
export const LA_LIBERTAD_BOUNDS: BoundingBox = {
  minLat: -8.95,
  maxLat: -6.95,
  minLng: -79.80,
  maxLng: -77.00,
};

/**
 * Curated catalog of localities in La Libertad, Perú.
 * The top 4 priority localities are Trujillo, Huanchaco, Moche, and Víctor Larco Herrera.
 */
export const LA_LIBERTAD_LOCALITIES: Locality[] = [
  {
    id: 'trujillo',
    name: 'Trujillo',
    department: 'La Libertad',
    province: 'Trujillo',
    coordinates: { lat: -8.1118, lng: -79.0287 },
    defaultZoom: 14.5,
    isPriority: true,
    description: 'La Ciudad de la Eterna Primavera, centro histórico monumental, gastronomía norteña y cuna de la Marinera.',
    highlights: ['Plaza Mayor', 'Catedral de Trujillo', 'El Rincón de Vallejo', 'Casonas Coloniales'],
    heroImage: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'huanchaco',
    name: 'Huanchaco',
    department: 'La Libertad',
    province: 'Trujillo',
    coordinates: { lat: -8.0779, lng: -79.1197 },
    defaultZoom: 14.8,
    isPriority: true,
    description: 'Histórico balneario y Reserva Mundial de Surf con milenarios caballitos de totora y cevicherías frente al mar.',
    highlights: ['Caballitos de totora', 'Muelle de Huanchaco', 'Ceviche tradicional', 'Surf en el Pacífico'],
    heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'moche',
    name: 'Moche',
    department: 'La Libertad',
    province: 'Trujillo',
    coordinates: { lat: -8.1722, lng: -79.0097 },
    defaultZoom: 14.2,
    isPriority: true,
    description: 'Corazón de la cultura Mochica, hogar de las majestuosas Huaca del Sol y de la Luna y campiña tradicional.',
    highlights: ['Huaca de la Luna', 'Huaca del Sol', 'Museo Huacas de Moche', 'Sopa teóloga'],
    heroImage: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'victor-larco',
    name: 'Víctor Larco Herrera',
    department: 'La Libertad',
    province: 'Trujillo',
    coordinates: { lat: -8.1364, lng: -79.0494 },
    defaultZoom: 14.6,
    isPriority: true,
    description: 'Distrito costero moderno que integra Buenos Aires, el Paseo de las Aguas y gastronomía marina de vanguardia.',
    highlights: ['Paseo de las Aguas', 'Plaza de Armas de Vista Alegre', 'Restaurantes de autor'],
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'la-esperanza',
    name: 'La Esperanza',
    department: 'La Libertad',
    province: 'Trujillo',
    coordinates: { lat: -8.0827, lng: -79.0435 },
    defaultZoom: 14.0,
    isPriority: false,
    description: 'Acceso a la Huaca Arco Iris (Huaca del Dragón) con frisos ceremoniales de adobe y proximidad al complejo Chan Chan.',
    highlights: ['Huaca Arco Iris', 'Plaza Cívica de La Esperanza', 'Artesanía en barro'],
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'magdalena-cao',
    name: 'Magdalena de Cao',
    department: 'La Libertad',
    province: 'Ascope',
    coordinates: { lat: -7.9547, lng: -79.2411 },
    defaultZoom: 13.8,
    isPriority: false,
    description: 'Cuna del Complejo Arqueológico El Brujo y el Museo de la Señora de Cao, gobernante moche del siglo IV.',
    highlights: ['Complejo El Brujo', 'Museo Señora de Cao', 'Plaza de Armas', 'Chicha de año'],
    heroImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'pacasmayo',
    name: 'Pacasmayo',
    department: 'La Libertad',
    province: 'Pacasmayo',
    coordinates: { lat: -7.4008, lng: -79.5714 },
    defaultZoom: 14.0,
    isPriority: false,
    description: 'Puerto y balneario señorial con su muelle de hierro decimonónico, casonas republicanas y deportes de viento.',
    highlights: ['Muelle Histórico', 'Malecón Grau', 'Surf en El Faro', 'Arquitectura republicana'],
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'huamachuco',
    name: 'Huamachuco',
    department: 'La Libertad',
    province: 'Sánchez Carrión',
    coordinates: { lat: -7.8142, lng: -78.0494 },
    defaultZoom: 13.5,
    isPriority: false,
    description: 'Imponente sierra liberteña con la fortaleza preinca de Marcahuamachuco y la hermosa laguna Sausacocha.',
    highlights: ['Marcahuamachuco', 'Laguna Sausacocha', 'Plaza Mayor', 'Aguas termales El Edén'],
    heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cascas',
    name: 'Cascas',
    department: 'La Libertad',
    province: 'Gran Chimú',
    coordinates: { lat: -7.4800, lng: -78.8167 },
    defaultZoom: 13.8,
    isPriority: false,
    description: 'Capital del vino y la uva de La Libertad, rodeada de fértiles viñedos, cascadas naturales y clima templado.',
    highlights: ['Bodegas vitivinícolas', 'Cascada El Chorro', 'Pinturas rupestres', 'Enoturismo'],
    heroImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'puerto-malabrigo',
    name: 'Puerto Malabrigo (Chicama)',
    department: 'La Libertad',
    province: 'Ascope',
    coordinates: { lat: -7.7011, lng: -79.4358 },
    defaultZoom: 14.0,
    isPriority: false,
    description: 'Hogar de la ola izquierda perfecta más larga del planeta, destino de culto para surfistas de todo el mundo.',
    highlights: ['La ola izquierda más larga', 'Muelle de Malabrigo', 'Caleta de pescadores', 'Gastronomía marina'],
    heroImage: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
  },
];
