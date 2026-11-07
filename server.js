var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/data/initialPlaces.ts
var INITIAL_PLACES;
var init_initialPlaces = __esm({
  "src/data/initialPlaces.ts"() {
    INITIAL_PLACES = [
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
            url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
            caption: "Cabrito a la norte\xF1a tradicional con frijoles y zarza criolla",
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
            url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80",
            caption: "Cava de vinos y comedor en casona colonial de El Celler de Cler",
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
            url: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=800&q=80",
            caption: "Plaza Mayor de Trujillo con el Monumento a la Libertad y arquitectura colonial",
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
            url: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
            caption: "Campanarios y fachada virreinal de la Catedral de Trujillo",
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
            url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
            caption: "Muros ceremoniales y frisos de adobe en la ciudadela de Chan Chan",
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
            url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
            caption: "Pir\xE1mide y relieves ceremoniales de la Huaca de la Luna (Cultura Moche)",
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
  }
});

// src/server/repositories/memoryCreatorsRepository.ts
var MemoryCreatorsRepository;
var init_memoryCreatorsRepository = __esm({
  "src/server/repositories/memoryCreatorsRepository.ts"() {
    init_initialPlaces();
    MemoryCreatorsRepository = class {
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.creatorProfiles = /* @__PURE__ */ new Map();
        // key: userId
        this.videoSubmissions = /* @__PURE__ */ new Map();
        this.videoPlaces = /* @__PURE__ */ new Map();
        this.moderationLogs = [];
        this.savedVideos = /* @__PURE__ */ new Map();
      }
      // key: `${userId}_${videoId}`
      // --- IAuthRepository ---
      async findUserByEmail(email) {
        const normalized = email.toLowerCase().trim();
        for (const user of this.users.values()) {
          if (user.email.toLowerCase() === normalized) {
            return { ...user };
          }
        }
        return null;
      }
      async findUserById(id) {
        const user = this.users.get(id);
        return user ? { ...user } : null;
      }
      async createUser(data) {
        const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const newUser = {
          id,
          email: data.email.toLowerCase().trim(),
          passwordHash: data.passwordHash,
          name: data.name,
          avatarUrl: data.avatarUrl || null,
          role: data.role || "USER",
          createdAt: now,
          updatedAt: now
        };
        this.users.set(id, newUser);
        return { ...newUser };
      }
      async countUsers() {
        return this.users.size;
      }
      // --- ICreatorsRepository ---
      async findSubmissionById(id) {
        const sub = this.videoSubmissions.get(id);
        return sub ? { ...sub } : null;
      }
      async findSubmissionByPlatformAndExternalId(platform, externalVideoId) {
        for (const sub of this.videoSubmissions.values()) {
          if (sub.platform === platform && sub.externalVideoId === externalVideoId) {
            return { ...sub };
          }
        }
        return null;
      }
      async createSubmission(data, placeIds = [], primaryPlaceId) {
        const id = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const submission = {
          ...data,
          id,
          creatorProfileId: data.creatorProfileId || null,
          thumbnailUrl: data.thumbnailUrl || null,
          description: data.description || null,
          localityId: data.localityId || null,
          status: "PENDING",
          moderationNotes: null,
          moderatedBy: null,
          moderatedAt: null,
          internalViewsCount: 0,
          internalSavesCount: 0,
          externalMetrics: null,
          createdAt: now,
          updatedAt: now
        };
        this.videoSubmissions.set(id, submission);
        if (placeIds && placeIds.length > 0) {
          await this.associatePlaces(id, placeIds, primaryPlaceId);
        }
        return { ...submission };
      }
      async updateSubmissionStatus(id, status, notes, adminUserId) {
        const sub = this.videoSubmissions.get(id);
        if (!sub) return null;
        const updated = {
          ...sub,
          status,
          moderationNotes: notes || null,
          moderatedBy: adminUserId || null,
          moderatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.videoSubmissions.set(id, updated);
        return { ...updated };
      }
      async listApprovedVideos(filters = {}) {
        let list = Array.from(this.videoSubmissions.values()).filter(
          (v) => v.status === "APPROVED"
        );
        if (filters.localityId && filters.localityId !== "todas") {
          const loc = filters.localityId.toLowerCase();
          list = list.filter((v) => v.localityId?.toLowerCase() === loc);
        }
        if (filters.category && filters.category !== "todas") {
          const cat = filters.category.toLowerCase();
          list = list.filter((v) => v.category.toLowerCase() === cat);
        }
        if (filters.contentType) {
          list = list.filter((v) => v.contentType === filters.contentType);
        }
        if (filters.platform) {
          list = list.filter((v) => v.platform === filters.platform);
        }
        if (filters.q) {
          const q = filters.q.toLowerCase().trim();
          list = list.filter(
            (v) => v.title.toLowerCase().includes(q) || v.description && v.description.toLowerCase().includes(q)
          );
        }
        if (filters.placeId) {
          const placeId = filters.placeId;
          const matchingVideoIds = new Set(
            Array.from(this.videoPlaces.values()).filter((vp) => vp.placeId === placeId).map((vp) => vp.videoId)
          );
          list = list.filter((v) => matchingVideoIds.has(v.id));
        }
        list.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const total = list.length;
        const page = Math.max(1, filters.page || 1);
        const limit = Math.min(50, Math.max(1, filters.limit || 20));
        const start = (page - 1) * limit;
        const paginated = list.slice(start, start + limit);
        const videosWithPlaces = await Promise.all(
          paginated.map(async (v) => {
            const places = await this.getPlacesForVideo(v.id);
            return { ...v, places };
          })
        );
        return { videos: videosWithPlaces, total };
      }
      async listSubmissionsByUser(userId) {
        const list = Array.from(this.videoSubmissions.values()).filter((v) => v.userId === userId).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        return list.map((v) => ({ ...v }));
      }
      async listModerationQueue(status = "PENDING") {
        const list = Array.from(this.videoSubmissions.values()).filter((v) => v.status === status).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return list.map((v) => ({ ...v }));
      }
      async addModerationLog(log) {
        const id = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newLog = {
          ...log,
          id,
          reason: log.reason || null,
          internalNotes: log.internalNotes || null,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.moderationLogs.unshift(newLog);
        return { ...newLog };
      }
      async getModerationLogs(videoId) {
        return this.moderationLogs.filter((l) => l.videoId === videoId).map((l) => ({ ...l }));
      }
      async associatePlaces(videoId, placeIds, primaryPlaceId) {
        for (const [k, vp] of this.videoPlaces.entries()) {
          if (vp.videoId === videoId) {
            this.videoPlaces.delete(k);
          }
        }
        placeIds.forEach((pId, idx) => {
          const isPrimary = primaryPlaceId ? primaryPlaceId === pId : idx === 0;
          const id = `vp_${videoId}_${pId}`;
          this.videoPlaces.set(id, {
            id,
            videoId,
            placeId: pId,
            isPrimary,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        });
      }
      async getPlacesForVideo(videoId) {
        const pIds = Array.from(this.videoPlaces.values()).filter((vp) => vp.videoId === videoId).sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((vp) => vp.placeId);
        return INITIAL_PLACES.filter((p) => pIds.includes(p.id));
      }
      async getVideosForPlace(placeId) {
        const videoIds = new Set(
          Array.from(this.videoPlaces.values()).filter((vp) => vp.placeId === placeId).map((vp) => vp.videoId)
        );
        return Array.from(this.videoSubmissions.values()).filter((v) => videoIds.has(v.id) && v.status === "APPROVED").sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      async findCreatorProfileByUserId(userId) {
        const prof = this.creatorProfiles.get(userId);
        return prof ? { ...prof } : null;
      }
      async findCreatorProfileByHandle(handle) {
        const lower = handle.toLowerCase();
        for (const prof of this.creatorProfiles.values()) {
          if (prof.handle.toLowerCase() === lower) {
            return { ...prof };
          }
        }
        return null;
      }
      async saveCreatorProfile(data) {
        const existing = this.creatorProfiles.get(data.userId);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const profile = {
          id: existing ? existing.id : `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: data.userId,
          handle: data.handle.toLowerCase().trim(),
          displayName: data.displayName,
          bio: data.bio || null,
          avatarUrl: data.avatarUrl || null,
          primaryPlatform: data.primaryPlatform,
          tiktokUrl: data.tiktokUrl || null,
          instagramUrl: data.instagramUrl || null,
          youtubeUrl: data.youtubeUrl || null,
          isPublic: data.isPublic,
          isVerified: existing ? existing.isVerified : false,
          totalApprovedVideos: existing ? existing.totalApprovedVideos : 0,
          createdAt: existing ? existing.createdAt : now,
          updatedAt: now
        };
        this.creatorProfiles.set(data.userId, profile);
        return { ...profile };
      }
      async listPublicCreators() {
        return Array.from(this.creatorProfiles.values()).filter((c) => c.isPublic).sort((a, b) => b.totalApprovedVideos - a.totalApprovedVideos);
      }
      async incrementInternalViews(videoId) {
        const sub = this.videoSubmissions.get(videoId);
        if (sub) {
          sub.internalViewsCount += 1;
        }
      }
      async toggleSaveVideo(userId, videoId) {
        const key = `${userId}_${videoId}`;
        const sub = this.videoSubmissions.get(videoId);
        if (this.savedVideos.has(key)) {
          this.savedVideos.delete(key);
          if (sub) sub.internalSavesCount = Math.max(0, sub.internalSavesCount - 1);
          return { saved: false };
        } else {
          this.savedVideos.set(key, {
            id: `sv_${Date.now()}`,
            userId,
            videoId,
            savedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          if (sub) sub.internalSavesCount += 1;
          return { saved: true };
        }
      }
      async isSavedByUser(userId, videoId) {
        return this.savedVideos.has(`${userId}_${videoId}`);
      }
      async getAdminMetrics() {
        const subs = Array.from(this.videoSubmissions.values());
        return {
          totalSubmissions: subs.length,
          pendingCount: subs.filter((s) => s.status === "PENDING").length,
          approvedCount: subs.filter((s) => s.status === "APPROVED").length,
          observedCount: subs.filter((s) => s.status === "OBSERVED").length,
          rejectedCount: subs.filter((s) => s.status === "REJECTED").length,
          totalCreators: this.creatorProfiles.size
        };
      }
      async testConnection() {
        return Promise.resolve();
      }
      async close() {
        this.users.clear();
        this.videoSubmissions.clear();
        this.videoPlaces.clear();
        this.savedVideos.clear();
        this.moderationLogs = [];
        return Promise.resolve();
      }
    };
  }
});

// src/server/repositories/postgresCreatorsRepository.ts
import { Pool } from "pg";
var PostgresCreatorsRepository;
var init_postgresCreatorsRepository = __esm({
  "src/server/repositories/postgresCreatorsRepository.ts"() {
    init_initialPlaces();
    PostgresCreatorsRepository = class {
      constructor(connectionString) {
        this.pool = new Pool({
          connectionString,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : void 0
        });
        this.pool.on("error", (err) => {
          console.error("[Neon Pool Idle Error]", err?.message || err);
        });
      }
      /**
       * Verify database connectivity with a lightweight ping query
       */
      async testConnection() {
        const res = await this.pool.query("SELECT 1 as ping");
        if (!res || !res.rows || res.rows.length === 0) {
          throw new Error("Database ping query returned no results.");
        }
      }
      /**
       * Close all active and idle connections in the pool
       */
      async close() {
        await this.pool.end();
      }
      // --- IAuthRepository ---
      async findUserByEmail(email) {
        const res = await this.pool.query(
          `SELECT id, email, password_hash as "passwordHash", name, avatar_url as "avatarUrl", role, created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
          [email]
        );
        return res.rows[0] || null;
      }
      async findUserById(id) {
        const res = await this.pool.query(
          `SELECT id, email, password_hash as "passwordHash", name, avatar_url as "avatarUrl", role, created_at as "createdAt", updated_at as "updatedAt"
       FROM users WHERE id = $1 LIMIT 1`,
          [id]
        );
        return res.rows[0] || null;
      }
      async createUser(data) {
        const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const role = data.role || "USER";
        const res = await this.pool.query(
          `INSERT INTO users (id, email, password_hash, name, avatar_url, role)
       VALUES ($1, LOWER($2), $3, $4, $5, $6)
       RETURNING id, email, password_hash as "passwordHash", name, avatar_url as "avatarUrl", role, created_at as "createdAt", updated_at as "updatedAt"`,
          [id, data.email, data.passwordHash, data.name, data.avatarUrl || null, role]
        );
        return res.rows[0];
      }
      async countUsers() {
        const res = await this.pool.query(`SELECT COUNT(*)::int as count FROM users`);
        return res.rows[0]?.count || 0;
      }
      // --- ICreatorsRepository ---
      async findSubmissionById(id) {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", creator_profile_id as "creatorProfileId", platform, external_video_id as "externalVideoId",
              video_url as "videoUrl", embed_url as "embedUrl", thumbnail_url as "thumbnailUrl", title, description,
              content_type as "contentType", category, locality_id as "localityId", status, moderation_notes as "moderationNotes",
              moderated_by as "moderatedBy", moderated_at as "moderatedAt", internal_views_count as "internalViewsCount",
              internal_saves_count as "internalSavesCount", external_metrics as "externalMetrics",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM video_submissions WHERE id = $1 LIMIT 1`,
          [id]
        );
        return res.rows[0] || null;
      }
      async findSubmissionByPlatformAndExternalId(platform, externalVideoId) {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", creator_profile_id as "creatorProfileId", platform, external_video_id as "externalVideoId",
              video_url as "videoUrl", embed_url as "embedUrl", thumbnail_url as "thumbnailUrl", title, description,
              content_type as "contentType", category, locality_id as "localityId", status, moderation_notes as "moderationNotes",
              moderated_by as "moderatedBy", moderated_at as "moderatedAt", internal_views_count as "internalViewsCount",
              internal_saves_count as "internalSavesCount", external_metrics as "externalMetrics",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM video_submissions WHERE platform = $1 AND external_video_id = $2 LIMIT 1`,
          [platform, externalVideoId]
        );
        return res.rows[0] || null;
      }
      async createSubmission(data, placeIds = [], primaryPlaceId) {
        const id = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const client = await this.pool.connect();
        try {
          await client.query("BEGIN");
          const res = await client.query(
            `INSERT INTO video_submissions (
          id, user_id, creator_profile_id, platform, external_video_id,
          video_url, embed_url, thumbnail_url, title, description,
          content_type, category, locality_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING')
        RETURNING id, user_id as "userId", creator_profile_id as "creatorProfileId", platform, external_video_id as "externalVideoId",
                  video_url as "videoUrl", embed_url as "embedUrl", thumbnail_url as "thumbnailUrl", title, description,
                  content_type as "contentType", category, locality_id as "localityId", status, moderation_notes as "moderationNotes",
                  moderated_by as "moderatedBy", moderated_at as "moderatedAt", internal_views_count as "internalViewsCount",
                  internal_saves_count as "internalSavesCount", external_metrics as "externalMetrics",
                  created_at as "createdAt", updated_at as "updatedAt"`,
            [
              id,
              data.userId,
              data.creatorProfileId || null,
              data.platform,
              data.externalVideoId,
              data.videoUrl,
              data.embedUrl,
              data.thumbnailUrl || null,
              data.title,
              data.description || null,
              data.contentType,
              data.category,
              data.localityId || null
            ]
          );
          const submission = res.rows[0];
          for (const pId of placeIds) {
            const isPrimary = primaryPlaceId ? primaryPlaceId === pId : placeIds[0] === pId;
            const vpId = `vp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await client.query(
              `INSERT INTO video_places (id, video_id, place_id, is_primary)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (video_id, place_id) DO NOTHING`,
              [vpId, id, pId, isPrimary]
            );
          }
          await client.query("COMMIT");
          return submission;
        } catch (err) {
          await client.query("ROLLBACK");
          throw err;
        } finally {
          client.release();
        }
      }
      async updateSubmissionStatus(id, status, notes, adminUserId) {
        const res = await this.pool.query(
          `UPDATE video_submissions
       SET status = $1,
           moderation_notes = $2,
           moderated_by = $3,
           moderated_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, user_id as "userId", creator_profile_id as "creatorProfileId", platform, external_video_id as "externalVideoId",
                 video_url as "videoUrl", embed_url as "embedUrl", thumbnail_url as "thumbnailUrl", title, description,
                 content_type as "contentType", category, locality_id as "localityId", status, moderation_notes as "moderationNotes",
                 moderated_by as "moderatedBy", moderated_at as "moderatedAt", internal_views_count as "internalViewsCount",
                 internal_saves_count as "internalSavesCount", external_metrics as "externalMetrics",
                 created_at as "createdAt", updated_at as "updatedAt"`,
          [status, notes || null, adminUserId || null, id]
        );
        return res.rows[0] || null;
      }
      async listApprovedVideos(filters = {}) {
        const page = Math.max(1, filters.page || 1);
        const limit = Math.min(50, Math.max(1, filters.limit || 20));
        const offset = (page - 1) * limit;
        const conditions = [`vs.status = 'APPROVED'`];
        const params = [];
        if (filters.localityId && filters.localityId !== "todas") {
          params.push(filters.localityId);
          conditions.push(`vs.locality_id = $${params.length}`);
        }
        if (filters.category && filters.category !== "todas") {
          params.push(filters.category);
          conditions.push(`vs.category = $${params.length}`);
        }
        if (filters.contentType) {
          params.push(filters.contentType);
          conditions.push(`vs.content_type = $${params.length}`);
        }
        if (filters.platform) {
          params.push(filters.platform);
          conditions.push(`vs.platform = $${params.length}`);
        }
        if (filters.q) {
          params.push(`%${filters.q.toLowerCase()}%`);
          conditions.push(`(LOWER(vs.title) LIKE $${params.length} OR LOWER(vs.description) LIKE $${params.length})`);
        }
        if (filters.placeId) {
          params.push(filters.placeId);
          conditions.push(`EXISTS (SELECT 1 FROM video_places vp WHERE vp.video_id = vs.id AND vp.place_id = $${params.length})`);
        }
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
        const countRes = await this.pool.query(
          `SELECT COUNT(*)::int as total FROM video_submissions vs ${whereClause}`,
          params
        );
        const total = countRes.rows[0]?.total || 0;
        const queryParams = [...params, limit, offset];
        const limitIndex = params.length + 1;
        const offsetIndex = params.length + 2;
        const res = await this.pool.query(
          `SELECT vs.id, vs.user_id as "userId", vs.creator_profile_id as "creatorProfileId", vs.platform,
              vs.external_video_id as "externalVideoId", vs.video_url as "videoUrl", vs.embed_url as "embedUrl",
              vs.thumbnail_url as "thumbnailUrl", vs.title, vs.description, vs.content_type as "contentType",
              vs.category, vs.locality_id as "localityId", vs.status, vs.moderation_notes as "moderationNotes",
              vs.moderated_by as "moderatedBy", vs.moderated_at as "moderatedAt", vs.internal_views_count as "internalViewsCount",
              vs.internal_saves_count as "internalSavesCount", vs.external_metrics as "externalMetrics",
              vs.created_at as "createdAt", vs.updated_at as "updatedAt"
       FROM video_submissions vs
       ${whereClause}
       ORDER BY vs.created_at DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
          queryParams
        );
        const videosWithPlaces = await Promise.all(
          res.rows.map(async (v) => {
            const places = await this.getPlacesForVideo(v.id);
            return { ...v, places };
          })
        );
        return { videos: videosWithPlaces, total };
      }
      async listSubmissionsByUser(userId) {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", creator_profile_id as "creatorProfileId", platform, external_video_id as "externalVideoId",
              video_url as "videoUrl", embed_url as "embedUrl", thumbnail_url as "thumbnailUrl", title, description,
              content_type as "contentType", category, locality_id as "localityId", status, moderation_notes as "moderationNotes",
              moderated_by as "moderatedBy", moderated_at as "moderatedAt", internal_views_count as "internalViewsCount",
              internal_saves_count as "internalSavesCount", external_metrics as "externalMetrics",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM video_submissions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
          [userId]
        );
        return res.rows;
      }
      async listModerationQueue(status = "PENDING") {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", creator_profile_id as "creatorProfileId", platform, external_video_id as "externalVideoId",
              video_url as "videoUrl", embed_url as "embedUrl", thumbnail_url as "thumbnailUrl", title, description,
              content_type as "contentType", category, locality_id as "localityId", status, moderation_notes as "moderationNotes",
              moderated_by as "moderatedBy", moderated_at as "moderatedAt", internal_views_count as "internalViewsCount",
              internal_saves_count as "internalSavesCount", external_metrics as "externalMetrics",
              created_at as "createdAt", updated_at as "updatedAt"
       FROM video_submissions
       WHERE status = $1
       ORDER BY created_at ASC`,
          [status]
        );
        return res.rows;
      }
      async addModerationLog(log) {
        const id = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const res = await this.pool.query(
          `INSERT INTO video_moderation_logs (id, video_id, admin_user_id, admin_name, previous_status, new_status, reason, internal_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, video_id as "videoId", admin_user_id as "adminUserId", admin_name as "adminName",
                 previous_status as "previousStatus", new_status as "newStatus", reason, internal_notes as "internalNotes",
                 created_at as "createdAt"`,
          [id, log.videoId, log.adminUserId, log.adminName, log.previousStatus, log.newStatus, log.reason || null, log.internalNotes || null]
        );
        return res.rows[0];
      }
      async getModerationLogs(videoId) {
        const res = await this.pool.query(
          `SELECT id, video_id as "videoId", admin_user_id as "adminUserId", admin_name as "adminName",
              previous_status as "previousStatus", new_status as "newStatus", reason, internal_notes as "internalNotes",
              created_at as "createdAt"
       FROM video_moderation_logs
       WHERE video_id = $1
       ORDER BY created_at DESC`,
          [videoId]
        );
        return res.rows;
      }
      async associatePlaces(videoId, placeIds, primaryPlaceId) {
        const client = await this.pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(`DELETE FROM video_places WHERE video_id = $1`, [videoId]);
          for (const pId of placeIds) {
            const isPrimary = primaryPlaceId ? primaryPlaceId === pId : placeIds[0] === pId;
            const vpId = `vp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await client.query(
              `INSERT INTO video_places (id, video_id, place_id, is_primary)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (video_id, place_id) DO NOTHING`,
              [vpId, videoId, pId, isPrimary]
            );
          }
          await client.query("COMMIT");
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      }
      async getPlacesForVideo(videoId) {
        const res = await this.pool.query(
          `SELECT place_id as "placeId" FROM video_places WHERE video_id = $1 ORDER BY is_primary DESC`,
          [videoId]
        );
        const placeIds = res.rows.map((r) => r.placeId);
        return INITIAL_PLACES.filter((p) => placeIds.includes(p.id));
      }
      async getVideosForPlace(placeId) {
        const res = await this.pool.query(
          `SELECT vs.id, vs.user_id as "userId", vs.creator_profile_id as "creatorProfileId", vs.platform,
              vs.external_video_id as "externalVideoId", vs.video_url as "videoUrl", vs.embed_url as "embedUrl",
              vs.thumbnail_url as "thumbnailUrl", vs.title, vs.description, vs.content_type as "contentType",
              vs.category, vs.locality_id as "localityId", vs.status, vs.moderation_notes as "moderationNotes",
              vs.moderated_by as "moderatedBy", vs.moderated_at as "moderatedAt", vs.internal_views_count as "internalViewsCount",
              vs.internal_saves_count as "internalSavesCount", vs.external_metrics as "externalMetrics",
              vs.created_at as "createdAt", vs.updated_at as "updatedAt"
       FROM video_submissions vs
       INNER JOIN video_places vp ON vp.video_id = vs.id
       WHERE vp.place_id = $1 AND vs.status = 'APPROVED'
       ORDER BY vs.created_at DESC`,
          [placeId]
        );
        return res.rows;
      }
      async findCreatorProfileByUserId(userId) {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", handle, display_name as "displayName", bio, avatar_url as "avatarUrl",
              primary_platform as "primaryPlatform", tiktok_url as "tiktokUrl", instagram_url as "instagramUrl",
              youtube_url as "youtubeUrl", is_public as "isPublic", is_verified as "isVerified",
              total_approved_videos as "totalApprovedVideos", created_at as "createdAt", updated_at as "updatedAt"
       FROM creator_profiles WHERE user_id = $1 LIMIT 1`,
          [userId]
        );
        return res.rows[0] || null;
      }
      async findCreatorProfileByHandle(handle) {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", handle, display_name as "displayName", bio, avatar_url as "avatarUrl",
              primary_platform as "primaryPlatform", tiktok_url as "tiktokUrl", instagram_url as "instagramUrl",
              youtube_url as "youtubeUrl", is_public as "isPublic", is_verified as "isVerified",
              total_approved_videos as "totalApprovedVideos", created_at as "createdAt", updated_at as "updatedAt"
       FROM creator_profiles WHERE LOWER(handle) = LOWER($1) LIMIT 1`,
          [handle]
        );
        return res.rows[0] || null;
      }
      async saveCreatorProfile(data) {
        const id = `cp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const res = await this.pool.query(
          `INSERT INTO creator_profiles (
        id, user_id, handle, display_name, bio, avatar_url, primary_platform,
        tiktok_url, instagram_url, youtube_url, is_public
      ) VALUES ($1, $2, LOWER($3), $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (user_id) DO UPDATE SET
        handle = EXCLUDED.handle,
        display_name = EXCLUDED.display_name,
        bio = EXCLUDED.bio,
        avatar_url = EXCLUDED.avatar_url,
        primary_platform = EXCLUDED.primary_platform,
        tiktok_url = EXCLUDED.tiktok_url,
        instagram_url = EXCLUDED.instagram_url,
        youtube_url = EXCLUDED.youtube_url,
        is_public = EXCLUDED.is_public,
        updated_at = NOW()
      RETURNING id, user_id as "userId", handle, display_name as "displayName", bio, avatar_url as "avatarUrl",
                primary_platform as "primaryPlatform", tiktok_url as "tiktokUrl", instagram_url as "instagramUrl",
                youtube_url as "youtubeUrl", is_public as "isPublic", is_verified as "isVerified",
                total_approved_videos as "totalApprovedVideos", created_at as "createdAt", updated_at as "updatedAt"`,
          [
            id,
            data.userId,
            data.handle,
            data.displayName,
            data.bio || null,
            data.avatarUrl || null,
            data.primaryPlatform,
            data.tiktokUrl || null,
            data.instagramUrl || null,
            data.youtubeUrl || null,
            data.isPublic
          ]
        );
        return res.rows[0];
      }
      async listPublicCreators() {
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", handle, display_name as "displayName", bio, avatar_url as "avatarUrl",
              primary_platform as "primaryPlatform", tiktok_url as "tiktokUrl", instagram_url as "instagramUrl",
              youtube_url as "youtubeUrl", is_public as "isPublic", is_verified as "isVerified",
              total_approved_videos as "totalApprovedVideos", created_at as "createdAt", updated_at as "updatedAt"
       FROM creator_profiles
       WHERE is_public = TRUE
       ORDER BY total_approved_videos DESC, created_at DESC`
        );
        return res.rows;
      }
      async incrementInternalViews(videoId) {
        await this.pool.query(
          `UPDATE video_submissions SET internal_views_count = internal_views_count + 1 WHERE id = $1`,
          [videoId]
        );
      }
      async toggleSaveVideo(userId, videoId) {
        const existing = await this.pool.query(
          `SELECT id FROM saved_videos WHERE user_id = $1 AND video_id = $2`,
          [userId, videoId]
        );
        if (existing.rows.length > 0) {
          await this.pool.query(`DELETE FROM saved_videos WHERE user_id = $1 AND video_id = $2`, [userId, videoId]);
          await this.pool.query(
            `UPDATE video_submissions SET internal_saves_count = GREATEST(0, internal_saves_count - 1) WHERE id = $1`,
            [videoId]
          );
          return { saved: false };
        } else {
          const svId = `sv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await this.pool.query(`INSERT INTO saved_videos (id, user_id, video_id) VALUES ($1, $2, $3)`, [svId, userId, videoId]);
          await this.pool.query(
            `UPDATE video_submissions SET internal_saves_count = internal_saves_count + 1 WHERE id = $1`,
            [videoId]
          );
          return { saved: true };
        }
      }
      async isSavedByUser(userId, videoId) {
        const res = await this.pool.query(
          `SELECT 1 FROM saved_videos WHERE user_id = $1 AND video_id = $2 LIMIT 1`,
          [userId, videoId]
        );
        return res.rows.length > 0;
      }
      async getAdminMetrics() {
        const res = await this.pool.query(`
      SELECT
        COUNT(*)::int as "totalSubmissions",
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END)::int as "pendingCount",
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END)::int as "approvedCount",
        COUNT(CASE WHEN status = 'OBSERVED' THEN 1 END)::int as "observedCount",
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END)::int as "rejectedCount"
      FROM video_submissions
    `);
        const creatorCountRes = await this.pool.query(`SELECT COUNT(*)::int as count FROM creator_profiles`);
        return {
          totalSubmissions: res.rows[0]?.totalSubmissions || 0,
          pendingCount: res.rows[0]?.pendingCount || 0,
          approvedCount: res.rows[0]?.approvedCount || 0,
          observedCount: res.rows[0]?.observedCount || 0,
          rejectedCount: res.rows[0]?.rejectedCount || 0,
          totalCreators: creatorCountRes.rows[0]?.count || 0
        };
      }
    };
  }
});

// src/server/repositories/index.ts
var repositories_exports = {};
__export(repositories_exports, {
  checkDatabaseHealth: () => checkDatabaseHealth,
  closeDatabaseConnections: () => closeDatabaseConnections,
  getAuthRepository: () => getAuthRepository,
  getCreatorsRepository: () => getCreatorsRepository,
  isValidPostgresUrl: () => isValidPostgresUrl,
  resetRepositoriesForTesting: () => resetRepositoriesForTesting,
  setActiveDatabaseAdapterForTesting: () => setActiveDatabaseAdapterForTesting,
  validateDatabaseConfig: () => validateDatabaseConfig,
  verifyDatabaseConnectivity: () => verifyDatabaseConnectivity
});
function isValidPostgresUrl(rawUrl) {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed.startsWith("postgres://") && !trimmed.startsWith("postgresql://")) {
      return false;
    }
    const parsed = new URL(trimmed);
    return parsed.protocol === "postgres:" || parsed.protocol === "postgresql:";
  } catch {
    return false;
  }
}
function getSanitizedHost(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl.trim());
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return "PostgreSQL Endpoint";
  }
}
function validateDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    if (!databaseUrl) {
      throw new Error(
        "[Storage Architecture] FATAL: DATABASE_URL is missing in production environment. Refusing to start without persistent PostgreSQL."
      );
    }
    if (!isValidPostgresUrl(databaseUrl)) {
      throw new Error(
        "[Storage Architecture] FATAL: DATABASE_URL has an invalid PostgreSQL format in production environment."
      );
    }
  } else {
    if (databaseUrl && !isValidPostgresUrl(databaseUrl)) {
      console.warn(
        `[Storage Architecture] WARNING: DATABASE_URL provided is not a valid PostgreSQL URL (${databaseUrl.slice(0, 12)}...). Falling back to development In-Memory Adapter.`
      );
    }
  }
}
function initializeRepositories() {
  validateDatabaseConfig();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  if (databaseUrl) {
    if (!isValidPostgresUrl(databaseUrl)) {
      if (isProduction) {
        throw new Error(
          "[Storage Architecture] FATAL: DATABASE_URL has an invalid PostgreSQL format in production environment."
        );
      }
      console.warn(
        "[Storage Architecture] WARNING: DATABASE_URL provided is not a valid PostgreSQL URL. Falling back to development In-Memory Adapter."
      );
    } else {
      const sanitized = getSanitizedHost(databaseUrl);
      console.log(`[Storage Architecture] Activating PostgreSQL RDBMS adapter (${sanitized}).`);
      const postgresAdapter = new PostgresCreatorsRepository(databaseUrl);
      return {
        auth: postgresAdapter,
        creators: postgresAdapter,
        adapter: postgresAdapter
      };
    }
  }
  if (isProduction) {
    throw new Error(
      "[Storage Architecture] FATAL: Silent in-memory fallback is strictly forbidden in production. DATABASE_URL must be configured."
    );
  }
  console.log(
    "[Storage Architecture] DATABASE_URL is not set. Operating in development In-Memory Adapter. All interfaces match PostgreSQL 1:1."
  );
  const memoryAdapter = new MemoryCreatorsRepository();
  return {
    auth: memoryAdapter,
    creators: memoryAdapter,
    adapter: memoryAdapter
  };
}
function getAuthRepository() {
  if (!authRepoInstance) {
    const initialized = initializeRepositories();
    authRepoInstance = initialized.auth;
    creatorsRepoInstance = initialized.creators;
    activeDatabaseAdapter = initialized.adapter;
  }
  return authRepoInstance;
}
function getCreatorsRepository() {
  if (!creatorsRepoInstance) {
    const initialized = initializeRepositories();
    authRepoInstance = initialized.auth;
    creatorsRepoInstance = initialized.creators;
    activeDatabaseAdapter = initialized.adapter;
  }
  return creatorsRepoInstance;
}
async function verifyDatabaseConnectivity() {
  const isProduction = process.env.NODE_ENV === "production";
  getCreatorsRepository();
  if (isProduction && (!activeDatabaseAdapter || !(activeDatabaseAdapter instanceof PostgresCreatorsRepository))) {
    if (!activeDatabaseAdapter || typeof activeDatabaseAdapter.testConnection !== "function") {
      throw new Error(
        "[Storage Architecture] FATAL: Persistent PostgreSQL adapter is mandatory in production. Silent in-memory fallback is strictly forbidden."
      );
    }
  }
  if (activeDatabaseAdapter && typeof activeDatabaseAdapter.testConnection === "function") {
    try {
      await activeDatabaseAdapter.testConnection();
      console.log("[Storage Architecture] Database connectivity verified successfully with PostgreSQL.");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        `[Storage Architecture] Database connectivity test failed: ${message}`
      );
      if (isProduction) {
        throw new Error(
          `[Storage Architecture] FATAL: Unable to establish PostgreSQL connection in production (${message}). Server startup aborted.`
        );
      } else {
        console.warn(
          `[Storage Architecture] WARNING: Database connection failed in development (${message}). Operating with in-memory adapter.`
        );
        const memoryAdapter = new MemoryCreatorsRepository();
        authRepoInstance = memoryAdapter;
        creatorsRepoInstance = memoryAdapter;
        activeDatabaseAdapter = memoryAdapter;
      }
    }
  } else if (isProduction) {
    throw new Error(
      "[Storage Architecture] FATAL: Persistent PostgreSQL adapter is mandatory in production. In-memory adapter cannot be used."
    );
  }
}
async function checkDatabaseHealth() {
  const isProduction = process.env.NODE_ENV === "production";
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl || !isValidPostgresUrl(databaseUrl)) {
    return {
      connected: false,
      adapter: isProduction ? "none" : "memory",
      error: "DATABASE_URL is not configured or invalid"
    };
  }
  try {
    getCreatorsRepository();
  } catch {
    return {
      connected: false,
      adapter: isProduction ? "none" : "memory",
      error: "Failed to initialize database adapter"
    };
  }
  if (activeDatabaseAdapter && typeof activeDatabaseAdapter.testConnection === "function") {
    try {
      await activeDatabaseAdapter.testConnection();
      return {
        connected: true,
        adapter: "postgres"
      };
    } catch {
      return {
        connected: false,
        adapter: isProduction ? "none" : "memory",
        error: "Database ping failed"
      };
    }
  }
  return {
    connected: false,
    adapter: isProduction ? "none" : "memory",
    error: "No active persistent database adapter"
  };
}
function setActiveDatabaseAdapterForTesting(adapter) {
  activeDatabaseAdapter = adapter;
  if (adapter) {
    authRepoInstance = adapter;
    creatorsRepoInstance = adapter;
  } else {
    authRepoInstance = null;
    creatorsRepoInstance = null;
  }
}
function resetRepositoriesForTesting() {
  authRepoInstance = null;
  creatorsRepoInstance = null;
  activeDatabaseAdapter = null;
}
async function closeDatabaseConnections() {
  if (activeDatabaseAdapter && typeof activeDatabaseAdapter.close === "function") {
    await activeDatabaseAdapter.close();
    console.log("[Storage Architecture] Database connections closed cleanly.");
  }
}
var authRepoInstance, creatorsRepoInstance, activeDatabaseAdapter;
var init_repositories = __esm({
  "src/server/repositories/index.ts"() {
    init_memoryCreatorsRepository();
    init_postgresCreatorsRepository();
    authRepoInstance = null;
    creatorsRepoInstance = null;
    activeDatabaseAdapter = null;
  }
});

// src/server/geminiService.ts
var geminiService_exports = {};
__export(geminiService_exports, {
  generateAiResponse: () => generateAiResponse
});
import { GoogleGenAI } from "@google/genai";
async function generateAiResponse(params) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const systemPrompt = `Eres el Asistente Experto y Director Creativo de LibertadGO, el planificador tur\xEDstico inteligente oficial para el departamento de La Libertad, Per\xFA.
Tus capacidades principales son:
1. Dise\xF1ar itinerarios de viaje optimizados seg\xFAn el rango de fechas y la localidad seleccionada en La Libertad (Trujillo, Huanchaco, Moche, Magdalena de Cao, Pacasmayo, Malabrigo, Cascas, Huamachuco, etc.).
2. Recomendar lugares aut\xE9nticos de gastronom\xEDa criolla y marina (ceviche trujillano, cabrito a la norte\xF1a, shambar de lunes, cangrejo reventado).
3. Ayudar a negocios locales y creadores a redactar guiones virales de video para TikTok, Instagram Reels y YouTube Shorts (con gancho en 3 segundos, tomas visuales del local, narrativa y llamado a la acci\xF3n para el concurso de creadores con premios a los 3 primeros puestos).
Formato: Redacta con tono cordial, profesional, usando Markdown estructurado, vi\xF1etas y emojis. Mant\xE9n siempre el foco exclusivamente en La Libertad, Per\xFA.`;
      const userMessage = `Contexto del Viaje o Campa\xF1a:
${JSON.stringify(params.context || {}, null, 2)}

Solicitud del usuario:
${params.prompt}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}

---

${userMessage}` }]
          }
        ]
      });
      return {
        reply: response.text || "No se obtuvo respuesta del modelo Gemini.",
        modelUsed: "gemini-3.8-flash",
        source: "gemini-3.8-flash"
      };
    } catch (err) {
      console.error("[Gemini API Error]", err);
    }
  }
  const fallbackReply = generateDomainFallback(params);
  return {
    reply: fallbackReply,
    modelUsed: "gemini-3.8-flash",
    source: "libertadgo-expert"
  };
}
function generateDomainFallback(params) {
  const promptLower = params.prompt.toLowerCase();
  const dest = params.context?.localityName || params.context?.destination || "Trujillo y Huanchaco";
  const start = params.context?.startDate || "Fecha de inicio";
  const end = params.context?.endDate || "Fecha de fin";
  const biz = params.context?.businessName || "nuestro local en La Libertad";
  if (promptLower.includes("guion") || promptLower.includes("video") || promptLower.includes("tiktok") || promptLower.includes("reel") || promptLower.includes("creador") || promptLower.includes("campa\xF1a")) {
    return `### \u{1F3AC} Gui\xF3n de Video Viral (Reel / TikTok 30s) \u2014 Campa\xF1a Creadores La Libertad

**Local Destacado:** ${biz} (${dest})  
**Objetivo:** Clasificar entre los **3 Primeros Puestos** del Concurso Oficial de LibertadGO \u{1F3C6}

---

#### \u23F1\uFE0F Estructura Segundo a Segundo:

* **[00:00 - 00:03] Gancho Viral (Hook):**  
  \u{1F3A5} *C\xE1mara en primer plano con zoom r\xE1pido hacia el plato/experiencia m\xE1s impresionante de ${biz}.*  
  \u{1F5E3}\uFE0F *Voz en off:* *"Si vienes a ${dest} y no pruebas esto, \xA1literalmente no conociste el norte peruano!"*

* **[00:03 - 00:15] La Experiencia Real:**  
  \u{1F3A5} *Corte din\xE1mico: el maestro cocinero/anfitri\xF3n preparando la especialidad con ingredientes frescos de los valles liberte\xF1os, sonido ASMR de sartenes o el mar de fondo.*  
  \u{1F5E3}\uFE0F *Voz en off:* *"Aqu\xED en ${biz}, la tradici\xF3n mochica se siente en cada detalle. Desde el aroma inconfundible hasta la vista espectacular."*

* **[00:15 - 00:23] El Secreto del Local:**  
  \u{1F3A5} *Reacci\xF3n genuina al probar el bocado o disfrutar la estad\xEDa / vista.*  
  \u{1F5E3}\uFE0F *Voz en off:* *"El punto exacto de aj\xED mochero y la frescura que solo encuentras en La Libertad. \xA1Puntaje 10 de 10!"*

* **[00:23 - 00:30] Llamado a la Acci\xF3n (CTA):**  
  \u{1F3A5} *Texto en pantalla: 'Vota por este video en LibertadGO \u{1F947}'. Sonrisa del creador con el equipo del local.*  
  \u{1F5E3}\uFE0F *Voz en off:* *"Guarda este video para tu pr\xF3ximo viaje y ap\xF3yame con tu voto en LibertadGO para ganar el premio de los 3 mejores creadores. \xBFCon qui\xE9n vendr\xEDas?"*

---

#### \u{1F3F7}\uFE0F Hashtags Oficiales:
\`#LibertadGO #TurismoLaLibertad #${dest.replace(/\s+/g, "")} #GastronomiaTrujillana #CulturaMoche #TikTokPeru #DescubrePeru\``;
  }
  if (promptLower.includes("itinerario") || promptLower.includes("ruta") || promptLower.includes("plan") || promptLower.includes("dia")) {
    return `### \u{1F5FA}\uFE0F Itinerario Sugerido con Inteligencia Artificial \u2014 LibertadGO

**Destino:** ${dest}  
**Periodo:** ${start} al ${end}  
**Sello Oficial:** Verificado con datos de MINCETUR y OpenStreetMap  

---

#### \u{1F4CD} D\xEDa 1: Identidad Colonial y Gastronom\xEDa Criolla
* **09:00 AM:** Paseo por la **Plaza Mayor de Trujillo** y visita guiada a la Catedral y casonas virreinales (Casa Urquiaga).
* **11:30 AM:** Recorrido por el **Museo de Arqueolog\xEDa de la UNT** para conocer la cronolog\xEDa de las culturas Cupisnique, Moche y Chim\xFA.
* **01:30 PM:** Almuerzo tradicional en **El Rinc\xF3n de Vallejo** o **Restaurant Romano Criollo** (recomendado: Cabrito con frejoles y sopa te\xF3loga).
* **04:30 PM:** Caf\xE9 de media tarde en el centro hist\xF3rico y visita a la Plazuela El Recreo.

#### \u{1F4CD} D\xEDa 2: Arqueolog\xEDa Imperial y Atardecer en el Mar
* **09:30 AM:** Visita a la ciudadela de barro m\xE1s grande de Am\xE9rica: **Chan Chan (Palacio Nik An y Museo de Sitio)**.
* **12:30 PM:** Traslado hacia el balneario de **Huanchaco**.
* **01:00 PM:** Almuerzo marino en **Big Ben Huanchaco** o cevicher\xEDa frente al muelle (Ceviche tradicional con aj\xED mochero y chicharr\xF3n de calamar).
* **03:30 PM:** Paseo por el muelle artesanal, fotograf\xEDa de los legendarios **Caballitos de Totora** y observaci\xF3n de la puesta de sol.

#### \u{1F4CD} D\xEDa 3: Misticismo Mochica y Arqueolog\xEDa Viva
* **09:00 AM:** Excursi\xF3n a las imponentes **Huacas del Sol y de la Luna** en la campi\xF1a de Moche.
* **01:00 PM:** Almuerzo en **El Mochica de Moche** o picanter\xEDa campestre acompa\xF1ada de chicha de jora fresca.
* **03:30 PM:** Taller artesanal de cer\xE1mica mochica con maestros artesanos locales.

---
\u{1F4A1} *Tip experto:* Puedes a\xF1adir cualquiera de estos lugares directamente a tu itinerario haciendo clic en "Explorar" o "A\xF1adir al d\xEDa".`;
  }
  return `### \u{1F916} Asistente Inteligente de LibertadGO

\xA1Hola! Como asistente tur\xEDstico experto en **La Libertad, Per\xFA**, estoy aqu\xED para potenciar tu experiencia en **${dest}**.

**\xBFEn qu\xE9 puedo ayudarte hoy?**
1. **Planificar itinerarios personalizados** para tu rango de fechas (${start} al ${end}).
2. **Generar guiones virales de video** para que locales y creadores compitan por los premios a los **3 Primeros Puestos** (S/ 1,500, S/ 800 y S/ 400).
3. **Recomendarte la mejor ruta gastron\xF3mica:** desde el ceviche en Huanchaco hasta el Shambar trujillano de los lunes.
4. **Optimizar tiempos de traslado y visita** entre los monumentos arqueol\xF3gicos y las playas.

*Escribe tu pregunta con libertad y te preparar\xE9 la mejor propuesta tur\xEDstica de la regi\xF3n.*`;
}
var init_geminiService = __esm({
  "src/server/geminiService.ts"() {
  }
});

// server.ts
import "dotenv/config";
import fs from "fs";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

// src/server/routes.ts
import { Router as Router4 } from "express";

// src/server/repository.ts
init_initialPlaces();

// src/data/initialCampaigns.ts
var INITIAL_CAMPAIGNS = [
  {
    id: "camp_rincon_vallejo",
    title: "Desaf\xEDo Creador: El Mejor Plato Criollo de Trujillo",
    businessName: "El Rinc\xF3n de Vallejo",
    placeId: "place_rincon_vallejo",
    localityId: "trujillo",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    description: "Casona hist\xF3rica y restaurante tradicional donde almorzaba C\xE9sar Vallejo. Buscamos creadores que graben un video din\xE1mico (Reel / TikTok) mostrando nuestra saz\xF3n tradicional, el rinc\xF3n del poeta y la experiencia norte\xF1a.",
    videoBrief: "Video vertical (9:16) de 30 a 60 segundos. Debe incluir toma de la preparaci\xF3n o degustaci\xF3n del Seco de Cabrito o Shambar, menci\xF3n de la casona hist\xF3rica y la etiqueta oficial #LibertadGO.",
    requirements: [
      "Duraci\xF3n entre 30 y 60 segundos en TikTok, Reels o Shorts",
      "Mostrar el local y plato representativo",
      "Etiquetar a @elrincondevallejo y usar #LibertadGO",
      "Publicaci\xF3n en modo p\xFAblico durante las fechas del concurso"
    ],
    hashtags: ["#LibertadGO", "#ElRinconDeVallejo", "#TrujilloGastronomico", "#ComidaCriollaNorte\xF1a"],
    prizes: {
      first: {
        position: 1,
        title: "1\xBA Puesto \u2014 Oro",
        badge: "\u{1F947} Ganador Absoluto",
        cashPEN: 1500,
        perks: [
          "S/ 1,500 en efectivo directo",
          "Trofeo Oficial de Oro LibertadGO & Marca La Libertad",
          "Difusi\xF3n patrocinada del video en redes de Turismo La Libertad",
          "Almuerzo familiar de 6 tiempos con el Chef Principal"
        ]
      },
      second: {
        position: 2,
        title: "2\xBA Puesto \u2014 Plata",
        badge: "\u{1F948} Segundo Lugar",
        cashPEN: 800,
        perks: [
          "S/ 800 en efectivo directo",
          "Cena de degustaci\xF3n para 2 personas en El Rinc\xF3n de Vallejo",
          "Certificado de Honor como Creador Destacado"
        ]
      },
      third: {
        position: 3,
        title: "3\xBA Puesto \u2014 Bronce",
        badge: "\u{1F949} Tercer Lugar",
        cashPEN: 400,
        perks: [
          "S/ 400 en efectivo directo",
          "Canasta gourmet con postres tradicionales trujillanos y alfajores",
          "Menci\xF3n destacada en el portal oficial"
        ]
      }
    },
    submissions: [
      {
        id: "sub_1",
        campaignId: "camp_rincon_vallejo",
        creatorName: "Valeria Quispe",
        creatorHandle: "@valeviajeraperu",
        platform: "tiktok",
        videoUrl: "https://tiktok.com/@valeviajeraperu/video/7391823901",
        title: "\xA1Donde almorzaba C\xE9sar Vallejo en Trujillo! \u{1F372}\u2728",
        caption: "Probando el cabrito con frejoles m\xE1s emblem\xE1tico de Trujillo en la mesa original del poeta. \xA1Miren esa suavidad de carne! Voten por mi video en LibertadGO.",
        thumbnailUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
        votesCount: 342,
        viewsCount: 28400,
        submittedAt: "2026-11-03T14:20:00Z",
        status: "featured"
      },
      {
        id: "sub_2",
        campaignId: "camp_rincon_vallejo",
        creatorName: "Carlos Mendoza",
        creatorHandle: "@charlyfoodie_norte",
        platform: "reels",
        videoUrl: "https://instagram.com/reel/DC9102kls",
        title: "Ruta Gastron\xF3mica Centro Hist\xF3rico de Trujillo",
        caption: "Un recorrido visual por las casonas de Trujillo y la parada obligada en El Rinc\xF3n de Vallejo. Sabor aut\xE9ntico y cultura viva.",
        thumbnailUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
        votesCount: 289,
        viewsCount: 19800,
        submittedAt: "2026-11-04T10:15:00Z",
        status: "approved"
      },
      {
        id: "sub_3",
        campaignId: "camp_rincon_vallejo",
        creatorName: "Luc\xEDa Alvarado",
        creatorHandle: "@lucia.viajes.pe",
        platform: "tiktok",
        videoUrl: "https://tiktok.com/@lucia.viajes.pe/video/7402910293",
        title: "Shambar Trujillano: El secreto de los lunes \u{1F963}",
        caption: "No puedes decir que conoces Trujillo si no probaste el shambar tradicional. La historia detr\xE1s de este plato en el restaurante m\xE1s po\xE9tico.",
        thumbnailUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
        votesCount: 215,
        viewsCount: 14500,
        submittedAt: "2026-11-05T16:40:00Z",
        status: "approved"
      }
    ],
    status: "active",
    createdAt: "2026-11-01T08:00:00Z"
  },
  {
    id: "camp_big_ben_huanchaco",
    title: "Campa\xF1a: El Ceviche frente a los Caballitos de Totora",
    businessName: "Big Ben Huanchaco",
    placeId: "place_big_ben_huanchaco",
    localityId: "huanchaco",
    startDate: "2026-11-05",
    endDate: "2026-12-10",
    description: "Restaurante marino ic\xF3nico frente a la playa de Huanchaco. Convocamos a creadores de video para capturar la esencia del mar norte\xF1o, los caballitos de totora y el mejor ceviche con aj\xED mochero.",
    videoBrief: "Video de 30-45 segundos con tomas cinematogr\xE1ficas del oc\xE9ano, pescadores artesanales y la mesa servida en la terraza marina de Big Ben.",
    requirements: [
      "Grabar en el balneario de Huanchaco",
      "Mostrar la vista al mar y la propuesta gastron\xF3mica",
      "Mencionar los premios del concurso en LibertadGO"
    ],
    hashtags: ["#LibertadGO", "#BigBenHuanchaco", "#HuanchacoBeach", "#CevicheMochero"],
    prizes: {
      first: {
        position: 1,
        title: "1\xBA Puesto \u2014 Oro",
        badge: "\u{1F947} Mejor Video Marino",
        cashPEN: 1500,
        perks: [
          "S/ 1,500 en efectivo",
          "Noche de alojamiento en Suite frente al mar en Huanchaco",
          "Almuerzo marino exclusivo para 4 personas",
          "Paseo guiado en Caballito de Totora"
        ]
      },
      second: {
        position: 2,
        title: "2\xBA Puesto \u2014 Plata",
        badge: "\u{1F948} Segundo Lugar",
        cashPEN: 800,
        perks: [
          "S/ 800 en efectivo",
          "Ronda marina de degustaci\xF3n para 2 personas en Big Ben",
          "Certificado de reconocimiento"
        ]
      },
      third: {
        position: 3,
        title: "3\xBA Puesto \u2014 Bronce",
        badge: "\u{1F949} Tercer Lugar",
        cashPEN: 400,
        perks: [
          "S/ 400 en efectivo",
          "Ceviche cl\xE1sico y piqueo de chicharr\xF3n para 2",
          "Difusi\xF3n en canales de LibertadGO"
        ]
      }
    },
    submissions: [
      {
        id: "sub_bb_1",
        campaignId: "camp_big_ben_huanchaco",
        creatorName: "Renzo D\xEDaz",
        creatorHandle: "@renzowaves_pe",
        platform: "tiktok",
        videoUrl: "https://tiktok.com/@renzowaves_pe/video/7412891029",
        title: "Sunset m\xE1gico y ceviche fresco en Huanchaco \u{1F3C4}\u200D\u2642\uFE0F\u{1F305}",
        caption: "La combinaci\xF3n perfecta: olas, caballitos de totora milenarios y un ceviche con aj\xED mochero en la terraza de Big Ben. \xA1Vota por este video!",
        thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
        votesCount: 410,
        viewsCount: 35200,
        submittedAt: "2026-11-06T09:00:00Z",
        status: "featured"
      },
      {
        id: "sub_bb_2",
        campaignId: "camp_big_ben_huanchaco",
        creatorName: "Maritza Flores",
        creatorHandle: "@maritza_explora",
        platform: "reels",
        videoUrl: "https://instagram.com/reel/DD019283k",
        title: "El Cangrejo Reventado que debes probar",
        caption: "Una receta ancestral liberte\xF1a servida con la mejor vista al muelle de Huanchaco. \xBFYa sab\xEDas de este plato t\xEDpico?",
        thumbnailUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
        votesCount: 295,
        viewsCount: 22100,
        submittedAt: "2026-11-06T11:30:00Z",
        status: "approved"
      }
    ],
    status: "active",
    createdAt: "2026-11-05T10:00:00Z"
  },
  {
    id: "camp_malabrigo_chicama",
    title: "Desaf\xEDo Ola Izquierda: Surf & Hospedaje Malabrigo",
    businessName: "Chicama Boutique Hotel & Surf",
    placeId: "place_chicama_resort",
    localityId: "puerto_malabrigo",
    startDate: "2026-11-10",
    endDate: "2026-12-20",
    description: "Puerto Malabrigo alberga la ola izquierda perfecta m\xE1s larga del planeta. Invitamos a surfistas y vide\xF3grafos a capturar la emoci\xF3n de surfear Chicama y relajarse con gastronom\xEDa costera.",
    videoBrief: "Video de acci\xF3n y estilo de vida mostrando la ola infinita de Chicama, la caleta de pescadores y el confort del hotel con vista panor\xE1mica.",
    requirements: [
      "Tomas de surf o dron de la bah\xEDa de Malabrigo",
      "Mostrar las instalaciones del hotel / restaurante",
      "Etiqueta #OlaMasLarga y #LibertadGO"
    ],
    hashtags: ["#LibertadGO", "#ChicamaSurf", "#PuertoMalabrigo", "#OlaIzquierda", "#SurfPeru"],
    prizes: {
      first: {
        position: 1,
        title: "1\xBA Puesto \u2014 Oro",
        badge: "\u{1F947} Mejor Video de Aventura",
        cashPEN: 1500,
        perks: [
          "S/ 1,500 en efectivo",
          "Estad\xEDa de 3 d\xEDas / 2 noches para 2 con servicio de lancha de surf",
          "Sesi\xF3n fotogr\xE1fica profesional en el agua"
        ]
      },
      second: {
        position: 2,
        title: "2\xBA Puesto \u2014 Plata",
        badge: "\u{1F948} Segundo Lugar",
        cashPEN: 800,
        perks: [
          "S/ 800 en efectivo",
          "Estad\xEDa de 1 noche con desayuno buffet frente a la ola",
          "Pack de indumentaria surfista Chicama"
        ]
      },
      third: {
        position: 3,
        title: "3\xBA Puesto \u2014 Bronce",
        badge: "\u{1F949} Tercer Lugar",
        cashPEN: 400,
        perks: [
          "S/ 400 en efectivo",
          "Almuerzo especial para 2 en el restaurante del hotel",
          "Certificado de participaci\xF3n"
        ]
      }
    },
    submissions: [],
    status: "active",
    createdAt: "2026-11-06T12:00:00Z"
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
    heroImage: "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?auto=format&fit=crop&w=1200&q=80"
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
    this.campaigns = /* @__PURE__ */ new Map();
    for (const place of INITIAL_PLACES) {
      if (isWithinLaLibertad(place.coordinates)) {
        this.places.set(place.id, place);
      }
    }
    for (const campaign of INITIAL_CAMPAIGNS) {
      this.campaigns.set(campaign.id, campaign);
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
  // --- LOCAL BUSINESS CAMPAIGNS WITH CREATORS ---
  getCampaigns(filters) {
    let result = Array.from(this.campaigns.values());
    if (filters?.localityId && filters.localityId !== "todas") {
      const locId = filters.localityId.toLowerCase().trim();
      result = result.filter((c) => c.localityId.toLowerCase() === locId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.businessName.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.hashtags.some((h) => h.toLowerCase().includes(q))
      );
    }
    if (filters?.startDate) {
      result = result.filter((c) => c.endDate >= filters.startDate);
    }
    if (filters?.endDate) {
      result = result.filter((c) => c.startDate <= filters.endDate);
    }
    return result.map((c) => ({
      ...c,
      submissions: [...c.submissions].sort((a, b) => b.votesCount - a.votesCount)
    }));
  }
  getCampaignById(id) {
    const c = this.campaigns.get(id);
    if (!c) return void 0;
    return {
      ...c,
      submissions: [...c.submissions].sort((a, b) => b.votesCount - a.votesCount)
    };
  }
  createCampaign(data) {
    const id = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newCampaign = {
      ...data,
      id,
      submissions: [],
      status: "active",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }
  addSubmission(campaignId, submissionData) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      return { error: "Campa\xF1a no encontrada" };
    }
    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSubmission = {
      ...submissionData,
      id,
      campaignId,
      votesCount: 1,
      // initial vote from author
      viewsCount: Math.floor(Math.random() * 500) + 100,
      submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "approved"
    };
    campaign.submissions.push(newSubmission);
    return { submission: newSubmission };
  }
  voteSubmission(campaignId, submissionId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return { success: false, error: "Campa\xF1a no encontrada" };
    const submission = campaign.submissions.find((s) => s.id === submissionId);
    if (!submission) return { success: false, error: "Env\xEDo de video no encontrado" };
    submission.votesCount += 1;
    submission.viewsCount += Math.floor(Math.random() * 20) + 5;
    return { success: true, newVotes: submission.votesCount };
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

// src/server/authRoutes.ts
import { Router } from "express";

// src/server/creatorsSchemas.ts
import { z as z2 } from "zod";

// src/utils/videoUrlParser.ts
function parseAndValidateVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "La URL del video es obligatoria" };
  }
  const trimmed = rawUrl.trim();
  let parsedUrl;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    return { isValid: false, error: "La URL proporcionada no tiene un formato v\xE1lido" };
  }
  if (parsedUrl.protocol !== "https:") {
    return { isValid: false, error: "Por seguridad, solo se permiten enlaces seguros con HTTPS" };
  }
  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = parsedUrl.pathname;
  if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "youtu.be") {
    let videoId = null;
    if (hostname === "youtu.be") {
      videoId = pathname.slice(1).split("/")[0].split("?")[0];
    } else if (pathname.startsWith("/watch")) {
      videoId = parsedUrl.searchParams.get("v");
    } else if (pathname.startsWith("/shorts/")) {
      const parts = pathname.split("/");
      videoId = parts[2] || null;
    } else if (pathname.startsWith("/embed/")) {
      const parts = pathname.split("/");
      videoId = parts[2] || null;
    }
    if (!videoId || !/^[a-zA-Z0-9_-]{10,14}$/.test(videoId)) {
      return {
        isValid: false,
        error: "El enlace de YouTube no contiene un identificador de video v\xE1lido"
      };
    }
    return {
      isValid: true,
      data: {
        platform: "youtube",
        externalVideoId: videoId,
        canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`
      }
    };
  }
  if (hostname === "tiktok.com" || hostname === "m.tiktok.com" || hostname === "vt.tiktok.com" || hostname === "vm.tiktok.com") {
    const videoMatch = pathname.match(/\/video\/(\d{15,25})/);
    if (videoMatch && videoMatch[1]) {
      const videoId = videoMatch[1];
      return {
        isValid: true,
        data: {
          platform: "tiktok",
          externalVideoId: videoId,
          canonicalUrl: `https://www.tiktok.com${pathname.split("?")[0]}`,
          embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`
        }
      };
    }
    if (hostname === "vt.tiktok.com" || hostname === "vm.tiktok.com") {
      const shortCode = pathname.replace(/^\/+/, "").split("/")[0];
      if (/^[a-zA-Z0-9_-]{5,15}$/.test(shortCode)) {
        return {
          isValid: true,
          data: {
            platform: "tiktok",
            externalVideoId: `short_${shortCode}`,
            canonicalUrl: `https://${hostname}/${shortCode}`,
            embedUrl: `https://www.tiktok.com/embed/v2/short_${shortCode}`
          }
        };
      }
    }
    return {
      isValid: false,
      error: "Formato de enlace de TikTok no reconocido. Utiliza el enlace directo del video (ej. tiktok.com/@usuario/video/...)"
    };
  }
  if (hostname === "instagram.com") {
    const reelMatch = pathname.match(/\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/);
    if (reelMatch && reelMatch[2]) {
      const shortcode = reelMatch[2];
      return {
        isValid: true,
        data: {
          platform: "instagram",
          externalVideoId: shortcode,
          canonicalUrl: `https://www.instagram.com/reel/${shortcode}/`,
          embedUrl: `https://www.instagram.com/p/${shortcode}/embed`
        }
      };
    }
    return {
      isValid: false,
      error: "Formato de enlace de Instagram no reconocido. Utiliza enlaces de tipo /reel/ o /p/"
    };
  }
  return {
    isValid: false,
    error: "Plataforma no soportada. Solo se admiten enlaces de TikTok, Instagram y YouTube."
  };
}

