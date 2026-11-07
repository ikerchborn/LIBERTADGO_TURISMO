// server.ts
import "dotenv/config";
import fs from "fs";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// src/server/routes.ts
import { Router } from "express";

// src/data/initialPlaces.ts
var INITIAL_PLACES = [
  // ==========================================
  // TRUJILLO (CAPITAL Y CENTRO HISTÓRICO)
  // ==========================================
  {
    id: "place_rincon_vallejo",
    slug: "el-rincon-de-vallejo",
    name: "El Rinc\xF3n de Vallejo",
    category: "restaurantes",
    subcategory: "Comida Criolla Tradicional",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Orbegoso 311, Centro Hist\xF3rico de Trujillo",
    coordinates: { lat: -8.11285, lng: -79.02985 },
    geohash: "6w3qu8j",
    shortDescription: "Cuna culinaria en el coraz\xF3n de Trujillo con el legendario cabrito a la norte\xF1a y papa rellena artesanal.",
    fullDescription: "El Rinc\xF3n de Vallejo es una instituci\xF3n gastron\xF3mica en el centro de Trujillo. Ubicado a una cuadra de la Plaza de Armas, rinde homenaje al poeta universal C\xE9sar Vallejo con platos emblem\xE1ticos de la cocina liberte\xF1a.",
    phone: "+51 44 226232",
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 7024,
    images: [
      {
        id: "img_rv_1",
        url: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114710_4377a8b3.png",
        caption: "Cabrito a la norte\xF1a con frijoles y zarza criolla",
        isCover: true
      }
    ],
    openingHours: [
      { dayOfWeek: 1, openTime: "07:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: 2, openTime: "07:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: 3, openTime: "07:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: 4, openTime: "07:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: 5, openTime: "07:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: 6, openTime: "07:00", closeTime: "23:00", isClosed: false },
      { dayOfWeek: 0, openTime: "07:00", closeTime: "23:00", isClosed: false }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-03-01",
      notes: "Directorio formal MINCETUR de prestadores tur\xEDsticos de Trujillo"
    },
    sources: [
      {
        placeId: "place_rincon_vallejo",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-TRU-001",
        lastSyncedAt: "2026-10-15"
      }
    ],
    tags: ["Cabrito norte\xF1o", "Papa rellena", "Seco trujillano", "Centro Hist\xF3rico"],
    recommendedDurationMinutes: 75
  },
  {
    id: "place_celler_cler",
    slug: "el-celler-de-cler",
    name: "El Celler de Cler",
    category: "restaurantes",
    subcategory: "Cocina de Autor y Parrilla",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Independencia 610, Centro Hist\xF3rico de Trujillo",
    coordinates: { lat: -8.11022, lng: -79.03055 },
    geohash: "6w3qu9m",
    shortDescription: "Casona colonial restaurada que combina elegancia arquitect\xF3nica con cortes selectos y alta cocina norte\xF1a.",
    fullDescription: "Ubicado en una hermosa edificaci\xF3n colonial con arquer\xEDa cl\xE1sica de madera y patios tradicionales, El Celler de Cler es uno de los espacios gastron\xF3micos m\xE1s destacados de La Libertad.",
    phone: "+51 44 291580",
    priceLevel: 3,
    rating: 4.6,
    reviewsCount: 693,
    images: [
      {
        id: "img_cc_1",
        url: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114806_d0ad01fd.png",
        caption: "Cava de vinos y comedor colonial de El Celler de Cler",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-20"
    },
    sources: [
      {
        placeId: "place_celler_cler",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-TRU-042",
        lastSyncedAt: "2026-10-20"
      }
    ],
    tags: ["Cava de vinos", "Cortes selectos", "Arquitectura virreinal"],
    recommendedDurationMinutes: 90
  },
  {
    id: "place_demarco",
    slug: "restaurant-cafe-demarco",
    name: "Demarco Restaurant & Caf\xE9",
    category: "restaurantes",
    subcategory: "Caf\xE9 Tradicional & Pasteler\xEDa Fina",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Pizarro 725, Paseo Peatonal Pizarro",
    coordinates: { lat: -8.1108, lng: -79.0312 },
    geohash: "6w3qu9h",
    shortDescription: "Cl\xE1sico punto de encuentro trujillano sobre el Paseo Pizarro con pastas caseras, s\xE1nguches y pasteler\xEDa.",
    fullDescription: "Con m\xE1s de 50 a\xF1os de tradici\xF3n en el paseo peatonal Pizarro, Demarco ofrece desayunos trujillanos, caf\xE9 de Chanchamayo, empanadas de lomo y postres cl\xE1sicos norte\xF1os en un ambiente familiar y seguro.",
    phone: "+51 44 232251",
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 3120,
    images: [
      {
        id: "img_demarco_1",
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
        caption: "Sal\xF3n interior y terraza de caf\xE9 Demarco",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-25"
    },
    sources: [
      {
        placeId: "place_demarco",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-TRU-018",
        lastSyncedAt: "2026-10-15"
      }
    ],
    tags: ["Paseo Pizarro", "Caf\xE9", "Pasteler\xEDa", "Desayunos"],
    recommendedDurationMinutes: 50
  },
  {
    id: "place_fiesta_trujillo",
    slug: "fiesta-gourmet-trujillo",
    name: "Fiesta Gourmet Trujillo",
    category: "restaurantes",
    subcategory: "Alta Cocina Norte\xF1a",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Av. Prolongaci\xF3n Vallejo Mz. G Lt. 1, Urb. Real Plaza",
    coordinates: { lat: -8.1255, lng: -79.0238 },
    geohash: "6w3qu92",
    shortDescription: "Templo de la alta gastronom\xEDa norte\xF1a: ceviche caliente a la brasa, arroz con pato y mero murique.",
    fullDescription: "Reconocido a nivel nacional e internacional, Fiesta eleva los ingredientes emblem\xE1ticos del norte peruano a la alta cocina, con t\xE9cnicas de cocci\xF3n al carb\xF3n de algarrobo y pescados nobles de la costa liberte\xF1a.",
    phone: "+51 44 282270",
    priceLevel: 4,
    rating: 4.8,
    reviewsCount: 1890,
    images: [
      {
        id: "img_fiesta_1",
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        caption: "Ceviche a las brasas de carb\xF3n de algarrobo",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-18"
    },
    sources: [
      {
        placeId: "place_fiesta_trujillo",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-TRU-050",
        lastSyncedAt: "2026-10-22"
      }
    ],
    tags: ["Ceviche caliente", "Arroz con pato", "Alta cocina", "Algarrobo"],
    recommendedDurationMinutes: 100
  },
  {
    id: "place_squalo_fast",
    slug: "squalo-fast-marisqueria",
    name: "Squalo Fast Marisquer\xEDa",
    category: "restaurantes",
    subcategory: "Cevicher\xEDa Marina",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Av. Mansiche 1029, Trujillo",
    coordinates: { lat: -8.1025, lng: -79.0384 },
    geohash: "6w3qu97",
    shortDescription: "Cevicher\xEDa trujillana de culto, famosa por su leche de tigre con conchas negras, chicharr\xF3n de calamar y ronda marina.",
    phone: "+51 44 205560",
    priceLevel: 2,
    rating: 4.6,
    reviewsCount: 2450,
    images: [
      {
        id: "img_squalo_1",
        url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        caption: "Ceviche mixto con canchita y chicharr\xF3n crocante",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-01-30"
    },
    sources: [
      {
        placeId: "place_squalo_fast",
        sourceId: "openstreetmap",
        externalId: "OSM-NODE-7812903",
        lastSyncedAt: "2026-10-15"
      }
    ],
    tags: ["Ceviche mixto", "Leche de tigre", "Conchas negras", "Mansiche"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_dona_peta",
    slug: "restaurante-dona-peta",
    name: "Restaurante Do\xF1a Peta",
    category: "restaurantes",
    subcategory: "Comida T\xEDpica Liberte\xF1a",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Av. Am\xE9rica Sur 2408, San Andr\xE9s",
    coordinates: { lat: -8.1189, lng: -79.0345 },
    geohash: "6w3qu8t",
    shortDescription: "Lunes de Sh\xE1mbar tradicional trujillano, cecina con yuca y cabrito con tamalito verde.",
    phone: "+51 44 290120",
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 1640,
    images: [
      {
        id: "img_peta_1",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        caption: "Plato tradicional de Sh\xE1mbar trujillano",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-15"
    },
    sources: [
      {
        placeId: "place_dona_peta",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-TRU-027",
        lastSyncedAt: "2026-10-18"
      }
    ],
    tags: ["Sh\xE1mbar", "Lunes trujillano", "Seco de cabrito", "San Andr\xE9s"],
    recommendedDurationMinutes: 70
  },
  {
    id: "place_plaza_armas_trujillo",
    slug: "plaza-mayor-de-trujillo",
    name: "Plaza Mayor de Trujillo",
    category: "atractivos",
    subcategory: "Patrimonio C\xEDvico Monumental",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Plaza de Armas, Centro Hist\xF3rico de Trujillo",
    coordinates: { lat: -8.11182, lng: -79.02871 },
    geohash: "6w3qu8w",
    shortDescription: "Una de las plazas m\xE1s amplias y se\xF1oriales del Per\xFA, con el Monumento a la Libertad y la Catedral.",
    fullDescription: "Epicentro hist\xF3rico y cultural de Trujillo. Destaca el imponente Monumento a la Libertad esculpido por Edmund Moeller, flanqueado por las casonas coloniales con ventanales de reja de fierro forjado y la Bas\xEDlica Menor.",
    priceLevel: 1,
    rating: 4.8,
    reviewsCount: 37260,
    images: [
      {
        id: "img_pm_1",
        url: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114428_29ab2ca8.png",
        caption: "Bas\xEDlica Catedral de Santa Mar\xEDa y Plaza Mayor iluminada al atardecer",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-10"
    },
    sources: [
      {
        placeId: "place_plaza_armas_trujillo",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0012",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Monumento a la Libertad", "Catedral", "Centro C\xEDvico", "Casonas"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_catedral_trujillo",
    slug: "catedral-de-trujillo-basilica-menor",
    name: "Bas\xEDlica Menor y Catedral de Trujillo",
    category: "atractivos",
    subcategory: "Templo Virreinal y Arte Sacro",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Plaza Mayor esq. Jr. Orbegoso, Centro Hist\xF3rico",
    coordinates: { lat: -8.1114, lng: -79.0292 },
    geohash: "6w3qu8v",
    shortDescription: "Construida entre 1647 y 1666, con fachada amarillo ocre colonial, retablo mayor churrigueresco y Museo Catedralicio.",
    phone: "+51 44 246520",
    priceLevel: 1,
    rating: 4.7,
    reviewsCount: 8430,
    images: [
      {
        id: "img_cat_1",
        url: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114428_29ab2ca8.png",
        caption: "Campanarios barrocos de la Catedral de Trujillo",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-12"
    },
    sources: [
      {
        placeId: "place_catedral_trujillo",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0013",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Arte virreinal", "Retablo barroco", "Museo Catedralicio", "Plaza de Armas"],
    recommendedDurationMinutes: 45
  },
  {
    id: "place_casa_urquiaga",
    slug: "casa-urquiaga-calonge",
    name: "Casa Urquiaga (Calonge)",
    category: "museos",
    subcategory: "Casona Hist\xF3rica y Museo",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Pizarro 446, Centro Hist\xF3rico",
    coordinates: { lat: -8.11145, lng: -79.02805 },
    geohash: "6w3qu8x",
    shortDescription: "Mansi\xF3n neocl\xE1sica donde se aloj\xF3 Sim\xF3n Bol\xEDvar, con valiosa orfebrer\xEDa Chim\xFA y mobiliario virreinal.",
    priceLevel: 1,
    rating: 4.7,
    reviewsCount: 1840,
    images: [
      {
        id: "img_cu_1",
        url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80",
        caption: "Patio principal con pisos de laja y carpinter\xEDa hist\xF3rica",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-15"
    },
    sources: [
      {
        placeId: "place_casa_urquiaga",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0045",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Sim\xF3n Bol\xEDvar", "Mobiliario virreinal", "Orfebrer\xEDa Chim\xFA"],
    recommendedDurationMinutes: 45
  },
  {
    id: "place_casa_emancipacion",
    slug: "casa-de-la-emancipacion-fundacion-bbva",
    name: "Casa de la Emancipaci\xF3n (BBVA)",
    category: "museos",
    subcategory: "Casona C\xEDvica y Centro Cultural",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Pizarro 610, Centro Hist\xF3rico",
    coordinates: { lat: -8.1105, lng: -79.0302 },
    geohash: "6w3qu9k",
    shortDescription: "Lugar donde don Jos\xE9 Bernardo de Tagle proclam\xF3 la independencia de Trujillo en 1820. Exposiciones de arte gratuitas.",
    phone: "+51 44 246061",
    priceLevel: 1,
    rating: 4.8,
    reviewsCount: 4210,
    images: [
      {
        id: "img_emancip_1",
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        caption: "Patio principal neocl\xE1sico con arquer\xEDa restaurada",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-18"
    },
    sources: [
      {
        placeId: "place_casa_emancipacion",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0046",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Independencia", "Torre Tagle", "Exposiciones de arte", "Centro cultural"],
    recommendedDurationMinutes: 40
  },
  {
    id: "place_museo_arqueologia_unt",
    slug: "museo-de-arqueologia-antropologia-e-historia-unt",
    name: "Museo de Arqueolog\xEDa de la UNT",
    category: "museos",
    subcategory: "Museo Universitario de Prehistoria",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Jun\xEDn 682, Centro Hist\xF3rico",
    coordinates: { lat: -8.1132, lng: -79.0321 },
    geohash: "6w3qu8c",
    shortDescription: "Casona Risco con colecciones de cer\xE1mica, textiles y metalurgia de las culturas Cupisnique, Salinar, Moche y Chim\xFA.",
    phone: "+51 44 249000",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 1540,
    images: [
      {
        id: "img_munt_1",
        url: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80",
        caption: "Salas de orfebrer\xEDa y cer\xE1mica Moche en Casa Risco",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-20"
    },
    sources: [
      {
        placeId: "place_museo_arqueologia_unt",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0048",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Casa Risco", "Mochica", "Chim\xFA", "Cupisnique", "Patrimonio UNT"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_plazuela_recreo",
    slug: "plazuela-el-recreo-caja-de-agua",
    name: "Plazuela El Recreo y Antigua Caja de Agua",
    category: "atractivos",
    subcategory: "Espacio P\xFAblico Hist\xF3rico",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Pizarro cdra. 9, Centro Hist\xF3rico",
    coordinates: { lat: -8.1092, lng: -79.0255 },
    geohash: "6w3qu9p",
    shortDescription: "Hermosa plazuela arbolada con la fuente original de la Plaza Mayor y la antigua caja distribuidora de agua colonial.",
    priceLevel: 1,
    rating: 4.5,
    reviewsCount: 2890,
    images: [
      {
        id: "img_rec_1",
        url: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
        caption: "Plazuela El Recreo con ficus centenarios",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-10"
    },
    sources: [
      {
        placeId: "place_plazuela_recreo",
        sourceId: "openstreetmap",
        externalId: "OSM-WAY-4819032",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Ficus centenarios", "Caja de agua", "Fuente de m\xE1rmol", "Paseo peatonal"],
    recommendedDurationMinutes: 30
  },
  {
    id: "place_hotel_costa_sol_trujillo",
    slug: "hotel-costa-del-sol-trujillo-centro",
    name: "Hotel Costa del Sol Wyndham Trujillo Centro",
    category: "hoteles",
    subcategory: "Hospedaje Colonial 4 Estrellas",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Los Cocoteros 505 / Plaza Mayor de Trujillo",
    coordinates: { lat: -8.11195, lng: -79.02755 },
    geohash: "6w3qu8z",
    shortDescription: "Hotel se\xF1orial con arquitectura colonial frente a la Plaza de Armas, piscina y patio de palmeras.",
    fullDescription: "Estrat\xE9gicamente situado en el casco monumental trujillano, ofrece habitaciones con techos altos, restaurante con cocina norte\xF1a y comodidades modernas para viajes de placer o negocios.",
    phone: "+51 44 232741",
    priceLevel: 3,
    rating: 4.7,
    reviewsCount: 1731,
    images: [
      {
        id: "img_hotel_tru_1",
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        caption: "Fachada y patio colonial del Hotel Costa del Sol Trujillo",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-01"
    },
    sources: [
      {
        placeId: "place_hotel_costa_sol_trujillo",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-HOSP-TRU-008",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Plaza de Armas", "Piscina", "Hospedaje 4 estrellas", "Centro Hist\xF3rico"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_gran_recreo_hotel",
    slug: "gran-recreo-hotel-trujillo",
    name: "Gran Recreo Hotel",
    category: "hoteles",
    subcategory: "Hotel 3 Estrellas Superior",
    localityId: "trujillo",
    localityName: "Trujillo",
    address: "Jr. Estete 460, Centro Hist\xF3rico",
    coordinates: { lat: -8.1101, lng: -79.0268 },
    geohash: "6w3qu9q",
    shortDescription: "Hotel acogedor a tres cuadras de la Plaza de Armas, con piscina temperada, restaurante y desayuno buffet.",
    phone: "+51 44 246991",
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 1220,
    images: [
      {
        id: "img_gr_1",
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        caption: "Piscina y \xE1rea de descanso de Gran Recreo Hotel",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-01-22"
    },
    sources: [
      {
        placeId: "place_gran_recreo_hotel",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-HOSP-TRU-015",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Piscina temperada", "Centro Hist\xF3rico", "Desayuno buffet"],
    recommendedDurationMinutes: 60
  },
  // ==========================================
  // HUANCHACO (BALNEARIO Y ARQUEOLOGÍA)
  // ==========================================
  {
    id: "place_chan_chan",
    slug: "complejo-arqueologico-chan-chan",
    name: "Complejo Arqueol\xF3gico Chan Chan (Palacio Nik An)",
    category: "arqueologia",
    subcategory: "Patrimonio de la Humanidad UNESCO",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Carretera a Huanchaco Km 5, Huanchaco / Trujillo",
    coordinates: { lat: -8.10915, lng: -79.07255 },
    geohash: "6w3qu2r",
    shortDescription: "La ciudadela de adobe m\xE1s extensa de Am\xE9rica prehisp\xE1nica, capital del milenario reino Chim\xFA.",
    fullDescription: "Maravilla arqueol\xF3gica reconocida por la UNESCO. Destaca el Conjunto Amurallado Nik An (ex Tschudi) con sus muros con frisos de peces, aves marinas y redes ceremoniales de pesca.",
    priceLevel: 2,
    rating: 4.8,
    reviewsCount: 15420,
    images: [
      {
        id: "img_chanchan_1",
        url: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114622_427c99b7.png",
        caption: "Frisos de adobe en el Conjunto Nik An de Chan Chan",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-05"
    },
    sources: [
      {
        placeId: "place_chan_chan",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0001",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["UNESCO", "Reino Chim\xFA", "Ciudad de adobe", "Frisos marinos"],
    recommendedDurationMinutes: 120
  },
  {
    id: "place_museo_sitio_chanchan",
    slug: "museo-de-sitio-de-chan-chan",
    name: "Museo de Sitio de Chan Chan",
    category: "museos",
    subcategory: "Museo Arqueol\xF3gico de Sitio",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Carretera Huanchaco Km 4.5",
    coordinates: { lat: -8.0998, lng: -79.0682 },
    geohash: "6w3qu2y",
    shortDescription: "Exhibe \xEDdolos de madera con ojos de n\xE1car, textiles ceremoniales, maquetas del complejo y maquetas de la agricultura chim\xFA.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 3820,
    images: [
      {
        id: "img_mchan_1",
        url: "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=800&q=80",
        caption: "\xCDdolos ceremoniales de madera chim\xFA",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-08"
    },
    sources: [
      {
        placeId: "place_museo_sitio_chanchan",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0035",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["\xCDdolos de madera", "Maquetas", "Chim\xFA", "Museo de sitio"],
    recommendedDurationMinutes: 45
  },
  {
    id: "place_muelle_huanchaco",
    slug: "muelle-y-playa-huanchaco",
    name: "Muelle Hist\xF3rico y Playa Huanchaco",
    category: "playas",
    subcategory: "Reserva Mundial de Surf y Balneario",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Av. V\xEDctor Larco Herrera s/n, Malec\xF3n de Huanchaco",
    coordinates: { lat: -8.0792, lng: -79.1215 },
    geohash: "6w3qu04",
    shortDescription: "Balsillas milenarias de totora, brisa del Pac\xEDfico, atardeceres m\xE1gicos y el muelle de madera de 1891.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 8940,
    images: [
      {
        id: "img_muelle_h_1",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        caption: "Caballitos de totora descansando en la arena de Huanchaco",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-12"
    },
    sources: [
      {
        placeId: "place_muelle_huanchaco",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0003",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Caballitos de totora", "Surf", "Atardeceres", "Pescadores"],
    recommendedDurationMinutes: 90
  },
  {
    id: "place_big_ben_huanchaco",
    slug: "restaurante-big-ben-huanchaco",
    name: "Restaurante Big Ben Huanchaco",
    category: "restaurantes",
    subcategory: "Cevicher\xEDa & Cocina Marina Tradicional",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Av. V\xEDctor Larco Herrera 1184, Malec\xF3n Huanchaco",
    coordinates: { lat: -8.0768, lng: -79.1232 },
    geohash: "6w3qu05",
    shortDescription: "Referente emblem\xE1tico del ceviche tradicional con pescado del d\xEDa y vista panor\xE1mica al mar y caballitos de totora.",
    fullDescription: "Famoso por su ceviche de lenguado, arroz con mariscos y causa norte\xF1a frente a las olas de Huanchaco. Uno de los restaurantes marinos m\xE1s premiados de La Libertad.",
    phone: "+51 44 461869",
    priceLevel: 3,
    rating: 4.6,
    reviewsCount: 3410,
    images: [
      {
        id: "img_bb_1",
        url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        caption: "Ceviche fresco de pescado con camote y canchita",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-25"
    },
    sources: [
      {
        placeId: "place_big_ben_huanchaco",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-HUA-002",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Ceviche", "Vista al mar", "Mariscos frescos", "Malec\xF3n"],
    recommendedDurationMinutes: 80
  },
  {
    id: "place_club_colonial_huanchaco",
    slug: "club-colonial-huanchaco",
    name: "Restaurant Club Colonial Huanchaco",
    category: "restaurantes",
    subcategory: "Cocina Marina Fusi\xF3n",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Av. Larco 402, Huanchaco",
    coordinates: { lat: -8.0781, lng: -79.1211 },
    geohash: "6w3qu01",
    shortDescription: "Ceviche a las hierbas, pulpo a la parrilla y pescados al horno en terraza con brisa marina.",
    phone: "+51 44 461015",
    priceLevel: 3,
    rating: 4.5,
    reviewsCount: 1180,
    images: [
      {
        id: "img_colonial_1",
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        caption: "Pulpo a la brasa con papas nativas doradas",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-14"
    },
    sources: [
      {
        placeId: "place_club_colonial_huanchaco",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-HUA-009",
        lastSyncedAt: "2026-10-10"
      }
    ],
    tags: ["Pulpo a la brasa", "Terraza marina", "Vinos", "Malec\xF3n"],
    recommendedDurationMinutes: 75
  },
  {
    id: "place_pisagua_huanchaco",
    slug: "marisqueria-pisagua-huanchaco",
    name: "Marisquer\xEDa Pisagua",
    category: "restaurantes",
    subcategory: "Ceviches Tradicionales al Paso",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Av. V\xEDctor Larco 701, Huanchaco",
    coordinates: { lat: -8.0775, lng: -79.1219 },
    geohash: "6w3qu02",
    shortDescription: "Ceviche aut\xE9ntico de tollo y chicharr\xF3n crocante preferido por los pescadores locales de Huanchaco.",
    phone: "+51 44 461230",
    priceLevel: 1,
    rating: 4.4,
    reviewsCount: 1950,
    images: [
      {
        id: "img_pisagua_1",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        caption: "Ceviche de pescado fresco con zarandaja",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-01-28"
    },
    sources: [
      {
        placeId: "place_pisagua_huanchaco",
        sourceId: "openstreetmap",
        externalId: "OSM-NODE-8912401",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Ceviche econ\xF3mico", "Sabor tradicional", "Pescadores"],
    recommendedDurationMinutes: 45
  },
  {
    id: "place_santuario_socorro",
    slug: "santuario-virgen-del-socorro-huanchaco",
    name: "Santuario de la Virgen del Socorro",
    category: "atractivos",
    subcategory: "Templo Virreinal en Colina",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Cerro Huanchaco Alto s/n",
    coordinates: { lat: -8.0752, lng: -79.1175 },
    geohash: "6w3qu09",
    shortDescription: "Segunda iglesia m\xE1s antigua del Per\xFA (1540), ubicada en lo alto de la colina con vista panor\xE1mica de la bah\xEDa.",
    priceLevel: 1,
    rating: 4.7,
    reviewsCount: 2210,
    images: [
      {
        id: "img_socorro_1",
        url: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
        caption: "Vista de la bah\xEDa de Huanchaco desde el santuario",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-20"
    },
    sources: [
      {
        placeId: "place_santuario_socorro",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0036",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Mirador", "Virgen del Socorro", "Siglo XVI", "Vista panor\xE1mica"],
    recommendedDurationMinutes: 40
  },
  {
    id: "place_hotel_bracamonte_huanchaco",
    slug: "hostal-bracamonte-huanchaco",
    name: "Hotel Bracamonte Huanchaco",
    category: "hoteles",
    subcategory: "Hospedaje de Playa con Jardines",
    localityId: "huanchaco",
    localityName: "Huanchaco",
    address: "Los Ficus 122, Huanchaco",
    coordinates: { lat: -8.0772, lng: -79.1205 },
    geohash: "6w3qu06",
    shortDescription: "Agradable hotel de playa con jardines tropicales, piscina al aire libre y ambiente acogedor a 100m del mar.",
    phone: "+51 44 461162",
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 920,
    images: [
      {
        id: "img_brac_1",
        url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        caption: "Piscina y jardines del Hotel Bracamonte en Huanchaco",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-30"
    },
    sources: [
      {
        placeId: "place_hotel_bracamonte_huanchaco",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-HOSP-HUA-004",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Piscina", "Jardines", "Surf stay", "A pasos del mar"],
    recommendedDurationMinutes: 60
  },
  // ==========================================
  // MOCHE (CULTURA MOCHICA Y GASTRONOMÍA CAMPIÑERA)
  // ==========================================
  {
    id: "place_huacas_sol_luna",
    slug: "huacas-del-sol-y-de-la-luna",
    name: "Huacas del Sol y de la Luna",
    category: "arqueologia",
    subcategory: "Santuario Ceremonial Mochica",
    localityId: "moche",
    localityName: "Moche",
    address: "Campi\xF1a de Moche s/n, Valle de Moche",
    coordinates: { lat: -8.13455, lng: -78.99125 },
    geohash: "6w3quf9",
    shortDescription: "Centro ceremonial de la cultura Moche con policrom\xEDas dedicadas a la deidad Ai Apaec.",
    fullDescription: "Ubicadas al pie del Cerro Blanco, estas pir\xE1mides truncas de adobe constituyen uno de los mayores logros arquitect\xF3nicos de la civilizaci\xF3n andina. El museo de sitio exhibe una extraordinaria colecci\xF3n de cer\xE1mica y metales.",
    priceLevel: 2,
    rating: 4.9,
    reviewsCount: 11250,
    images: [
      {
        id: "img_huacas_sol_1",
        url: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114622_427c99b7.png",
        caption: "Murales policromados de la Huaca de la Luna con el Dios Degollador",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-08"
    },
    sources: [
      {
        placeId: "place_huacas_sol_luna",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0002",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Mochica", "Ai Apaec", "Murales policromados", "Cerro Blanco"],
    recommendedDurationMinutes: 120
  },
  {
    id: "place_museo_huacas_moche",
    slug: "museo-santiago-uceda-castillo-huacas-de-moche",
    name: "Museo Santiago Uceda Castillo (Huacas de Moche)",
    category: "museos",
    subcategory: "Museo Arqueol\xF3gico de Sitio",
    localityId: "moche",
    localityName: "Moche",
    address: "Camino a las Huacas de Moche s/n",
    coordinates: { lat: -8.1362, lng: -78.9945 },
    geohash: "6w3quf8",
    shortDescription: "Moderno museo de sitio con ceramios mochicas originales, maquetas y ajuares de sacerdotes guerreros.",
    priceLevel: 1,
    rating: 4.8,
    reviewsCount: 4620,
    images: [
      {
        id: "img_mmoche_1",
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        caption: "Huacos retrato mochica expuestos en vitrinas climatizadas",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-10"
    },
    sources: [
      {
        placeId: "place_museo_huacas_moche",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0038",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Huacos retrato", "Guerreros Moche", "Santiago Uceda", "Cer\xE1mica"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_mochica_campina",
    slug: "restaurante-el-mochica-campina",
    name: "Restaurante El Mochica de Moche",
    category: "restaurantes",
    subcategory: "Gastronom\xEDa Campi\xF1era & Sopa Te\xF3loga",
    localityId: "moche",
    localityName: "Moche",
    address: "Carretera a la Huaca del Sol Km 4, Campi\xF1a de Moche",
    coordinates: { lat: -8.152, lng: -79.001 },
    geohash: "6w3quf1",
    shortDescription: "Cuna de la aut\xE9ntica Sopa Te\xF3loga, cabrito a la chicha de jora y pato guisado en horno de le\xF1a.",
    phone: "+51 44 293444",
    priceLevel: 2,
    rating: 4.7,
    reviewsCount: 4210,
    images: [
      {
        id: "img_mochica_camp_1",
        url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        caption: "Sopa Te\xF3loga tradicional de la campi\xF1a de Moche",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-14"
    },
    sources: [
      {
        placeId: "place_mochica_campina",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-MOC-001",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Sopa Te\xF3loga", "Campi\xF1a", "Pato a la le\xF1a", "Chicha de jora"],
    recommendedDurationMinutes: 90
  },
  {
    id: "place_sol_y_luna_restaurant",
    slug: "restaurant-campestre-sol-y-luna",
    name: "Restaurante Campestre Sol y Luna",
    category: "restaurantes",
    subcategory: "Comida Criolla Campestre",
    localityId: "moche",
    localityName: "Moche",
    address: "Campi\xF1a de Moche, Calle Los Huertos 210",
    coordinates: { lat: -8.1485, lng: -78.9978 },
    geohash: "6w3quf3",
    shortDescription: "Parrillas al aire libre, cuy frito con ajiaco y chicha morada con vista al Cerro Blanco.",
    phone: "+51 44 472150",
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 1530,
    images: [
      {
        id: "img_sol_luna_1",
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        caption: "Sal\xF3n campestre con jardines florales",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-12"
    },
    sources: [
      {
        placeId: "place_sol_y_luna_restaurant",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-MOC-006",
        lastSyncedAt: "2026-10-05"
      }
    ],
    tags: ["Cuy frito", "Cabrito", "Campi\xF1a", "Jardines"],
    recommendedDurationMinutes: 75
  },
  {
    id: "place_plaza_moche",
    slug: "plaza-de-armas-de-moche",
    name: "Plaza de Armas de Moche y Esculturas Mochicas",
    category: "atractivos",
    subcategory: "Plaza Tem\xE1tica Cultural",
    localityId: "moche",
    localityName: "Moche",
    address: "Plaza de Armas de Moche, Pueblo Tradicional",
    coordinates: { lat: -8.1718, lng: -79.0094 },
    geohash: "6w3qucd",
    shortDescription: "Pintoresca plaza con esculturas a escala real de divinidades mochica, m\xFAsicos y guerreros tradicionales.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 3100,
    images: [
      {
        id: "img_plazamoche_1",
        url: "https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80",
        caption: "Escultura mochica ceremonial en la plaza de Moche",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-22"
    },
    sources: [
      {
        placeId: "place_plaza_moche",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0039",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Esculturas Moche", "Pueblo tradicional", "Plaza tem\xE1tica"],
    recommendedDurationMinutes: 40
  },
  // ==========================================
  // VÍCTOR LARCO HERRERA (ZONA COSTERA MODERNA)
  // ==========================================
  {
    id: "place_paseo_aguas",
    slug: "paseo-de-las-aguas-victor-larco",
    name: "Paseo de las Aguas",
    category: "atractivos",
    subcategory: "Parque Tem\xE1tico y Espacio Urbano",
    localityId: "victor-larco",
    localityName: "V\xEDctor Larco Herrera",
    address: "Av. Larco s/n, Vista Alegre",
    coordinates: { lat: -8.1382, lng: -79.0465 },
    geohash: "6w3qu62",
    shortDescription: "Complejo de fuentes ornamentales cibern\xE9ticas con t\xFAneles de agua y espect\xE1culos de luces nocturnas.",
    priceLevel: 1,
    rating: 4.5,
    reviewsCount: 3840,
    images: [
      {
        id: "img_pa_1",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        caption: "Fuentes ornamentales y \xE1reas verdes del Paseo de las Aguas",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-15"
    },
    sources: [
      {
        placeId: "place_paseo_aguas",
        sourceId: "openstreetmap",
        externalId: "OSM-WAY-9823412",
        lastSyncedAt: "2026-10-25"
      }
    ],
    tags: ["Fuentes cibern\xE9ticas", "Paseo familiar", "Noche trujillana"],
    recommendedDurationMinutes: 50
  },
  {
    id: "place_el_paisa_buenosaires",
    slug: "restaurante-el-paisa-cebicheria",
    name: "Cevicher\xEDa El Paisa",
    category: "restaurantes",
    subcategory: "Cevicher\xEDa Marina T\xEDpica",
    localityId: "victor-larco",
    localityName: "V\xEDctor Larco Herrera",
    address: "Av. Manuel Seoane 418, Buenos Aires Norte",
    coordinates: { lat: -8.1412, lng: -79.0528 },
    geohash: "6w3qu60",
    shortDescription: "Cl\xE1sica cevicher\xEDa coste\xF1a con porciones generosas de ceviche de tramboyo, corvina y chicharr\xF3n mixto.",
    phone: "+51 44 286540",
    priceLevel: 2,
    rating: 4.6,
    reviewsCount: 2890,
    images: [
      {
        id: "img_paisa_1",
        url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        caption: "Ceviche tradicional con chicharr\xF3n crocante",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-10"
    },
    sources: [
      {
        placeId: "place_el_paisa_buenosaires",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-DIR-VLH-004",
        lastSyncedAt: "2026-10-12"
      }
    ],
    tags: ["Buenos Aires", "Ceviche de tramboyo", "Chicharr\xF3n de pescado"],
    recommendedDurationMinutes: 65
  },
  {
    id: "place_hotel_costa_sol_golf",
    slug: "costa-del-sol-golf-victor-larco",
    name: "Costa del Sol Wyndham Trujillo Golf",
    category: "hoteles",
    subcategory: "Resort & Club de Golf",
    localityId: "victor-larco",
    localityName: "V\xEDctor Larco Herrera",
    address: "Av. El Golf 591, Urb. El Golf, V\xEDctor Larco",
    coordinates: { lat: -8.1395, lng: -79.0398 },
    geohash: "6w3qu65",
    shortDescription: "Resort contempor\xE1neo con piscina panor\xE1mica, canchas y terraza lounge en el distrito residencial de El Golf.",
    phone: "+51 44 480150",
    priceLevel: 4,
    rating: 4.8,
    reviewsCount: 1420,
    images: [
      {
        id: "img_golf_1",
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
        caption: "Piscina y terraza en el Costa del Sol Trujillo Golf",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-10"
    },
    sources: [
      {
        placeId: "place_hotel_costa_sol_golf",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-HOSP-VLH-001",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["El Golf", "Piscina", "Resort", "Gastronom\xEDa de autor"],
    recommendedDurationMinutes: 60
  },
  // ==========================================
  // LA ESPERANZA
  // ==========================================
  {
    id: "place_huaca_arco_iris",
    slug: "huaca-arco-iris-el-dragon",
    name: "Huaca Arco Iris (El Drag\xF3n)",
    category: "arqueologia",
    subcategory: "Monumento Ceremonial Chim\xFA",
    localityId: "la-esperanza",
    localityName: "La Esperanza",
    address: "Av. Mansiche s/n, Distrito de La Esperanza",
    coordinates: { lat: -8.0825, lng: -79.0438 },
    geohash: "6w3qu6n",
    shortDescription: "Pir\xE1mide ceremonial de adobe con frisos policromados que representan el arco iris, fertilidad y danzas rituales.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 2450,
    images: [
      {
        id: "img_huaca_ai_1",
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        caption: "Muros ceremoniales con frisos en adobe de la Huaca Arco Iris",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-28"
    },
    sources: [
      {
        placeId: "place_huaca_arco_iris",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0009",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Chim\xFA", "Arco Iris", "Frisos ceremoniales", "Adobe"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_huaca_esmeralda",
    slug: "huaca-la-esmeralda",
    name: "Huaca La Esmeralda",
    category: "arqueologia",
    subcategory: "Templo Chim\xFA",
    localityId: "la-esperanza",
    localityName: "La Esperanza",
    address: "Calle La Esmeralda s/n, Mansiche",
    coordinates: { lat: -8.0982, lng: -79.0415 },
    geohash: "6w3qu7e",
    shortDescription: "Estructura piramidal de adobe de dos plataformas con frisos de redes de pescar, nutrias y aves marinas.",
    priceLevel: 1,
    rating: 4.4,
    reviewsCount: 980,
    images: [
      {
        id: "img_esm_1",
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        caption: "Frisos geom\xE9tricos marinos en la Huaca La Esmeralda",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-18"
    },
    sources: [
      {
        placeId: "place_huaca_esmeralda",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0010",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Chim\xFA", "Redes de pesca", "Mansiche"],
    recommendedDurationMinutes: 45
  },
  // ==========================================
  // MAGDALENA DE CAO
  // ==========================================
  {
    id: "place_el_brujo",
    slug: "complejo-arqueologico-el-brujo-senora-de-cao",
    name: "Complejo Arqueol\xF3gico El Brujo (Se\xF1ora de Cao)",
    category: "arqueologia",
    subcategory: "Complejo Arqueol\xF3gico y Museo",
    localityId: "magdalena-cao",
    localityName: "Magdalena de Cao",
    address: "Valle de Chicama, Magdalena de Cao",
    coordinates: { lat: -7.9221, lng: -79.3045 },
    geohash: "6w3w02e",
    shortDescription: "Hogar del fardo funerario y ajuar de oro de la Se\xF1ora de Cao, gobernante moche de hace 1,700 a\xF1os.",
    priceLevel: 2,
    rating: 4.9,
    reviewsCount: 6240,
    images: [
      {
        id: "img_brujo_1",
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        caption: "Huaca Cao Viejo y Museo de Sitio de la Se\xF1ora de Cao",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-20"
    },
    sources: [
      {
        placeId: "place_el_brujo",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0005",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Se\xF1ora de Cao", "Huaca Cao Viejo", "Tatuajes ceremoniales", "Chicama"],
    recommendedDurationMinutes: 150
  },
  {
    id: "place_dona_rosa_cao",
    slug: "picanteria-dona-rosa-cao",
    name: "Picanter\xEDa Tradicional Do\xF1a Rosa",
    category: "restaurantes",
    subcategory: "Comida Tradicional & Chicha de A\xF1o",
    localityId: "magdalena-cao",
    localityName: "Magdalena de Cao",
    address: "Calle Real 315, Magdalena de Cao",
    coordinates: { lat: -7.9542, lng: -79.2415 },
    geohash: "6w3w018",
    shortDescription: "Causa en lapa campesina, pescado frito del d\xEDa y la famosa chicha de jora macerada en tinajas de barro.",
    phone: "+51 44 831120",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 890,
    images: [
      {
        id: "img_dcao_1",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        caption: "Causa en lapa con pescado salpreso",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-02-14"
    },
    sources: [
      {
        placeId: "place_dona_rosa_cao",
        sourceId: "openstreetmap",
        externalId: "OSM-NODE-9102451",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Chicha de a\xF1o", "Causa en lapa", "Magdalena de Cao"],
    recommendedDurationMinutes: 60
  },
  // ==========================================
  // PACASMAYO
  // ==========================================
  {
    id: "place_muelle_pacasmayo",
    slug: "muelle-historico-de-pacasmayo",
    name: "Muelle Hist\xF3rico de Pacasmayo",
    category: "atractivos",
    subcategory: "Patrimonio Ferroviario y Malec\xF3n",
    localityId: "pacasmayo",
    localityName: "Pacasmayo",
    address: "Malec\xF3n Grau s/n, Pacasmayo",
    coordinates: { lat: -7.4005, lng: -79.5742 },
    geohash: "6w3znb8",
    shortDescription: "Muelle de pilotes de hierro construido en 1874 con casi un kil\xF3metro de longitud sobre el mar.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 2980,
    images: [
      {
        id: "img_pacas_1",
        url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        caption: "Muelle centenario de Pacasmayo hacia el ocaso",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-18"
    },
    sources: [
      {
        placeId: "place_muelle_pacasmayo",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0021",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Malec\xF3n Grau", "Muelle de hierro", "Deportes n\xE1uticos"],
    recommendedDurationMinutes: 75
  },
  {
    id: "place_playa_el_faro_pacasmayo",
    slug: "playa-el-faro-windsurf-kitesurf",
    name: "Playa El Faro (Santuario de Windsurf)",
    category: "playas",
    subcategory: "Deportes de Viento & Olas",
    localityId: "pacasmayo",
    localityName: "Pacasmayo",
    address: "Extremo sur de la bah\xEDa de Pacasmayo",
    coordinates: { lat: -7.4125, lng: -79.5821 },
    geohash: "6w3znb0",
    shortDescription: "Considerada una de las mejores olas del mundo para windsurf y kitesurf por sus vientos constantes y series perfectas.",
    priceLevel: 1,
    rating: 4.8,
    reviewsCount: 1640,
    images: [
      {
        id: "img_faroplay_1",
        url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
        caption: "Viento y olas para windsurf en El Faro",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-05"
    },
    sources: [
      {
        placeId: "place_playa_el_faro_pacasmayo",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0022",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Windsurf", "Kitesurf", "El Faro", "Olas de clase mundial"],
    recommendedDurationMinutes: 120
  },
  {
    id: "place_hotel_el_faro_pacasmayo",
    slug: "el-faro-adventure-resort-pacasmayo",
    name: "El Faro Adventure Resort Pacasmayo",
    category: "hoteles",
    subcategory: "Resort de Playa y Windsurf",
    localityId: "pacasmayo",
    localityName: "Pacasmayo",
    address: "Playa El Faro s/n, Pacasmayo",
    coordinates: { lat: -7.4112, lng: -79.5798 },
    geohash: "6w3znb1",
    shortDescription: "Resort con vista a una de las mejores rompientes para windsurf y kitesurf de Sudam\xE9rica, piscina y restaurante.",
    phone: "+51 44 521230",
    priceLevel: 3,
    rating: 4.7,
    reviewsCount: 810,
    images: [
      {
        id: "img_faro_pacas_1",
        url: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80",
        caption: "Piscina frente a la rompiente de El Faro en Pacasmayo",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-05"
    },
    sources: [
      {
        placeId: "place_hotel_el_faro_pacasmayo",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-HOSP-PAC-002",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["El Faro", "Windsurf", "Kitesurf", "Piscina frente al mar"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_tablon_pacasmayo",
    slug: "restaurante-el-tablon-pacasmayo",
    name: "Restaurante El Tabl\xF3n Pacasmayo",
    category: "restaurantes",
    subcategory: "Parrillas y Pescados al Carb\xF3n",
    localityId: "pacasmayo",
    localityName: "Pacasmayo",
    address: "Av. 28 de Julio 145, Pacasmayo",
    coordinates: { lat: -7.4018, lng: -79.5721 },
    geohash: "6w3znb6",
    shortDescription: "Pescados fritos con yucas, pollo a la le\xF1a y mariscos al ajo en pleno centro urbano de Pacasmayo.",
    phone: "+51 44 522140",
    priceLevel: 2,
    rating: 4.4,
    reviewsCount: 1140,
    images: [
      {
        id: "img_tablon_1",
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        caption: "Pescado frito entero con salsa criolla y arroz",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-01-25"
    },
    sources: [
      {
        placeId: "place_tablon_pacasmayo",
        sourceId: "openstreetmap",
        externalId: "OSM-NODE-7819203",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Pescados al carb\xF3n", "Comida criolla", "Pacasmayo"],
    recommendedDurationMinutes: 60
  },
  // ==========================================
  // PUERTO MALABRIGO (CHICAMA)
  // ==========================================
  {
    id: "place_chicama_wave",
    slug: "playa-chicama-ola-mas-larga",
    name: "Playa y Muelle de Puerto Malabrigo",
    category: "playas",
    subcategory: "Santuario de Surf",
    localityId: "puerto-malabrigo",
    localityName: "Puerto Malabrigo (Chicama)",
    address: "Malec\xF3n Malabrigo s/n, R\xE1zuri",
    coordinates: { lat: -7.7018, lng: -79.4422 },
    geohash: "6w3w79t",
    shortDescription: "La ola izquierda m\xE1s larga y perfecta del planeta, protegida por ley nacional de rompientes.",
    priceLevel: 1,
    rating: 4.8,
    reviewsCount: 3100,
    images: [
      {
        id: "img_chicama_1",
        url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
        caption: "Rompiente de Chicama con series interminables de olas izquierdas",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-22"
    },
    sources: [
      {
        placeId: "place_chicama_wave",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0033",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Ola izquierda", "Surf mundial", "Chicama", "Caleta"],
    recommendedDurationMinutes: 120
  },
  {
    id: "place_chicama_surf_resort",
    slug: "chicama-surf-resort-spa",
    name: "Chicama Boutique Hotel & Spa",
    category: "hoteles",
    subcategory: "Surf Resort & Spa Exclusivo",
    localityId: "puerto-malabrigo",
    localityName: "Puerto Malabrigo (Chicama)",
    address: "Malec\xF3n de Puerto Malabrigo s/n",
    coordinates: { lat: -7.7025, lng: -79.439 },
    geohash: "6w3w79w",
    shortDescription: "Hotel boutique con servicio de lanchas remolcadoras (zodiacs), spa, jacuzzi frente al mar y gastronom\xEDa peruana.",
    phone: "+51 1 4478144",
    priceLevel: 4,
    rating: 4.9,
    reviewsCount: 640,
    images: [
      {
        id: "img_chicama_resort_1",
        url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
        caption: "Terraza y vista a la ola de Chicama desde el boutique hotel",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-18"
    },
    sources: [
      {
        placeId: "place_chicama_surf_resort",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-HOSP-CHI-001",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Zodiac tow-back", "Spa", "Boutique", "Chicama wave view"],
    recommendedDurationMinutes: 60
  },
  {
    id: "place_chino_malabrigo",
    slug: "cebicheria-el-chino-malabrigo",
    name: "Cevicher\xEDa El Chino de Puerto",
    category: "restaurantes",
    subcategory: "Pescado Fresco de Caleta",
    localityId: "puerto-malabrigo",
    localityName: "Puerto Malabrigo (Chicama)",
    address: "Malec\xF3n Costero 108, R\xE1zuri",
    coordinates: { lat: -7.6998, lng: -79.4365 },
    geohash: "6w3w79v",
    shortDescription: "Ceviche directo de las lanchas de pesca con chicharr\xF3n de calamar gigante y sudado de cabrilla.",
    phone: "+51 44 451120",
    priceLevel: 2,
    rating: 4.5,
    reviewsCount: 780,
    images: [
      {
        id: "img_chinom_1",
        url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
        caption: "Ceviche de cabrilla fresca de la caleta",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "partner_verified",
      verifiedAt: "2026-01-25"
    },
    sources: [
      {
        placeId: "place_chino_malabrigo",
        sourceId: "openstreetmap",
        externalId: "OSM-NODE-8910452",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Cabrilla", "Ceviche fresco", "Sudado", "Caleta"],
    recommendedDurationMinutes: 60
  },
  // ==========================================
  // CASCAS (ENOTURISMO Y VALLE FRUTAL)
  // ==========================================
  {
    id: "place_bodega_don_juan_cascas",
    slug: "bodega-don-juan-vinedos-cascas",
    name: "Bodega y Vi\xF1edos Don Juan Cascas",
    category: "gastronomia",
    subcategory: "Enoturismo & Cata de Vinos",
    localityId: "cascas",
    localityName: "Cascas",
    address: "Av. Jorge Ch\xE1vez 140, Cascas, Gran Chim\xFA",
    coordinates: { lat: -7.4815, lng: -78.8155 },
    geohash: "6w68h8x",
    shortDescription: "Bodega vitivin\xEDcola artesanal con degustaci\xF3n de vinos de uva de altura, pisco y macerados frutales.",
    phone: "+51 44 837012",
    priceLevel: 1,
    rating: 4.7,
    reviewsCount: 1120,
    images: [
      {
        id: "img_cascas_1",
        url: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=800&q=80",
        caption: "Barricas de roble y cata de vinos en Cascas",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-02-12"
    },
    sources: [
      {
        placeId: "place_bodega_don_juan_cascas",
        sourceId: "mincetur_directory",
        externalId: "MINCETUR-VIN-CAS-001",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Vino liberte\xF1o", "Uva de altura", "Enoturismo", "Gran Chim\xFA"],
    recommendedDurationMinutes: 90
  },
  {
    id: "place_cascada_chorro_cascas",
    slug: "cascada-el-chorro-cascas",
    name: "Cascada Natural El Chorro",
    category: "atractivos",
    subcategory: "Naturaleza y Paisaje",
    localityId: "cascas",
    localityName: "Cascas",
    address: "Camino rural Cascas - Gran Chim\xFA Km 3",
    coordinates: { lat: -7.4725, lng: -78.8085 },
    geohash: "6w68hb2",
    shortDescription: "Hermosa ca\xEDda de agua rodeada de vegetaci\xF3n andina, pozas naturales aptas para ba\xF1o y senderos de trekking.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 840,
    images: [
      {
        id: "img_chorro_1",
        url: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
        caption: "Ca\xEDda de agua cristalina en Cascas",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-25"
    },
    sources: [
      {
        placeId: "place_cascada_chorro_cascas",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0051",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Cascadas", "Naturaleza", "Trekking", "Gran Chim\xFA"],
    recommendedDurationMinutes: 90
  },
  // ==========================================
  // HUAMACHUCO (SIERRA MONUMENTAL)
  // ==========================================
  {
    id: "place_marcahuamachuco",
    slug: "complejo-arqueologico-marcahuamachuco",
    name: "Complejo Arqueol\xF3gico Marcahuamachuco",
    category: "arqueologia",
    subcategory: "Fortaleza Preinca Andina",
    localityId: "huamachuco",
    localityName: "Huamachuco",
    address: "Meseta de Marcahuamachuco, S\xE1nchez Carri\xF3n",
    coordinates: { lat: -7.8145, lng: -78.049 },
    geohash: "6w6m72b",
    shortDescription: "Monumento megal\xEDtico andino a 3,600 msnm con murallas de piedra de doble muro de hasta 12 metros de altura.",
    priceLevel: 1,
    rating: 4.9,
    reviewsCount: 2840,
    images: [
      {
        id: "img_marca_1",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        caption: "Murallas de piedra de Marcahuamachuco en la cordillera liberte\xF1a",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-16"
    },
    sources: [
      {
        placeId: "place_marcahuamachuco",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0004",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Fortaleza megal\xEDtica", "Andes liberte\xF1os", "Cultura Huamachuco"],
    recommendedDurationMinutes: 180
  },
  {
    id: "place_laguna_sausacocha",
    slug: "laguna-de-sausacocha-huamachuco",
    name: "Laguna de Sausacocha",
    category: "atractivos",
    subcategory: "Laguna Andina & Paseos en Bote",
    localityId: "huamachuco",
    localityName: "Huamachuco",
    address: "Carretera Huamachuco - Cajabamba Km 10",
    coordinates: { lat: -7.7952, lng: -77.9945 },
    geohash: "6w6mkw3",
    shortDescription: "Hermoso espejo de agua andino a 3,160 msnm, con botes a remo, truchas frescas a la plancha y patos silvestres.",
    priceLevel: 1,
    rating: 4.7,
    reviewsCount: 1980,
    images: [
      {
        id: "img_sausa_1",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        caption: "Aguas serenas de la Laguna Sausacocha",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-20"
    },
    sources: [
      {
        placeId: "place_laguna_sausacocha",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0008",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Trucha frita", "Paseos en bote", "Laguna", "Sierra"],
    recommendedDurationMinutes: 100
  },
  {
    id: "place_wiracochapampa",
    slug: "sitio-arqueologico-wiracochapampa",
    name: "Complejo Arqueol\xF3gico Wiracochapampa",
    category: "arqueologia",
    subcategory: "Centro Administrativo Huari",
    localityId: "huamachuco",
    localityName: "Huamachuco",
    address: "Valle de Huamachuco Km 3.5 norte",
    coordinates: { lat: -7.7981, lng: -78.0412 },
    geohash: "6w6m7s9",
    shortDescription: "Centro administrativo y ceremonial con muros rectil\xEDneos de piedra arenisca y arquitectura de filiaci\xF3n Wari.",
    priceLevel: 1,
    rating: 4.6,
    reviewsCount: 1120,
    images: [
      {
        id: "img_wira_1",
        url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        caption: "Muros de piedra arenisca en Wiracochapampa",
        isCover: true
      }
    ],
    verification: {
      isVerified: true,
      verificationLevel: "official_mincetur",
      verifiedAt: "2026-01-24"
    },
    sources: [
      {
        placeId: "place_wiracochapampa",
        sourceId: "mincetur_inventory",
        externalId: "MINCETUR-INV-LL-0041",
        lastSyncedAt: "2026-10-01"
      }
    ],
    tags: ["Wari", "Wiracochapampa", "Piedra arenisca", "Sierra"],
    recommendedDurationMinutes: 75
  }
];

// src/types/geo.ts
var LA_LIBERTAD_BOUNDS = {
  minLat: -8.95,
  maxLat: -6.95,
  minLng: -79.8,
  maxLng: -77
};
var LA_LIBERTAD_LOCALITIES = [
  {
    id: "trujillo",
    name: "Trujillo",
    department: "La Libertad",
    province: "Trujillo",
    coordinates: { lat: -8.1118, lng: -79.0287 },
    defaultZoom: 14.5,
    isPriority: true,
    description: "La Ciudad de la Eterna Primavera, centro hist\xF3rico monumental, gastronom\xEDa norte\xF1a y cuna de la Marinera.",
    highlights: ["Plaza Mayor", "Catedral de Trujillo", "El Rinc\xF3n de Vallejo", "Casonas Coloniales"],
    heroImage: "/assets/aistudio/Captura_de_pantalla_2026-11-06_114428_29ab2ca8.png"
  },
  {
    id: "huanchaco",
    name: "Huanchaco",
    department: "La Libertad",
    province: "Trujillo",
    coordinates: { lat: -8.0779, lng: -79.1197 },
    defaultZoom: 14.8,
    isPriority: true,
    description: "Hist\xF3rico balneario y Reserva Mundial de Surf con milenarios caballitos de totora y cevicher\xEDas frente al mar.",
    highlights: ["Caballitos de totora", "Muelle de Huanchaco", "Ceviche tradicional", "Surf en el Pac\xEDfico"],
    heroImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "moche",
    name: "Moche",
    department: "La Libertad",
    province: "Trujillo",
    coordinates: { lat: -8.1722, lng: -79.0097 },
    defaultZoom: 14.2,
    isPriority: true,
    description: "Coraz\xF3n de la cultura Mochica, hogar de las majestuosas Huaca del Sol y de la Luna y campi\xF1a tradicional.",
    highlights: ["Huaca de la Luna", "Huaca del Sol", "Museo Huacas de Moche", "Sopa te\xF3loga"],
    heroImage: "https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "victor-larco",
    name: "V\xEDctor Larco Herrera",
    department: "La Libertad",
    province: "Trujillo",
    coordinates: { lat: -8.1364, lng: -79.0494 },
    defaultZoom: 14.6,
    isPriority: true,
    description: "Distrito costero moderno que integra Buenos Aires, el Paseo de las Aguas y gastronom\xEDa marina de vanguardia.",
    highlights: ["Paseo de las Aguas", "Plaza de Armas de Vista Alegre", "Restaurantes de autor"],
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "la-esperanza",
    name: "La Esperanza",
    department: "La Libertad",
    province: "Trujillo",
    coordinates: { lat: -8.0827, lng: -79.0435 },
    defaultZoom: 14,
    isPriority: false,
    description: "Acceso a la Huaca Arco Iris (Huaca del Drag\xF3n) con frisos ceremoniales de adobe y proximidad al complejo Chan Chan.",
    highlights: ["Huaca Arco Iris", "Plaza C\xEDvica de La Esperanza", "Artesan\xEDa en barro"],
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "magdalena-cao",
    name: "Magdalena de Cao",
    department: "La Libertad",
    province: "Ascope",
    coordinates: { lat: -7.9547, lng: -79.2411 },
    defaultZoom: 13.8,
    isPriority: false,
    description: "Cuna del Complejo Arqueol\xF3gico El Brujo y el Museo de la Se\xF1ora de Cao, gobernante moche del siglo IV.",
    highlights: ["Complejo El Brujo", "Museo Se\xF1ora de Cao", "Plaza de Armas", "Chicha de a\xF1o"],
    heroImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pacasmayo",
    name: "Pacasmayo",
    department: "La Libertad",
    province: "Pacasmayo",
    coordinates: { lat: -7.4008, lng: -79.5714 },
    defaultZoom: 14,
    isPriority: false,
    description: "Puerto y balneario se\xF1orial con su muelle de hierro decimon\xF3nico, casonas republicanas y deportes de viento.",
    highlights: ["Muelle Hist\xF3rico", "Malec\xF3n Grau", "Surf en El Faro", "Arquitectura republicana"],
    heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "huamachuco",
    name: "Huamachuco",
    department: "La Libertad",
    province: "S\xE1nchez Carri\xF3n",
    coordinates: { lat: -7.8142, lng: -78.0494 },
    defaultZoom: 13.5,
    isPriority: false,
    description: "Imponente sierra liberte\xF1a con la fortaleza preinca de Marcahuamachuco y la hermosa laguna Sausacocha.",
    highlights: ["Marcahuamachuco", "Laguna Sausacocha", "Plaza Mayor", "Aguas termales El Ed\xE9n"],
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "cascas",
    name: "Cascas",
    department: "La Libertad",
    province: "Gran Chim\xFA",
    coordinates: { lat: -7.48, lng: -78.8167 },
    defaultZoom: 13.8,
    isPriority: false,
    description: "Capital del vino y la uva de La Libertad, rodeada de f\xE9rtiles vi\xF1edos, cascadas naturales y clima templado.",
    highlights: ["Bodegas vitivin\xEDcolas", "Cascada El Chorro", "Pinturas rupestres", "Enoturismo"],
    heroImage: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "puerto-malabrigo",
    name: "Puerto Malabrigo (Chicama)",
    department: "La Libertad",
    province: "Ascope",
    coordinates: { lat: -7.7011, lng: -79.4358 },
    defaultZoom: 14,
    isPriority: false,
    description: "Hogar de la ola izquierda perfecta m\xE1s larga del planeta, destino de culto para surfistas de todo el mundo.",
    highlights: ["La ola izquierda m\xE1s larga", "Muelle de Malabrigo", "Caleta de pescadores", "Gastronom\xEDa marina"],
    heroImage: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80"
  }
];

// src/utils/geoBoundary.ts
function isWithinLaLibertad(coords) {
  if (typeof coords.lat !== "number" || typeof coords.lng !== "number") {
    return false;
  }
  if (isNaN(coords.lat) || isNaN(coords.lng)) {
    return false;
  }
  const { minLat, maxLat, minLng, maxLng } = LA_LIBERTAD_BOUNDS;
  return coords.lat >= minLat && coords.lat <= maxLat && coords.lng >= minLng && coords.lng <= maxLng;
}
function validateLocalityId(localityId) {
  if (!localityId || typeof localityId !== "string") return false;
  const normalized = localityId.trim().toLowerCase();
  return LA_LIBERTAD_LOCALITIES.some((loc) => loc.id === normalized);
}
function getLocality(localityId) {
  if (!localityId) return void 0;
  const normalized = localityId.trim().toLowerCase();
  return LA_LIBERTAD_LOCALITIES.find((loc) => loc.id === normalized);
}

// src/utils/dateUtils.ts
function parseDateParts(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [year, month, day] = parts;
  return [year, month, day];
}
function calculateTripDuration(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) {
    return { days: 0, nights: 0, isValid: false, error: "Ambas fechas son obligatorias" };
  }
  const startParts = parseDateParts(startDateStr);
  const endParts = parseDateParts(endDateStr);
  if (!startParts || !endParts) {
    return { days: 0, nights: 0, isValid: false, error: "Formato de fecha inv\xE1lido" };
  }
  const startUtc = Date.UTC(startParts[0], startParts[1] - 1, startParts[2]);
  const endUtc = Date.UTC(endParts[0], endParts[1] - 1, endParts[2]);
  const diffTime = endUtc - startUtc;
  const diffDays = Math.round(diffTime / (1e3 * 60 * 60 * 24));
  if (diffDays < 0) {
    return {
      days: 0,
      nights: 0,
      isValid: false,
      error: "La fecha de salida no puede ser anterior a la de llegada"
    };
  }
  const nights = diffDays;
  const days = diffDays + 1;
  if (days > 45) {
    return {
      days,
      nights,
      isValid: false,
      error: "El viaje no puede exceder 45 d\xEDas en esta versi\xF3n"
    };
  }
  return {
    days,
    nights,
    isValid: true
  };
}

// src/server/repository.ts
var CatalogRepository = class {
  constructor() {
    this.places = /* @__PURE__ */ new Map();
    this.itineraries = /* @__PURE__ */ new Map();
    for (const place of INITIAL_PLACES) {
      if (isWithinLaLibertad(place.coordinates)) {
        this.places.set(place.id, place);
      }
    }
  }
  // --- DESTINATIONS ---
  getDestinations() {
    return LA_LIBERTAD_LOCALITIES;
  }
  getDestinationById(id) {
    return getLocality(id);
  }
  // --- PLACES & CATALOG ---
  getPlaces(filters) {
    let result = Array.from(this.places.values());
    if (filters?.localityId) {
      const locId = filters.localityId.toLowerCase().trim();
      result = result.filter((p) => p.localityId.toLowerCase() === locId);
    }
    if (filters?.category && filters.category !== "todas") {
      const cat = filters.category.toLowerCase().trim();
      result = result.filter(
        (p) => p.category.toLowerCase() === cat || p.subcategory && p.subcategory.toLowerCase().includes(cat)
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    const seen = /* @__PURE__ */ new Set();
    const deduped = [];
    for (const p of result) {
      if (!seen.has(p.id) && !seen.has(p.slug)) {
        seen.add(p.id);
        seen.add(p.slug);
        deduped.push(p);
      }
    }
    return deduped.filter((p) => isWithinLaLibertad(p.coordinates));
  }
  getPlaceById(id) {
    const place = this.places.get(id);
    if (!place || !isWithinLaLibertad(place.coordinates)) return void 0;
    return place;
  }
  searchPlaces(query, localityId) {
    const q = (query || "").toLowerCase().trim();
    let result = Array.from(this.places.values());
    if (localityId) {
      result = result.filter((p) => p.localityId.toLowerCase() === localityId.toLowerCase().trim());
    }
    if (q) {
      result = result.filter((p) => {
        return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.address.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
      });
    }
    const seen = /* @__PURE__ */ new Set();
    const deduped = [];
    for (const p of result) {
      if (!seen.has(p.id) && !seen.has(p.slug)) {
        seen.add(p.id);
        seen.add(p.slug);
        deduped.push(p);
      }
    }
    return deduped.filter((p) => isWithinLaLibertad(p.coordinates));
  }
  // --- ITINERARIES ---
  createItinerary(params) {
    if (!validateLocalityId(params.destinationId)) {
      return { error: "El destino debe pertenecer a la regi\xF3n La Libertad, Per\xFA" };
    }
    const locality = getLocality(params.destinationId);
    if (!locality) {
      return { error: "Destino no encontrado en el cat\xE1logo de La Libertad" };
    }
    const duration = calculateTripDuration(params.startDate, params.endDate);
    if (!duration.isValid) {
      return { error: duration.error || "Fechas de viaje inv\xE1lidas" };
    }
    const id = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const title = params.title?.trim() || `Viaje a ${locality.name}`;
    const newItinerary = {
      id,
      title,
      destinationId: locality.id,
      destinationName: locality.name,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays: duration.days,
      totalNights: duration.nights,
      coverImage: locality.heroImage,
      notes: "",
      savedPlaceIds: [],
      activities: [],
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.itineraries.set(id, newItinerary);
    return { itinerary: newItinerary };
  }
  getItineraryById(id) {
    return this.itineraries.get(id);
  }
  addActivity(itineraryId, activityInput) {
    const itinerary = this.itineraries.get(itineraryId);
    if (!itinerary) return { error: "Itinerario no encontrado" };
    const place = this.places.get(activityInput.placeId);
    if (!place) return { error: "Lugar no encontrado en el cat\xE1logo" };
    if (activityInput.dayNumber < 1 || activityInput.dayNumber > itinerary.totalDays) {
      return { error: `El d\xEDa debe estar entre 1 y ${itinerary.totalDays}` };
    }
    const dayActivities = itinerary.activities.filter((a) => a.dayNumber === activityInput.dayNumber);
    const order = dayActivities.length + 1;
    const activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tripId: itineraryId,
      placeId: place.id,
      place,
      dayNumber: activityInput.dayNumber,
      order,
      timeSlot: activityInput.timeSlot,
      notes: activityInput.notes,
      isVisited: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    itinerary.activities.push(activity);
    itinerary.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    return { activity };
  }
  removeActivity(itineraryId, activityId) {
    const itinerary = this.itineraries.get(itineraryId);
    if (!itinerary) return false;
    const index = itinerary.activities.findIndex((a) => a.id === activityId);
    if (index === -1) return false;
    itinerary.activities.splice(index, 1);
    itinerary.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    return true;
  }
};
var catalogRepository = new CatalogRepository();

// src/server/schemas.ts
import { z } from "zod";
var CreateTripSchema = z.object({
  destinationId: z.string().refine(
    (id) => validateLocalityId(id),
    { message: "El destino debe ser una localidad v\xE1lida dentro de la regi\xF3n La Libertad, Per\xFA" }
  ),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de llegada debe tener formato AAAA-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de salida debe tener formato AAAA-MM-DD"),
  title: z.string().optional()
}).refine((data) => {
  const duration = calculateTripDuration(data.startDate, data.endDate);
  return duration.isValid;
}, {
  message: "La fecha de salida no puede ser anterior a la de llegada",
  path: ["endDate"]
});

// src/server/routes.ts
var apiRouter = Router();
apiRouter.get("/destinations", (_req, res) => {
  const destinations = catalogRepository.getDestinations();
  res.json({
    success: true,
    data: destinations,
    region: "La Libertad, Per\xFA",
    total: destinations.length
  });
});
apiRouter.get("/destinations/:id", (req, res) => {
  const dest = catalogRepository.getDestinationById(req.params.id);
  if (!dest) {
    res.status(404).json({ success: false, error: "Destino no encontrado en La Libertad" });
    return;
  }
  res.json({ success: true, data: dest });
});
apiRouter.get("/places", (req, res) => {
  const { localityId, category, q, page, limit } = req.query;
  const places = catalogRepository.getPlaces({
    localityId: typeof localityId === "string" ? localityId : void 0,
    category: typeof category === "string" ? category : void 0,
    search: typeof q === "string" ? q : void 0
  });
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 50));
  const total = places.length;
  const startIndex = (pageNum - 1) * pageSize;
  const paginated = limit ? places.slice(startIndex, startIndex + pageSize) : places;
  res.json({
    success: true,
    data: paginated,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / pageSize),
    regionConstraint: "La Libertad",
    sources: ["MINCETUR", "OpenStreetMap", "Directorio_Oficial_La_Libertad"]
  });
});
apiRouter.get("/places/search", (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const localityId = typeof req.query.localityId === "string" ? req.query.localityId : void 0;
  const places = catalogRepository.searchPlaces(q, localityId);
  res.json({
    success: true,
    data: places,
    total: places.length
  });
});
apiRouter.get("/places/:id", (req, res) => {
  const place = catalogRepository.getPlaceById(req.params.id);
  if (!place) {
    res.status(404).json({ success: false, error: "Lugar no encontrado en el cat\xE1logo de La Libertad" });
    return;
  }
  res.json({ success: true, data: place });
});
apiRouter.post("/itineraries", (req, res) => {
  const parseResult = CreateTripSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join(", ");
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const { destinationId, startDate, endDate, title } = parseResult.data;
  const result = catalogRepository.createItinerary({
    destinationId,
    startDate,
    endDate,
    title
  });
  if (result.error || !result.itinerary) {
    res.status(400).json({ success: false, error: result.error || "Error al crear itinerario" });
    return;
  }
  res.status(201).json({ success: true, data: result.itinerary });
});
apiRouter.get("/itineraries/:id", (req, res) => {
  const itinerary = catalogRepository.getItineraryById(req.params.id);
  if (!itinerary) {
    res.status(404).json({ success: false, error: "Itinerario no encontrado" });
    return;
  }
  res.json({ success: true, data: itinerary });
});
apiRouter.post("/itineraries/:id/activities", (req, res) => {
  const { placeId, dayNumber, timeSlot, notes } = req.body;
  if (!placeId || typeof dayNumber !== "number") {
    res.status(400).json({ success: false, error: "placeId y dayNumber son obligatorios" });
    return;
  }
  const result = catalogRepository.addActivity(req.params.id, {
    placeId,
    dayNumber,
    timeSlot,
    notes
  });
  if (result.error || !result.activity) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }
  res.status(201).json({ success: true, data: result.activity });
});
apiRouter.delete("/itineraries/:id/activities/:activityId", (req, res) => {
  const success = catalogRepository.removeActivity(req.params.id, req.params.activityId);
  if (!success) {
    res.status(404).json({ success: false, error: "Actividad o itinerario no encontrado" });
    return;
  }
  res.json({ success: true, message: "Actividad eliminada" });
});

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  const HOST = "0.0.0.0";
  const distPath = path.resolve(__dirname, "dist");
  const isProduction = process.env.NODE_ENV === "production" && fs.existsSync(path.join(distPath, "index.html"));
  app.use(express.json());
  app.use("/api", apiRouter);
  app.use(express.static(path.resolve(__dirname, "public")));
  if (isProduction) {
    const distPath2 = path.resolve(__dirname, "dist");
    app.use(express.static(distPath2));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath2, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, HOST, () => {
    console.log(
      `[LibertadGO] Server running on ${HOST}:${PORT}`
    );
    console.log(
      `[LibertadGO] Environment: ${isProduction ? "production" : "development"}`
    );
  });
}
startServer().catch((err) => {
  console.error("[LibertadGO] Failed to start server:", err);
  process.exit(1);
});
