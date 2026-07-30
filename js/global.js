let activeContinentIdx = null; // 초기 아시아 강조 제거
let lockedContinentIdx = null; // 클릭으로 고정된 대륙 idx
let globeInstance = null;
const markerElements = new Map();

let autoRotate = true;		// 자동회전
		
// 관리용 색상 테마
const THEME = {
	hex: {
		base: '#d5d5d5',     // 기본/예외/고정
		hover: '#ee7500'     // hover 강조
	},
	fallback: {
		globe: '#f5f5f5',   // 이미지 없을 때 지구 단색
		background: 'rgba(0,0,0,0)' // 이미지 없을 때 배경 단색
	},
	atmosphere: {
		enabled: false,         // 후광 on/off
		color: 'rgba(255,255,255,0.05)',      // 후광 색
		altitude: 0         // 두께(0~1)
	},
};

function hexToRgbArr(hex) {
  if (!hex) return null;
  let s = hex.trim();
  if (!s.startsWith('#')) s = '#' + s;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return null;
  const v = s.slice(1);
  if (v.length === 3) return v.split('').map(ch => parseInt(ch + ch, 16));
  return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)];
}

function checkImage(url) {
	return new Promise((resolve) => {
		if (!url) return resolve(false);
		const img = new Image();
		img.onload = () => resolve(true);
		img.onerror = () => resolve(false);
		img.src = url;
	});
}

// 대륙별 ISO 국가 코드
const continentCountryMap = {
  1: [ // 아시아
    "AF", "BD", "BN", "BT", "CN", "HK", "ID", "IN", "JP", "KH", "KP",
    "KR", "LA", "LK", "MM", "MN", "MY", "NP", "PH", "PK", "SG", "TH",
    "TL", "TW", "VN", 
  ],
  2: [ // 러시아 / CIS
    "RU", "KZ", "KG", "TM", "AZ", "AM", "GE", "BY", "UA", "MD", "UZ", "TJ",
	//중앙아시아: 카자흐스탄, 우즈베키스탄, 키르기스스탄, 타지키스탄
	//유럽권: 벨라루스, 몰도바
	//러시아: 핵심 주도국
  ],
  3: [ // 미주 (북미 + 남미 포함)
    "AG", "AR", "BS", "BB", "BZ", "BO", "BR", "CA", "CL", "CO", "CR", "CU", "DM",
    "DO", "EC", "SV", "GD", "GT", "GY", "HT", "HN", "JM", "MX", "NI", "PA", "PY",
    "PE", "KN", "LC", "VC", "SR", "TT", "US", "UY", "VE", "GF", "GL", "FK",
	// 남미 추가 ISO 코드 보완
    "AI", "AW", "BM", "CW", "MS", "SX", "BQ",
  ],
  4: [ // 유럽 / 중동
    "AL", "AD", "AT", "BE", "BA", "BG", "HR", "CY", "CZ", "DK", "EE", "FI",
    "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV", "LI", "LT", "LU", "MT",
    "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "SM", "RS", "SK", "SI",
    "ES", "SE", "CH", "GB", "VA", "GI", "GG", "JE", "AX", "XK",
    // 중동
    "IR", "IQ", "IL", "JO", "KW", "OM", "PS", "QA", "SA", "SY", "AE", "YE", "LB", 
	"TR", 
  ],
  5: [ // 오세아니아
    "AS", "AU", "CK", "FJ", "FM", "GU", "KI", "MH", "NR", "NC", "NZ", "NU", "NF",
    "MP", "PW", "PG", "PN", "WS", "SB", "TK", "TO", "TV", "VU", "WF",
  ]
};

// 각 대륙 중심 위치 정의 (continent-hover-area용)
const continentHoverAreas = [
  { lat: 34, lng: 90, idx: 1, label: 'Asia'  },     // 아시아
  { lat: 55, lng: 60, idx: 2, label: 'Russia & CIS' },    // 러시아/CIS
  { lat: 15, lng: -75, idx: 3, label: 'America' },   // 미주 (북미 + 남미 전역 커버)
  { lat: 45, lng: 20, idx: 4, label: 'Europe & Middle East' },    // 유럽/중동
  { lat: -25, lng: 135, idx: 5, label: 'Oceania' }   // 오세아니아
];

// 대륙명 노출
function updateMarkerVisibility() {
  markerElements.forEach((el, label) => {
    const d = [...markerData, ...continentHoverAreas].find(item => item.label === label);
    if (!d) return;

	
  });
}