// src/server/creatorsSchemas.ts
var validLocalityIds = new Set(LA_LIBERTAD_LOCALITIES.map((l) => l.id));
var RegisterUserSchema = z2.object({
  email: z2.string().trim().toLowerCase().email("El correo electr\xF3nico no es v\xE1lido"),
  password: z2.string().min(8, "La contrase\xF1a debe contener al menos 8 caracteres").max(100, "La contrase\xF1a no puede exceder 100 caracteres"),
  name: z2.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(80, "El nombre no puede exceder 80 caracteres")
});
var LoginUserSchema = z2.object({
  email: z2.string().trim().toLowerCase().email("El correo electr\xF3nico no es v\xE1lido"),
  password: z2.string().min(1, "La contrase\xF1a es requerida")
});
var CreatorProfileSchema = z2.object({
  handle: z2.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,30}$/, "El handle solo puede contener letras min\xFAsculas, n\xFAmeros y guiones bajos (3-30 caracteres)"),
  displayName: z2.string().trim().min(2, "El nombre visible debe tener al menos 2 caracteres").max(60, "El nombre visible no puede exceder 60 caracteres"),
  bio: z2.string().trim().max(300, "La biograf\xEDa no puede exceder 300 caracteres").optional().nullable(),
  avatarUrl: z2.string().url("La URL del avatar no es v\xE1lida").optional().nullable(),
  primaryPlatform: z2.enum(["tiktok", "instagram", "youtube"]),
  tiktokUrl: z2.string().url().optional().nullable(),
  instagramUrl: z2.string().url().optional().nullable(),
  youtubeUrl: z2.string().url().optional().nullable(),
  isPublic: z2.boolean().default(true)
});
var SubmitVideoSchema = z2.object({
  videoUrl: z2.string().trim().url("La URL del video debe ser un enlace v\xE1lido").refine((url) => parseAndValidateVideoUrl(url).isValid, {
    message: "La URL debe corresponder a un video v\xE1lido de TikTok, Instagram o YouTube"
  }),
  title: z2.string().trim().min(5, "El t\xEDtulo debe tener al menos 5 caracteres").max(140, "El t\xEDtulo no puede exceder 140 caracteres"),
  description: z2.string().trim().max(1e3, "La descripci\xF3n no puede exceder 1000 caracteres").optional().nullable(),
  contentType: z2.enum(["PLACE", "ROUTE", "GENERAL"]),
  category: z2.string().trim().min(2, "La categor\xEDa es requerida"),
  localityId: z2.string().trim().toLowerCase().optional().nullable().refine((locId) => !locId || validLocalityIds.has(locId), {
    message: "La localidad especificada debe pertenecer a la regi\xF3n La Libertad"
  }),
  thumbnailUrl: z2.string().trim().url("La URL de la miniatura debe ser v\xE1lida").optional().nullable(),
  placeIds: z2.array(z2.string().trim()).max(10, "No puedes vincular m\xE1s de 10 lugares por video").default([]),
  primaryPlaceId: z2.string().trim().optional().nullable()
});
var ModerationActionSchema = z2.object({
  action: z2.enum(["APPROVE", "REJECT", "OBSERVE", "HIDE"]),
  reason: z2.string().trim().max(500, "El motivo no puede exceder 500 caracteres").optional().nullable(),
  internalNotes: z2.string().trim().max(500, "Las notas internas no pueden exceder 500 caracteres").optional().nullable(),
  verifiedPlaceIds: z2.array(z2.string().trim()).optional()
});

