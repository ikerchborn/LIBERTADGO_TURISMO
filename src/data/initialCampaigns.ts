import { LocalCampaign } from '../types/catalog.ts';

export const INITIAL_CAMPAIGNS: LocalCampaign[] = [
  {
    id: 'camp_rincon_vallejo',
    title: 'Desafío Creador: El Mejor Plato Criollo de Trujillo',
    businessName: 'El Rincón de Vallejo',
    placeId: 'place_rincon_vallejo',
    localityId: 'trujillo',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    description:
      'Casona histórica y restaurante tradicional donde almorzaba César Vallejo. Buscamos creadores que graben un video dinámico (Reel / TikTok) mostrando nuestra sazón tradicional, el rincón del poeta y la experiencia norteña.',
    videoBrief:
      'Video vertical (9:16) de 30 a 60 segundos. Debe incluir toma de la preparación o degustación del Seco de Cabrito o Shambar, mención de la casona histórica y la etiqueta oficial #LibertadGO.',
    requirements: [
      'Duración entre 30 y 60 segundos en TikTok, Reels o Shorts',
      'Mostrar el local y plato representativo',
      'Etiquetar a @elrincondevallejo y usar #LibertadGO',
      'Publicación en modo público durante las fechas del concurso',
    ],
    hashtags: ['#LibertadGO', '#ElRinconDeVallejo', '#TrujilloGastronomico', '#ComidaCriollaNorteña'],
    prizes: {
      first: {
        position: 1,
        title: '1º Puesto — Oro',
        badge: '🥇 Ganador Absoluto',
        cashPEN: 1500,
        perks: [
          'S/ 1,500 en efectivo directo',
          'Trofeo Oficial de Oro LibertadGO & Marca La Libertad',
          'Difusión patrocinada del video en redes de Turismo La Libertad',
          'Almuerzo familiar de 6 tiempos con el Chef Principal',
        ],
      },
      second: {
        position: 2,
        title: '2º Puesto — Plata',
        badge: '🥈 Segundo Lugar',
        cashPEN: 800,
        perks: [
          'S/ 800 en efectivo directo',
          'Cena de degustación para 2 personas en El Rincón de Vallejo',
          'Certificado de Honor como Creador Destacado',
        ],
      },
      third: {
        position: 3,
        title: '3º Puesto — Bronce',
        badge: '🥉 Tercer Lugar',
        cashPEN: 400,
        perks: [
          'S/ 400 en efectivo directo',
          'Canasta gourmet con postres tradicionales trujillanos y alfajores',
          'Mención destacada en el portal oficial',
        ],
      },
    },
    submissions: [
      {
        id: 'sub_1',
        campaignId: 'camp_rincon_vallejo',
        creatorName: 'Valeria Quispe',
        creatorHandle: '@valeviajeraperu',
        platform: 'tiktok',
        videoUrl: 'https://tiktok.com/@valeviajeraperu/video/7391823901',
        title: '¡Donde almorzaba César Vallejo en Trujillo! 🍲✨',
        caption:
          'Probando el cabrito con frejoles más emblemático de Trujillo en la mesa original del poeta. ¡Miren esa suavidad de carne! Voten por mi video en LibertadGO.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        votesCount: 342,
        viewsCount: 28400,
        submittedAt: '2026-11-03T14:20:00Z',
        status: 'featured',
      },
      {
        id: 'sub_2',
        campaignId: 'camp_rincon_vallejo',
        creatorName: 'Carlos Mendoza',
        creatorHandle: '@charlyfoodie_norte',
        platform: 'reels',
        videoUrl: 'https://instagram.com/reel/DC9102kls',
        title: 'Ruta Gastronómica Centro Histórico de Trujillo',
        caption:
          'Un recorrido visual por las casonas de Trujillo y la parada obligada en El Rincón de Vallejo. Sabor auténtico y cultura viva.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        votesCount: 289,
        viewsCount: 19800,
        submittedAt: '2026-11-04T10:15:00Z',
        status: 'approved',
      },
      {
        id: 'sub_3',
        campaignId: 'camp_rincon_vallejo',
        creatorName: 'Lucía Alvarado',
        creatorHandle: '@lucia.viajes.pe',
        platform: 'tiktok',
        videoUrl: 'https://tiktok.com/@lucia.viajes.pe/video/7402910293',
        title: 'Shambar Trujillano: El secreto de los lunes 🥣',
        caption:
          'No puedes decir que conoces Trujillo si no probaste el shambar tradicional. La historia detrás de este plato en el restaurante más poético.',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
        votesCount: 215,
        viewsCount: 14500,
        submittedAt: '2026-11-05T16:40:00Z',
        status: 'approved',
      },
    ],
    status: 'active',
    createdAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'camp_big_ben_huanchaco',
    title: 'Campaña: El Ceviche frente a los Caballitos de Totora',
    businessName: 'Big Ben Huanchaco',
    placeId: 'place_big_ben_huanchaco',
    localityId: 'huanchaco',
    startDate: '2026-11-05',
    endDate: '2026-12-10',
    description:
      'Restaurante marino icónico frente a la playa de Huanchaco. Convocamos a creadores de video para capturar la esencia del mar norteño, los caballitos de totora y el mejor ceviche con ají mochero.',
    videoBrief:
      'Video de 30-45 segundos con tomas cinematográficas del océano, pescadores artesanales y la mesa servida en la terraza marina de Big Ben.',
    requirements: [
      'Grabar en el balneario de Huanchaco',
      'Mostrar la vista al mar y la propuesta gastronómica',
      'Mencionar los premios del concurso en LibertadGO',
    ],
    hashtags: ['#LibertadGO', '#BigBenHuanchaco', '#HuanchacoBeach', '#CevicheMochero'],
    prizes: {
      first: {
        position: 1,
        title: '1º Puesto — Oro',
        badge: '🥇 Mejor Video Marino',
        cashPEN: 1500,
        perks: [
          'S/ 1,500 en efectivo',
          'Noche de alojamiento en Suite frente al mar en Huanchaco',
          'Almuerzo marino exclusivo para 4 personas',
          'Paseo guiado en Caballito de Totora',
        ],
      },
      second: {
        position: 2,
        title: '2º Puesto — Plata',
        badge: '🥈 Segundo Lugar',
        cashPEN: 800,
        perks: [
          'S/ 800 en efectivo',
          'Ronda marina de degustación para 2 personas en Big Ben',
          'Certificado de reconocimiento',
        ],
      },
      third: {
        position: 3,
        title: '3º Puesto — Bronce',
        badge: '🥉 Tercer Lugar',
        cashPEN: 400,
        perks: [
          'S/ 400 en efectivo',
          'Ceviche clásico y piqueo de chicharrón para 2',
          'Difusión en canales de LibertadGO',
        ],
      },
    },
    submissions: [
      {
        id: 'sub_bb_1',
        campaignId: 'camp_big_ben_huanchaco',
        creatorName: 'Renzo Díaz',
        creatorHandle: '@renzowaves_pe',
        platform: 'tiktok',
        videoUrl: 'https://tiktok.com/@renzowaves_pe/video/7412891029',
        title: 'Sunset mágico y ceviche fresco en Huanchaco 🏄‍♂️🌅',
        caption:
          'La combinación perfecta: olas, caballitos de totora milenarios y un ceviche con ají mochero en la terraza de Big Ben. ¡Vota por este video!',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        votesCount: 410,
        viewsCount: 35200,
        submittedAt: '2026-11-06T09:00:00Z',
        status: 'featured',
      },
      {
        id: 'sub_bb_2',
        campaignId: 'camp_big_ben_huanchaco',
        creatorName: 'Maritza Flores',
        creatorHandle: '@maritza_explora',
        platform: 'reels',
        videoUrl: 'https://instagram.com/reel/DD019283k',
        title: 'El Cangrejo Reventado que debes probar',
        caption:
          'Una receta ancestral liberteña servida con la mejor vista al muelle de Huanchaco. ¿Ya sabías de este plato típico?',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
        votesCount: 295,
        viewsCount: 22100,
        submittedAt: '2026-11-06T11:30:00Z',
        status: 'approved',
      },
    ],
    status: 'active',
    createdAt: '2026-11-05T10:00:00Z',
  },
  {
    id: 'camp_malabrigo_chicama',
    title: 'Desafío Ola Izquierda: Surf & Hospedaje Malabrigo',
    businessName: 'Chicama Boutique Hotel & Surf',
    placeId: 'place_chicama_resort',
    localityId: 'puerto_malabrigo',
    startDate: '2026-11-10',
    endDate: '2026-12-20',
    description:
      'Puerto Malabrigo alberga la ola izquierda perfecta más larga del planeta. Invitamos a surfistas y videógrafos a capturar la emoción de surfear Chicama y relajarse con gastronomía costera.',
    videoBrief:
      'Video de acción y estilo de vida mostrando la ola infinita de Chicama, la caleta de pescadores y el confort del hotel con vista panorámica.',
    requirements: [
      'Tomas de surf o dron de la bahía de Malabrigo',
      'Mostrar las instalaciones del hotel / restaurante',
      'Etiqueta #OlaMasLarga y #LibertadGO',
    ],
    hashtags: ['#LibertadGO', '#ChicamaSurf', '#PuertoMalabrigo', '#OlaIzquierda', '#SurfPeru'],
    prizes: {
      first: {
        position: 1,
        title: '1º Puesto — Oro',
        badge: '🥇 Mejor Video de Aventura',
        cashPEN: 1500,
        perks: [
          'S/ 1,500 en efectivo',
          'Estadía de 3 días / 2 noches para 2 con servicio de lancha de surf',
          'Sesión fotográfica profesional en el agua',
        ],
      },
      second: {
        position: 2,
        title: '2º Puesto — Plata',
        badge: '🥈 Segundo Lugar',
        cashPEN: 800,
        perks: [
          'S/ 800 en efectivo',
          'Estadía de 1 noche con desayuno buffet frente a la ola',
          'Pack de indumentaria surfista Chicama',
        ],
      },
      third: {
        position: 3,
        title: '3º Puesto — Bronce',
        badge: '🥉 Tercer Lugar',
        cashPEN: 400,
        perks: [
          'S/ 400 en efectivo',
          'Almuerzo especial para 2 en el restaurante del hotel',
          'Certificado de participación',
        ],
      },
    },
    submissions: [],
    status: 'active',
    createdAt: '2026-11-06T12:00:00Z',
  },
];