// 글로브에서 직접 클릭한 헥사에 대해 대륙 고정
function findContinentFromISO(iso) {
	for (const [idx, countries] of Object.entries(continentCountryMap)) {
		if (countries.includes(iso)) return parseInt(idx);
	}
	//return null;
}

// URL 파라미터로 초기 대륙 선택값 설정
const regionParam = new URLSearchParams(location.search).get('region');
const regionMap = { asia: 1, cis: 2, america: 3, emea: 4, oceania: 5 };
if (regionParam && regionMap[regionParam]) {
  activeContinentIdx = regionMap[regionParam];
  lockedContinentIdx = regionMap[regionParam];
  setActiveMenu(lockedContinentIdx);
  filterNetworkList(lockedContinentIdx);
}


// 지구 클릭 이벤트 연결
function onHexClick(d) {
  const iso = d.properties?.ISO_A2;
  const continentIdx = findContinentFromISO(iso);
  if (continentIdx !== null) {
    /*const regionMap = {
      1: 'asia',
      2: 'cis',
      3: 'america',
      4: 'emea',
      5: 'oceania'
    };
    const region = regionMap[continentIdx];
    if (region) {
      location.href = `./sub.php?region=${region}`;
    }*/
  }
}

const continentsData = [
  { lat: 34, lng: 90, idx: 1, label: 'Asia' },
  { lat: 55, lng: 60, idx: 2, label: 'Russia & CIS' },
  { lat: 40, lng: -100, idx: 3, label: 'America' },
  { lat: 45, lng: 20, idx: 4, label: 'Europe & Middle East' },
  { lat: -25, lng: 135, idx: 5, label: 'Oceania' }
];

const manualHexPatch = [
  { lat: 5.0, lng: -55.0 }, // Guyana / Suriname 중간
  { lat: 4.5, lng: -53.0 },
  { lat: 5.5, lng: -57.0 },
  { lat: 4.0, lng: -54.5 }, // French Guiana
  { lat: 5.0, lng: -55.0 }, // Suriname
  { lat: 6.0, lng: -58.0 }, // Guyana
  { lat: 7.0, lng: -66.0 }, // Venezuela 동부
  { lat: 9.0, lng: -79.0 }  // Panama 확인용

];

function createContinentMarker(d) {
  const el = document.createElement('div');
  el.className = 'continent-hover-marker';

  el.addEventListener('pointerenter', () => {
    el.classList.add('hovered');
    updateMarkerVisibility();
	autoRotate = false;
  });

  el.addEventListener('pointerleave', () => {
    el.classList.remove('hovered');
    updateMarkerVisibility();
	autoRotate = true;
  });

  return el;
}

function getFeatureCentroid(feature) {
  try {
    const coords = feature.geometry.type === 'Polygon'
      ? feature.geometry.coordinates[0]
      : feature.geometry.coordinates[0][0];
    const lngSum = coords.reduce((sum, coord) => sum + coord[0], 0);
    const latSum = coords.reduce((sum, coord) => sum + coord[1], 0);
    return [lngSum / coords.length, latSum / coords.length];
  } catch (e) {
    return [0, 0];
  }
}

function hexColorFunction(d) {
  const iso = d.properties.ISO_A2;
  const continentOfThisHex = findContinentFromISO(iso);
  if (!continentOfThisHex) return THEME.hex.base;

  if (continentOfThisHex === lockedContinentIdx) return THEME.hex.base;
  if (continentOfThisHex === activeContinentIdx) return THEME.hex.hover;
  return THEME.hex.base;
}

function onContinentHoverFromHtml(idx) {
	activeContinentIdx = idx;
	if (globeInstance) {
    globeInstance
      .hexPolygonColor(hexColorFunction)
      .hexPolygonsData(globeInstance.hexPolygonsData());
	}
}

function onContinentLeaveFromHtml() {
	activeContinentIdx = null;
	if (globeInstance) {
    globeInstance
      .hexPolygonColor(hexColorFunction)
      .hexPolygonsData(globeInstance.hexPolygonsData());
	}
}

function setActiveMenu(idx) {
  document.querySelectorAll('.sub-menu-global li').forEach(li => li.classList.remove('on'));
  const regionKey = Object.entries({
    1: 'asia',
    2: 'cis',
    3: 'america',
    4: 'emea',
    5: 'oceania'
  }).find(([key, value]) => parseInt(key) === idx)?.[1];
  if (regionKey) {
    const targetLi = document.querySelector(`.sub-menu-global li[data-region="${regionKey}"]`);
    if (targetLi) targetLi.classList.add('on');
  }
}