// src/server/authRoutes.ts
init_repositories();

// src/server/authService.ts
init_repositories();
import crypto from "crypto";
var DEV_DEFAULT_SECRET = "libertadgo_sec_sig_7b29e01f5c6a84d3e218";
var TOKEN_EXPIRY_DAYS = 7;
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    if (!secret || secret === DEV_DEFAULT_SECRET || secret.length < 16) {
      throw new Error(
        "[Security] FATAL: SESSION_SECRET is mandatory in production and must not use the development default secret."
      );
    }
    return secret;
  }
  return secret || DEV_DEFAULT_SECRET;
}
function validateSecurityConfig() {
  const secret = process.env.SESSION_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction) {
    if (!secret) {
      throw new Error(
        "[Security] FATAL: SESSION_SECRET is mandatory in production environment. Refusing to start without configured session secret."
      );
    }
    if (secret === DEV_DEFAULT_SECRET) {
      throw new Error(
        "[Security] FATAL: SESSION_SECRET must not use the development default secret in production environment."
      );
    }
    if (secret.length < 16) {
      throw new Error(
        "[Security] FATAL: SESSION_SECRET must be at least 16 characters long in production environment."
      );
    }
  }
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}
function verifyPassword(password, storedHash) {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}
function createToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1e3) + TOKEN_EXPIRY_DAYS * 86400
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}
function verifyToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    );
    if (payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/libertadgo_token=([^;]+)/);
    if (match) token = match[1];
  }
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
function requireAuth(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Autenticaci\xF3n requerida. Inicia sesi\xF3n para continuar."
    });
    return;
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Autenticaci\xF3n requerida para acceder al \xE1rea administrativa."
    });
    return;
  }
  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      error: "Acceso denegado: se requieren permisos administrativos para esta operaci\xF3n."
    });
    return;
  }
  next();
}
async function bootstrapAdminFromEnv() {
  const email = process.env.ADMIN_INITIAL_EMAIL?.trim();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const name = process.env.ADMIN_INITIAL_NAME?.trim() || "Administrador LibertadGO";
  if (!email || !password) {
    console.log(
      "[Security] Admin bootstrap skipped: ADMIN_INITIAL_EMAIL and/or ADMIN_INITIAL_PASSWORD not configured. No administrative account created."
    );
    return { bootstrapped: false, reason: "missing_credentials" };
  }
  try {
    const authRepo = getAuthRepository();
    const existing = await authRepo.findUserByEmail(email);
    if (!existing) {
      console.log(`[Security] Bootstrapping initial admin account for: ${email}`);
      await authRepo.createUser({
        email,
        passwordHash: hashPassword(password),
        name,
        role: "ADMIN"
      });
      return { bootstrapped: true };
    } else {
      console.log(
        `[Security] Initial admin account (${email}) already exists. Preserving existing credentials and role during reboot.`
      );
      return { bootstrapped: false, reason: "already_exists" };
    }
  } catch (err) {
    console.warn(
      "[Security] WARNING: Could not bootstrap initial admin account:",
      err instanceof Error ? err.message : String(err)
    );
    throw err;
  }
}

