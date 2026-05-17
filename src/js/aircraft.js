window.TurboWingsAircraft = (() => {
  const ASSET_ROOT = "./assets/images/jets";
  const DEFAULT_AIRCRAFT_ID = "classic";

  const AIRCRAFT_CATALOG = [
    {
      id: "classic",
      nameKey: "aircraft.classic.name",
      classKey: "aircraft.classic.class",
      price: 0,
      speed: 62,
      handling: 48,
      durability: 70,
      imageSrc: "./assets/images/v1_default_gameplay_jet.png",
      homeImageSrc: "./assets/images/v1_default_HomeJet.png"
    },
    {
      id: "phantom",
      nameKey: "aircraft.phantom.name",
      classKey: "aircraft.phantom.class",
      price: 500,
      speed: 80,
      handling: 55,
      durability: 50,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_PhantomStrike.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_PhantomStrike.png`
    },
    {
      id: "viper",
      nameKey: "aircraft.viper.name",
      classKey: "aircraft.viper.class",
      price: 1000,
      speed: 65,
      handling: 85,
      durability: 45,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_ViperEdge.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_ViperEdge.png`
    },
    {
      id: "storm",
      nameKey: "aircraft.storm.name",
      classKey: "aircraft.storm.class",
      price: 2500,
      speed: 58,
      handling: 42,
      durability: 90,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_StormEagle.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_StormEagle.png`
    },
    {
      id: "midnight",
      nameKey: "aircraft.midnight.name",
      classKey: "aircraft.midnight.class",
      price: 5000,
      speed: 75,
      handling: 70,
      durability: 60,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_MidnightFury.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_MidnightFury.png`
    },
    {
      id: "solar",
      nameKey: "aircraft.solar.name",
      classKey: "aircraft.solar.class",
      price: 8000,
      speed: 68,
      handling: 60,
      durability: 85,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_SolarFalcon.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_SolarFalcon.png`
    },
    {
      id: "nebula",
      nameKey: "aircraft.nebula.name",
      classKey: "aircraft.nebula.class",
      price: 12000,
      speed: 88,
      handling: 78,
      durability: 65,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_NebulaX.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_NebulaX.png`
    },
    {
      id: "thunder",
      nameKey: "aircraft.thunder.name",
      classKey: "aircraft.thunder.class",
      price: 20000,
      speed: 95,
      handling: 90,
      durability: 95,
      imageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_ThunderKing.png`,
      homeImageSrc: `${ASSET_ROOT}/v1_default_gameplay_jet_ThunderKing.png`
    }
  ];

  const aircraftMap = Object.fromEntries(AIRCRAFT_CATALOG.map((a) => [a.id, a]));

  function getAircraftById(id) {
    return aircraftMap[id] || aircraftMap[DEFAULT_AIRCRAFT_ID];
  }

  function getCatalog() {
    return AIRCRAFT_CATALOG;
  }

  function getDefaultAircraftId() {
    return DEFAULT_AIRCRAFT_ID;
  }

  return {
    DEFAULT_AIRCRAFT_ID,
    getCatalog,
    getAircraftById,
    getDefaultAircraftId
  };
})();