function clearActiveMenu() {
  document.querySelectorAll('.sub-menu-global li').forEach(li => li.classList.remove('on'));
}

function filterNetworkList(idx) {
  const regionKey = {
    1: 'asia',
    2: 'cis',
    3: 'america',
    4: 'emea',
    5: 'oceania'
  }[idx];

  const networkItems = document.querySelectorAll(".sub-network-item");
  networkItems.forEach(item => {
    if (!regionKey || item.dataset.region === regionKey) {
      item.style.display = "list-item";
    } else {
      item.style.display = "none";
    }
  });
}

function resizeGlobe(world) {
  const globeViz = document.getElementById('globeViz');
  if (globeViz) {
    const { clientWidth, clientHeight } = globeViz;
    world.width([clientWidth]);
    world.height([clientHeight]);
    globeViz.style.transform = 'scale(1)';
    globeViz.style.transformOrigin = 'center';
    const currentView = world.pointOfView();
    world.pointOfView({
      lat: currentView.lat,
      lng: currentView.lng,
      altitude: currentView.altitude
    });
  }
}

/*const makerIcon = `<i class="xi-maker"></i>`

const markerData = [
  { lat: 34, lng: 90, idx: 1, label: 'NIFCO KOREA', type: 'marker', color:'#ee7500', country:'korea', link:'https://www.naver.com/'},
  { lat: 60, lng: 100, idx: 2, label: 'NIFCO KOREA', type: 'marker', color:'#ee7500', country:'korea', link:'https://www.naver.com/'},
  { lat: 40, lng: -100, idx: 3, label: 'NIFCO KOREA', type: 'marker', color:'#ee7500', country:'korea', link:'https://www.naver.com/'},
  { lat: 45, lng: 20, idx: 4, label: 'NIFCO JAPAN', type: 'marker', color:'#BEBEBE', country:'japan', link:'https://www.naver.com/'},
  { lat: -25, lng: 135, idx: 5, label: 'NIFCO JAPAN', type: 'marker', color:'#BEBEBE', country:'japan', link:'https://www.naver.com/'},
];*/