// src/server/authRoutes.ts
var authRouter = Router();
authRouter.post("/register", async (req, res) => {
  const parseResult = RegisterUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const { email, password, name } = parseResult.data;
  const authRepo = getAuthRepository();
  try {
    const existing = await authRepo.findUserByEmail(email);
    if (existing) {
      res.status(409).json({
        success: false,
        error: "Ya existe una cuenta registrada con este correo electr\xF3nico"
      });
      return;
    }
    const newUser = await authRepo.createUser({
      email,
      passwordHash: hashPassword(password),
      name,
      role: "USER"
    });
    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          createdAt: newUser.createdAt
        },
        token
      },
      message: "Cuenta creada exitosamente"
    });
  } catch (err) {
    console.error("[Auth Error] Error registering user:", err);
    res.status(500).json({ success: false, error: "Error interno al registrar usuario" });
  }
});
authRouter.post("/login", async (req, res) => {
  const parseResult = LoginUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const { email, password } = parseResult.data;
  const authRepo = getAuthRepository();
  try {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Credenciales inv\xE1lidas. Verifica tu correo o contrase\xF1a."
      });
      return;
    }
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: "Credenciales inv\xE1lidas. Verifica tu correo o contrase\xF1a."
      });
      return;
    }
    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl
        },
        token
      }
    });
  } catch (err) {
    console.error("[Auth Error] Error logging in:", err);
    res.status(500).json({ success: false, error: "Error interno al iniciar sesi\xF3n" });
  }
});
authRouter.post("/logout", (_req, res) => {
  res.json({ success: true, message: "Sesi\xF3n cerrada correctamente" });
});
authRouter.get("/me", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "No autorizado" });
    return;
  }
  try {
    const authRepo = getAuthRepository();
    const creatorsRepo = getCreatorsRepository();
    const user = await authRepo.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, error: "Usuario no encontrado" });
      return;
    }
    const creatorProfile = await creatorsRepo.findCreatorProfileByUserId(user.id);
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt
        },
        creatorProfile
      }
    });
  } catch (err) {
    console.error("[Auth Error] Error getting current user:", err);
    res.status(500).json({ success: false, error: "Error al consultar informaci\xF3n del usuario" });
  }
});

// src/server/creatorsRoutes.ts
import { Router as Router2 } from "express";
init_repositories();
init_initialPlaces();
var creatorsRouter = Router2();
creatorsRouter.get("/videos", async (req, res) => {
  const { localityId, category, contentType, platform, q, placeId, page, limit } = req.query;
  const repo = getCreatorsRepository();
  try {
    const result = await repo.listApprovedVideos({
      localityId: typeof localityId === "string" ? localityId : void 0,
      category: typeof category === "string" ? category : void 0,
      contentType: typeof contentType === "string" ? contentType : void 0,
      platform: typeof platform === "string" ? platform : void 0,
      q: typeof q === "string" ? q : void 0,
      placeId: typeof placeId === "string" ? placeId : void 0,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20
    });
    res.json({
      success: true,
      data: result.videos,
      total: result.total,
      page: Number(page) || 1,
      limit: Number(limit) || 20
    });
  } catch (err) {
    console.error("[Creators Error] Error listing approved videos:", err);
    res.status(500).json({ success: false, error: "Error al consultar videos aprobados" });
  }
});
creatorsRouter.get("/videos/:id", async (req, res) => {
  const repo = getCreatorsRepository();
  try {
    const video = await repo.findSubmissionById(req.params.id);
    if (!video || video.status !== "APPROVED" && (!req.user || req.user.role !== "ADMIN" && req.user.userId !== video.userId)) {
      res.status(404).json({ success: false, error: "Video no encontrado o pendiente de aprobaci\xF3n" });
      return;
    }
    await repo.incrementInternalViews(video.id);
    const places = await repo.getPlacesForVideo(video.id);
    let isSaved = false;
    if (req.user) {
      isSaved = await repo.isSavedByUser(req.user.userId, video.id);
    }
    res.json({
      success: true,
      data: {
        ...video,
        places,
        isSaved
      }
    });
  } catch (err) {
    console.error("[Creators Error] Error getting video detail:", err);
    res.status(500).json({ success: false, error: "Error al obtener detalle del video" });
  }
});
creatorsRouter.post("/submissions", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Autenticaci\xF3n requerida" });
    return;
  }
  const parseResult = SubmitVideoSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const { videoUrl, title, description, contentType, category, localityId, thumbnailUrl, placeIds, primaryPlaceId } = parseResult.data;
  const parsed = parseAndValidateVideoUrl(videoUrl);
  if (!parsed.isValid || !parsed.data) {
    res.status(400).json({ success: false, error: parsed.error || "URL no soportada" });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const existing = await repo.findSubmissionByPlatformAndExternalId(
      parsed.data.platform,
      parsed.data.externalVideoId
    );
    if (existing) {
      if (existing.status === "APPROVED") {
        res.status(409).json({
          success: false,
          error: "Este video ya se encuentra publicado y aprobado en LibertadGO."
        });
        return;
      }
      if (existing.status === "PENDING") {
        res.status(409).json({
          success: false,
          error: "Este video ya ha sido enviado y se encuentra en revisi\xF3n en la bandeja de moderaci\xF3n."
        });
        return;
      }
    }
    const validPlaceIds = placeIds.filter(
      (pId) => INITIAL_PLACES.some((p) => p.id === pId)
    );
    const profile = await repo.findCreatorProfileByUserId(req.user.userId);
    const submission = await repo.createSubmission(
      {
        userId: req.user.userId,
        creatorProfileId: profile ? profile.id : null,
        platform: parsed.data.platform,
        externalVideoId: parsed.data.externalVideoId,
        videoUrl: parsed.data.canonicalUrl,
        embedUrl: parsed.data.embedUrl,
        thumbnailUrl: thumbnailUrl || null,
        title,
        description: description || null,
        contentType,
        category,
        localityId: localityId || null
      },
      validPlaceIds,
      primaryPlaceId || (validPlaceIds[0] || null)
    );
    res.status(201).json({
      success: true,
      data: submission,
      message: "Video enviado exitosamente. Tu publicaci\xF3n est\xE1 en revisi\xF3n por el equipo de moderaci\xF3n."
    });
  } catch (err) {
    console.error("[Creators Error] Error submitting video:", err);
    res.status(500).json({ success: false, error: "Error interno al enviar la publicaci\xF3n" });
  }
});
creatorsRouter.get("/my-submissions", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "No autorizado" });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const submissions = await repo.listSubmissionsByUser(req.user.userId);
    res.json({ success: true, data: submissions });
  } catch (err) {
    console.error("[Creators Error] Error getting my submissions:", err);
    res.status(500).json({ success: false, error: "Error al consultar tus publicaciones" });
  }
});
creatorsRouter.get("/profiles", async (_req, res) => {
  const repo = getCreatorsRepository();
  try {
    const profiles = await repo.listPublicCreators();
    res.json({ success: true, data: profiles });
  } catch (err) {
    console.error("[Creators Error] Error listing creators:", err);
    res.status(500).json({ success: false, error: "Error al consultar perfiles de creadores" });
  }
});
creatorsRouter.get("/profiles/:handle", async (req, res) => {
  const repo = getCreatorsRepository();
  try {
    const profile = await repo.findCreatorProfileByHandle(req.params.handle);
    if (!profile || !profile.isPublic) {
      res.status(404).json({ success: false, error: "Perfil de creador no encontrado o privado" });
      return;
    }
    const videos = await repo.listSubmissionsByUser(profile.userId);
    const approvedVideos = videos.filter((v) => v.status === "APPROVED");
    res.json({
      success: true,
      data: {
        profile,
        videos: approvedVideos
      }
    });
  } catch (err) {
    console.error("[Creators Error] Error getting creator profile:", err);
    res.status(500).json({ success: false, error: "Error al consultar el perfil" });
  }
});
creatorsRouter.put("/profile/me", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "No autorizado" });
    return;
  }
  const parseResult = CreatorProfileSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const existingWithHandle = await repo.findCreatorProfileByHandle(parseResult.data.handle);
    if (existingWithHandle && existingWithHandle.userId !== req.user.userId) {
      res.status(409).json({
        success: false,
        error: "El identificador @handle ya se encuentra en uso por otro creador"
      });
      return;
    }
    const profile = await repo.saveCreatorProfile({
      userId: req.user.userId,
      ...parseResult.data
    });
    res.json({
      success: true,
      data: profile,
      message: "Perfil de creador actualizado con \xE9xito"
    });
  } catch (err) {
    console.error("[Creators Error] Error saving creator profile:", err);
    res.status(500).json({ success: false, error: "Error al actualizar perfil de creador" });
  }
});
creatorsRouter.post("/videos/:id/save", requireAuth, async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "No autorizado" });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const result = await repo.toggleSaveVideo(req.user.userId, req.params.id);
    res.json({ success: true, saved: result.saved });
  } catch (err) {
    console.error("[Creators Error] Error saving video:", err);
    res.status(500).json({ success: false, error: "Error al guardar video en favoritos" });
  }
});
creatorsRouter.get("/places/:placeId/videos", async (req, res) => {
  const repo = getCreatorsRepository();
  try {
    const videos = await repo.getVideosForPlace(req.params.placeId);
    res.json({
      success: true,
      data: videos,
      total: videos.length,
      placeId: req.params.placeId
    });
  } catch (err) {
    console.error("[Creators Error] Error getting place videos:", err);
    res.status(500).json({ success: false, error: "Error al consultar videos del establecimiento" });
  }
});