fetch('./datasets/ne_110m_admin_0_countries.geojson')
  .then(res => res.json())
  .then(countries => {
    const isoFixMap = {
	  "Norway": "NO",
	  "France": "FR",
	  "Kosovo": "XK",
	  "Somaliland": "SO", // 사실상 독립, ISO 미인정
	  "Palestine": "PS",
	  "Taiwan": "TW",
	  "Western Sahara": "EH",
	  "Northern Cyprus": "CY",
	  "South Sudan": "SS",
	  "Sudan": "SD",
	  "Serbia": "RS",  // 일부 구 버전 GeoJSON에서 "-99"
	  "Czechia": "CZ", // 'Czech Republic'로 들어갈 수 있음
	  "Macedonia": "MK", // 현재는 North Macedonia
	  "Eswatini": "SZ", // 이전명 Swaziland
	  "Timor-Leste": "TL", // East Timor
	  "Vietnam": "VN", // 일부 오래된 파일에서 "-99" 처리됨
	};

	countries.features.forEach(f => {
      if (f.properties.ISO_A2 === "-99") {
        const fixed = isoFixMap[f.properties.ADMIN];
        if (fixed) {
          f.properties.ISO_A2 = fixed;
        }
      }
    });
	
	// 1. hex 생성 함수
    function createFakeHexFeature(iso, lat, lng, radius = 2) {
		  const points = [];
		  for (let i = 0; i < 6; i++) {
			const angle = 2 * Math.PI * i / 6;
			const dx = radius * Math.cos(angle);
			const dy = radius * Math.sin(angle);
			points.push([lng + dx, lat + dy]);
		  }
		  points.push(points[0]);
		  return {
			type: "Feature",
			properties: { ISO_A2: iso, ADMIN: iso },
			geometry: { type: "Polygon", coordinates: [points] }
		  };
		}

		function createHexGridFeatures(
		  iso, centerLat, centerLng,
		  radius = 2, step = 2,
		  gridSizeX = 1, gridSizeY = 1,
		  offsetX = 0, offsetY = 0
		) {
		  const features = [];
		  for (let dx = -gridSizeX + offsetX; dx <= gridSizeX + offsetX; dx++) {
			for (let dy = -gridSizeY + offsetY; dy <= gridSizeY + offsetY; dy++) {
			  const lat = centerLat + dy * step;
			  const lng = centerLng + dx * step;
			  features.push(createFakeHexFeature(iso, lat, lng, radius));
			}
		  }
		  return features;
		}

    // 2. 수동 헥사곤 생성(맨끝에 3개/위로,왼쪽으로,?)
    const continentHexPatches = {
		1: [ // 아시아
			
		],
		3: [ // 미주
			
		],
		4: [ // 유럽
			
		],
		5: [ // 오세아니아
			
		]
	};

	let patchHexes = continentHexPatches
  ? Object.values(continentHexPatches).flat().flat()
  : [];

	Object.values(continentHexPatches).forEach(patchGroup => {
	  patchGroup.forEach(hexList => {
		patchHexes = [...patchHexes, ...hexList];
	  });
	});

	const combinedHexes = [...countries.features, ...patchHexes];
	
	function extractContinentHoverElements(continentIdx, features) {
	  const isoList = continentCountryMap[continentIdx];
	  return features
		.filter(f => isoList.includes(f.properties.ISO_A2))
		.map(f => {
		  const [lng, lat] = getFeatureCentroid(f);
		  return { lat, lng, idx: continentIdx };
		});
	}

	const continentHoverAreas = [
		  { lat: 34, lng: 90, idx: 1, label: 'Asia', type: 'balloon' },   // 아시아 
		  //{ lat: 28, lng: 55, idx: 1, label: 'Asia', type: 'balloon' }, //서아시아 
		  //{ lat: 38, lng: 130, idx: 1, label: 'Asia', type: 'balloon' }, //동아시아
		  //{ lat: 32, lng: 110, idx: 1, label: 'Asia', type: 'balloon' }, //중국 보완
		  //{ lat: 5, lng: 105, idx: 1, label: 'Asia', type: 'balloon' }, //동남아시아
		  //{ lat: 22, lng: 80, idx: 1, label: 'Asia', type: 'balloon' },     // 인도 추가

		 { lat: 55, lng: 34, idx: 2, label: 'Russia & CIS', type: 'balloon' },    // 러시아 서부
		//{ lat: 55, lng: 60, idx: 2, label: 'Russia & CIS', type: 'balloon' },    // 기존 중심
		//{ lat: 60, lng: 100, idx: 2, label: 'Russia & CIS', type: 'balloon' },   // 러시아 중부
		//{ lat: 60, lng: 140, idx: 2, label: 'Russia & CIS', type: 'balloon' },   // 러시아 동부

		  { lat: 40, lng: -100, idx: 3, label: 'America', type: 'balloon' },
		  //{ lat: 63, lng: -135, idx: 3, label: 'America', type: 'balloon' },  // 북미 북서
		//{ lat: 70, lng: -40, idx: 3, label: 'America', type: 'balloon' },   // 북미 북동 (그린란드쪽)
		//{ lat: 39, lng: -95, idx: 3, label: 'America', type: 'balloon' },  // 미국 중부
		//{ lat: 45, lng: -120, idx: 3, label: 'America', type: 'balloon' },  // 북미 남서
		//{ lat: 45, lng: -70, idx: 3, label: 'America', type: 'balloon' },   // 북미 남동

		//{ lat: 25, lng: -100, idx: 3, label: 'America', type: 'balloon' },  // 중미 북서
		//{ lat: 20, lng: -90, idx: 3, label: 'America', type: 'balloon' },  // 중미
		//{ lat: 15, lng: -80, idx: 3, label: 'America', type: 'balloon' }, //중미 남동

		//{ lat: -2, lng: -75, idx: 3, label: 'America', type: 'balloon' },   // 남미 북서
		//{ lat: -5, lng: -50, idx: 3, label: 'America', type: 'balloon' },   // 남미 북동
		//{ lat: -15, lng: -60, idx: 3, label: 'America', type: 'balloon' },   // 남미 중앙
		//{ lat: -37, lng: -70, idx: 3, label: 'America', type: 'balloon' },  // 남미 남서
		//{ lat: -25, lng: -50, idx: 3, label: 'America', type: 'balloon' },   // 남미 남동

		{ lat: 45, lng: 20, idx: 4, label: 'Europe & Middle East', type: 'balloon' },
		//{ lat: 45, lng: -5, idx: 4, label: 'Europe & Middle East', type: 'balloon' },    // 서유럽
		//{ lat: 58, lng: 12, idx: 4, label: 'Europe & Middle East', type: 'balloon' },   // 동유럽
		//{ lat: 40, lng: 22, idx: 4, label: 'Europe & Middle East', type: 'balloon' },   // 터키 보완 (유럽-중동 사이)
		//{ lat: 25, lng: 50, idx: 4, label: 'Europe & Middle East', type: 'balloon' }, //중동중심

		{ lat: -25, lng: 135, idx: 5, label: 'Oceania', type: 'balloon' },
		//{ lat: -5, lng: 150, idx: 5, label: 'Oceania', type: 'balloon' },     // 오세아니아 서쪽
		//{ lat: -25, lng: 120, idx: 5, label: 'Oceania', type: 'balloon' },    // 오세아니아 중심
		//{ lat: -25, lng: 140, idx: 5, label: 'Oceania', type: 'balloon' },    // 오세아니아 동쪽
	];

	(async function initGlobeWithFallback() {
		
		globeInstance = Globe()
		  //.htmlElementsData([...markerData])
		  //.htmlElement(d => createContinentMarker(d))
		  .hexPolygonsData(combinedHexes)
		  .hexPolygonResolution(3)
		  .hexPolygonMargin(0.4)
		  .hexPolygonUseDots(false)
		  .hexPolygonAltitude(0.01)
		  .hexPolygonColor(hexColorFunction)
		  .showAtmosphere(!!THEME.atmosphere.enabled)
		  .atmosphereColor(THEME.atmosphere.color)
		  .atmosphereAltitude(Math.max(0, Math.min(1, Number(THEME.atmosphere.altitude) || 0)))
		  (document.getElementById('globeViz'));
		  
		globeInstance.globeMaterial().color.set(THEME.fallback.globe);
		globeInstance.backgroundColor(THEME.fallback.background);
		globeInstance.onPolygonClick(onHexClick);

		resizeGlobe(globeInstance);
		window.addEventListener('resize', () => resizeGlobe(globeInstance));
		globeInstance.controls().enableZoom = false;

		function calculateAltitudeByViewport() {
			  const vw = window.innerWidth;
			  const vh = window.innerHeight;
			  const minDim = Math.min(vw);
			  // 화면이 작아질수록 지구를 더 멀리
			  if (minDim < 480) return 5;
			  if (minDim < 800) return 2.8;
			  if (minDim < 1280) return 2;
			  return 2.3;
		}

		/*function updateMarkerScaleByAltitude(altitude) {
		  const scale = 2 / altitude;

		  markerElements.forEach((el) => {
			const text = el.querySelector('.continent-hover-marker .marker-label');
			console.log(text);
			 if (text) {
				text.style.fontSize = `${3.84 * scale}rem`;
			  }
		  });
		}*/

		function setPointOfViewWithMarkerUpdate(view) {
		  globeInstance.pointOfView(view);
		  //updateMarkerScaleByAltitude(view.altitude);
		}

		// 최초 설정 시 호출
		setTimeout(() => {
		  const initialAltitude = calculateAltitudeByViewport();
		  setPointOfViewWithMarkerUpdate({
			lat: 32.689487,
			lng: 87.691711,
			altitude: initialAltitude
		  });
		}, 100); // 렌더 직후 마커 스케일 조절

		// 리사이즈 대응
		window.addEventListener('resize', () => {
		  const newAltitude = calculateAltitudeByViewport();
		  setPointOfViewWithMarkerUpdate({
			lat: globeInstance.pointOfView().lat,
			lng: globeInstance.pointOfView().lng,
			altitude: newAltitude
		  });

		  // 마커 스케일도 업데이트
		  //updateMarkerScaleByAltitude(newAltitude);
		});

		(function animate() {
			if (autoRotate) {
				globeInstance.pointOfView({
					lat: globeInstance.pointOfView().lat,
					lng: globeInstance.pointOfView().lng + 0.2
				});
			}
			requestAnimationFrame(animate);
		})();
	})();
  });

  // --- 유틸: 색/URL 정리 및 검증 ---
function normalizeHexColor(v) {
  if (!v) return null;
  let s = v.trim();
  if (!s.startsWith('#')) s = '#' + s;
  // #RGB 또는 #RRGGBB 허용. 대충이라도 막아두기.
  const ok = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
  return ok ? s : null;
}
function normalizeUrl(v) {
  const s = (v || '').trim();
  return s.length ? s : null;
}