// src/server/adminRoutes.ts
import { Router as Router3 } from "express";
init_repositories();
init_initialPlaces();
var adminRouter = Router3();
adminRouter.use(requireAuth, requireAdmin);
adminRouter.get("/metrics", async (_req, res) => {
  const repo = getCreatorsRepository();
  try {
    const metrics = await repo.getAdminMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("[Admin Error] Error fetching admin metrics:", err);
    res.status(500).json({ success: false, error: "Error al consultar m\xE9tricas del sistema" });
  }
});
adminRouter.get("/moderation/queue", async (req, res) => {
  const repo = getCreatorsRepository();
  const statusFilter = req.query.status || "PENDING";
  try {
    const queue = await repo.listModerationQueue(statusFilter);
    const enriched = await Promise.all(
      queue.map(async (v) => {
        const places = await repo.getPlacesForVideo(v.id);
        return {
          ...v,
          places
        };
      })
    );
    res.json({
      success: true,
      data: enriched,
      count: enriched.length,
      status: statusFilter
    });
  } catch (err) {
    console.error("[Admin Error] Error fetching moderation queue:", err);
    res.status(500).json({ success: false, error: "Error al consultar la bandeja de moderaci\xF3n" });
  }
});
adminRouter.post("/moderation/:id/action", async (req, res) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: "No autorizado" });
    return;
  }
  const parseResult = ModerationActionSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((i) => i.message).join(", ");
    res.status(400).json({ success: false, error: errorMsg });
    return;
  }
  const { action, reason, internalNotes, verifiedPlaceIds } = parseResult.data;
  const repo = getCreatorsRepository();
  try {
    const submission = await repo.findSubmissionById(req.params.id);
    if (!submission) {
      res.status(404).json({ success: false, error: "Publicaci\xF3n no encontrada" });
      return;
    }
    const previousStatus = submission.status;
    const actionToStatusMap = {
      APPROVE: "APPROVED",
      REJECT: "REJECTED",
      OBSERVE: "OBSERVED",
      HIDE: "HIDDEN"
    };
    const newStatus = actionToStatusMap[action];
    if (verifiedPlaceIds && Array.isArray(verifiedPlaceIds)) {
      const validIds = verifiedPlaceIds.filter(
        (pId) => INITIAL_PLACES.some((p) => p.id === pId)
      );
      await repo.associatePlaces(submission.id, validIds);
    }
    const updated = await repo.updateSubmissionStatus(
      submission.id,
      newStatus,
      reason || null,
      req.user.userId
    );
    await repo.addModerationLog({
      videoId: submission.id,
      adminUserId: req.user.userId,
      adminName: req.user.name,
      previousStatus,
      newStatus,
      reason: reason || null,
      internalNotes: internalNotes || null
    });
    res.json({
      success: true,
      data: updated,
      message: `Publicaci\xF3n moderada con \xE9xito. Estado: ${newStatus}`
    });
  } catch (err) {
    console.error("[Admin Error] Error performing moderation action:", err);
    res.status(500).json({ success: false, error: "Error interno al procesar acci\xF3n de moderaci\xF3n" });
  }
});
adminRouter.get("/moderation/:id/history", async (req, res) => {
  const repo = getCreatorsRepository();
  try {
    const logs = await repo.getModerationLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error("[Admin Error] Error fetching moderation logs:", err);
    res.status(500).json({ success: false, error: "Error al consultar historial de moderaci\xF3n" });
  }
});
adminRouter.put("/moderation/:id/places", async (req, res) => {
  const { placeIds, primaryPlaceId } = req.body;
  if (!Array.isArray(placeIds)) {
    res.status(400).json({ success: false, error: "placeIds debe ser un array de identificadores" });
    return;
  }
  const repo = getCreatorsRepository();
  try {
    const validIds = placeIds.filter(
      (pId) => INITIAL_PLACES.some((p) => p.id === pId)
    );
    await repo.associatePlaces(req.params.id, validIds, primaryPlaceId);
    const updatedPlaces = await repo.getPlacesForVideo(req.params.id);
    res.json({
      success: true,
      data: updatedPlaces,
      message: "Lugares vinculados actualizados correctamente"
    });
  } catch (err) {
    console.error("[Admin Error] Error updating linked places:", err);
    res.status(500).json({ success: false, error: "Error al actualizar lugares asociados" });
  }
});

// src/server/routes.ts
init_repositories();
var apiRouter = Router4();
apiRouter.get("/health", async (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  const dbHealth = await checkDatabaseHealth();
  res.json({
    status: dbHealth.connected ? "healthy" : "degraded",
    database: dbHealth.connected ? "connected" : "not_configured",
    environment: process.env.NODE_ENV === "production" ? "production" : "development",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.use(authMiddleware);
apiRouter.use("/auth", authRouter);
apiRouter.use("/creators", creatorsRouter);
apiRouter.use("/admin", adminRouter);
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
apiRouter.get("/places/:id/videos", async (req, res) => {
  try {
    const { getCreatorsRepository: getCreatorsRepository2 } = await Promise.resolve().then(() => (init_repositories(), repositories_exports));
    const repo = getCreatorsRepository2();
    const videos = await repo.getVideosForPlace(req.params.id);
    res.json({
      success: true,
      data: videos,
      total: videos.length,
      placeId: req.params.id
    });
  } catch (err) {
    console.error("[Places Error] Error getting place videos:", err);
    res.status(500).json({ success: false, error: "Error al consultar videos del lugar" });
  }
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
apiRouter.get("/campaigns", (req, res) => {
  const { localityId, q, startDate, endDate } = req.query;
  const campaigns = catalogRepository.getCampaigns({
    localityId: typeof localityId === "string" ? localityId : void 0,
    search: typeof q === "string" ? q : void 0,
    startDate: typeof startDate === "string" ? startDate : void 0,
    endDate: typeof endDate === "string" ? endDate : void 0
  });
  res.json({
    success: true,
    data: campaigns,
    total: campaigns.length,
    region: "La Libertad, Per\xFA",
    prizesAwardedTo: "Top 3 Puestos (Oro, Plata, Bronce)"
  });
});
apiRouter.get("/campaigns/:id", (req, res) => {
  const campaign = catalogRepository.getCampaignById(req.params.id);
  if (!campaign) {
    res.status(404).json({ success: false, error: "Campa\xF1a no encontrada" });
    return;
  }
  res.json({ success: true, data: campaign });
});
apiRouter.post("/campaigns", (req, res) => {
  const { title, businessName, placeId, localityId, startDate, endDate, description, videoBrief, requirements, hashtags, prizes } = req.body;
  if (!title || !businessName || !startDate || !endDate) {
    res.status(400).json({ success: false, error: "T\xEDtulo, nombre del local y fechas son requeridos" });
    return;
  }
  const defaultPrizes = prizes || {
    first: {
      position: 1,
      title: "1\xBA Puesto \u2014 Oro",
      badge: "\u{1F947} Ganador Absoluto",
      cashPEN: 1500,
      perks: ["S/ 1,500 en efectivo directo", "Trofeo Oficial de Oro LibertadGO", "Difusi\xF3n destacada"]
    },
    second: {
      position: 2,
      title: "2\xBA Puesto \u2014 Plata",
      badge: "\u{1F948} Segundo Lugar",
      cashPEN: 800,
      perks: ["S/ 800 en efectivo", "Experiencia gastron\xF3mica para 2 en el local", "Certificado oficial"]
    },
    third: {
      position: 3,
      title: "3\xBA Puesto \u2014 Bronce",
      badge: "\u{1F949} Tercer Lugar",
      cashPEN: 400,
      perks: ["S/ 400 en efectivo", "Canasta con productos regionales de La Libertad"]
    }
  };
  const newCampaign = catalogRepository.createCampaign({
    title,
    businessName,
    placeId: placeId || "place_custom",
    localityId: localityId || "trujillo",
    startDate,
    endDate,
    description: description || "Campa\xF1a de video para creadores de contenido.",
    videoBrief: videoBrief || "Video vertical de 30 a 60 segundos sobre la experiencia en nuestro local.",
    requirements: Array.isArray(requirements) ? requirements : ["Video vertical 9:16", "Menci\xF3n del local y #LibertadGO"],
    hashtags: Array.isArray(hashtags) ? hashtags : ["#LibertadGO", "#TurismoLaLibertad"],
    prizes: defaultPrizes,
    status: "active"
  });
  res.status(201).json({ success: true, data: newCampaign });
});
apiRouter.post("/campaigns/:id/submissions", (req, res) => {
  const { creatorName, creatorHandle, platform, videoUrl, title, caption, thumbnailUrl } = req.body;
  if (!creatorName || !videoUrl || !title) {
    res.status(400).json({ success: false, error: "Nombre del creador, enlace del video y t\xEDtulo son obligatorios" });
    return;
  }
  const result = catalogRepository.addSubmission(req.params.id, {
    creatorName,
    creatorHandle: creatorHandle || "@creador",
    platform: platform || "tiktok",
    videoUrl,
    title,
    caption: caption || "",
    thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
  });
  if (result.error || !result.submission) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }
  res.status(201).json({ success: true, data: result.submission });
});
apiRouter.post("/campaigns/:id/submissions/:subId/vote", (req, res) => {
  const result = catalogRepository.voteSubmission(req.params.id, req.params.subId);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error });
    return;
  }
  res.json({ success: true, newVotes: result.newVotes });
});
apiRouter.post("/ai/chat", async (req, res) => {
  try {
    const { message, context, remainingCredits } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ success: false, error: "Mensaje requerido" });
      return;
    }
    const { generateAiResponse: generateAiResponse2 } = await Promise.resolve().then(() => (init_geminiService(), geminiService_exports));
    const result = await generateAiResponse2({
      prompt: message,
      context
    });
    const creditsLeft = typeof remainingCredits === "number" ? Math.max(0, remainingCredits - 1) : 9;
    res.json({
      success: true,
      reply: result.reply,
      modelUsed: result.modelUsed,
      source: result.source,
      creditsRemaining: creditsLeft,
      freeCreditsCap: 10
    });
  } catch (error) {
    console.error("[API /api/ai/chat Error]", error);
    res.status(500).json({
      success: false,
      error: "Error al procesar consulta con el asistente de IA."
    });
  }
});

// server.ts
init_repositories();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var isShuttingDown = false;
function registerGracefulShutdown(server) {
  const shutdown = async (signal) => {
    if (isShuttingDown) {
      console.log(`[LibertadGO] Shutdown already in progress. Signal ${signal} ignored.`);
      return;
    }
    isShuttingDown = true;
    console.log(`[LibertadGO] Received ${signal}. Initiating graceful shutdown...`);
    const forcedTimeout = setTimeout(() => {
      console.error("[LibertadGO] Graceful shutdown timed out after 10s. Forcing exit.");
      process.exit(1);
    }, 1e4);
    forcedTimeout.unref();
    try {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log("[LibertadGO] HTTP server stopped accepting new requests.");
          resolve();
        });
      });
      await closeDatabaseConnections();
      console.log("[LibertadGO] Graceful shutdown completed cleanly.");
      clearTimeout(forcedTimeout);
      process.exit(0);
    } catch (err) {
      console.error("[LibertadGO] Error during graceful shutdown:", err);
      clearTimeout(forcedTimeout);
      process.exit(1);
    }
  };
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
}
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  const HOST = "0.0.0.0";
  let configError = null;
  try {
    validateSecurityConfig();
    validateDatabaseConfig();
    await verifyDatabaseConnectivity();
    await bootstrapAdminFromEnv();
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    configError = errorMsg;
    console.error(`[LibertadGO Configuration Alert] ${errorMsg}`);
    console.warn(
      `[LibertadGO] The server will listen on ${HOST}:${PORT} to maintain Cloud Run service health. Database-dependent endpoints will return 503 until configuration is set.`
    );
  }
  const distPath = path.resolve(__dirname, "dist");
  const isProduction = process.env.NODE_ENV === "production" && fs.existsSync(path.join(distPath, "index.html"));
  app.use(express.json());
  const handleHealthCheck = async (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    const dbHealth = await checkDatabaseHealth();
    res.json({
      status: dbHealth.connected ? "healthy" : "degraded",
      database: dbHealth.connected ? "connected" : "not_configured",
      environment: isProduction ? "production" : "development",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  };
  app.get("/api/health", handleHealthCheck);
  app.get("/health", handleHealthCheck);
  if (configError) {
    app.use(["/api/auth", "/api/creators", "/api/admin"], (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.status(503).json({
        success: false,
        error: "Servicio no disponible: configuraci\xF3n de producci\xF3n incompleta en Cloud Run.",
        detail: configError
      });
    });
  }
  app.use("/api", apiRouter);
  app.use(express.static(path.resolve(__dirname, "public")));
  if (isProduction) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        res.setHeader("Content-Type", "application/json");
        res.status(404).json({ success: false, error: "Endpoint API no encontrado" });
        return;
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.use("/api", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.status(404).json({ success: false, error: "Endpoint API no encontrado" });
    });
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  const server = app.listen(PORT, HOST, () => {
    console.log(
      `[LibertadGO] Server running on ${HOST}:${PORT}`
    );
    console.log(
      `[LibertadGO] Environment: ${isProduction ? "production" : "development"}`
    );
    if (configError) {
      console.warn(
        `[LibertadGO] Running in setup/catalog-only mode due to missing production configuration.`
      );
    }
  });
  registerGracefulShutdown(server);
}
startServer().catch((err) => {
  console.error("[LibertadGO] Failed to start server:", err?.message || err);
  process.exit(1);
});
