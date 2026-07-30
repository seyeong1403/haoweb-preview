/* *******************************************************
 * filename : main.js
 * description : 메인에만 사용되는 JS
 * date : 2022-08-08
******************************************************** */

$(document).ready(function  () {
	/* ************************
	* Func : 메인 Active
	* addClassName () 필요
	************************ */
	setTimeout(function  () {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				const targets = ["#header", "#mainVisual", ".footer-quick-menu"];
				targets.forEach(selector => {
					const $el = $(selector);
					if ($el.length) $el.addClass("main-start");
				});
			});
		});
	},200);
	
	/* ************************
	* Func : 메인 비주얼 높이 설정 및 slick 슬라이드
	* slick.js , getWindowWidth(), getWindowHeight() 필요
	************************ */
	// 메인 비주얼 높이값 설정
	if ($.exists('#mainVisual.full-height')) {
		mainVisualHeight();
		$(window).on('resize', mainVisualHeight);

		function mainVisualHeight () {
			var visual_height = getWindowHeight()	;	// header가 fixed or absolute일경우 - $("#header").height() 삭제
			$("#mainVisual").height(visual_height);
		}
	}

	// 메인 비주얼 고정 텍스트 Active
	if ($.exists('.main-visual-fixed-txt-con')) {
		addClassName($(".main-visual-fixed-txt-con"), "active-item");
	}

	// 메인 비주얼 슬라이드
	var $mainVisualItem = $(".main-visual-con");

	$mainVisualItem.on('init', function(event, slick, currentSlide) {
		$(".main-visual-item").eq(0).addClass("active-item first-progress");
		if ($.exists('.main-visual-conuter')) {
			$(".main-visual-conuter .total-num").text(slick.slideCount);
		}
	});
	$mainVisualItem.on('beforeChange', function(event, slick, currentSlide, nextSlide) {	
		$(this).find(".main-visual-item").eq(nextSlide).addClass("active-item");
		$(this).find(".main-visual-item").eq(currentSlide).addClass("stop-active-item");
		if ($.exists('.main-visual-conuter')) {
			$(".main-visual-conuter .cur-num").text(nextSlide+1);
		}
	});
	$mainVisualItem.on('afterChange', function() {
		$(".main-visual-item").removeClass("first-progress");
		$(this).find(".stop-active-item").removeClass("stop-active-item active-item");
	});

	$mainVisualItem.slick({
		slidesToShow: 1,
		slidesToScroll: 1,
		arrows: false,
		fade: true,
		//dots:true,
		autoplay: true,
		speed:1500,
		infinite:true,
		autoplaySpeed: 4000,
		pauseOnHover:false,
		zIndex:1,
		cssEase: 'cubic-bezier(0.87, 0.03, 0.41, 0.9)',
	});
	
	/* ************************
	* Func : 메인 텍스트 효과
	************************ */
	gsap.registerPlugin(ScrollTrigger);
	ScrollTrigger.addEventListener("refresh", () => {});
	ScrollTrigger.refresh();
	
	ScrollTrigger.matchMedia({
		"(min-width: 801px)": function() {
			const textElements = gsap.utils.toArray('.main-con01-txt .text');
			const itemHeight = $(".main-con01-txt").height();
			textElements.forEach((text, index) => {
			  gsap.to(text, {
				backgroundSize: '100%',
				ease: 'none',
				scrollTrigger: {
				  trigger: text,
				  start: () => `top+=${index * 100 - 350} center` , // index에 따라 시작 위치 다르게
				  end: `top+=${index * 100 + 100} center`,
				  scrub: true,
				},
			  });
			});
		},
		"(max-width: 800px)": function() {
				const textElements = gsap.utils.toArray('.main-con01-txt .text');
				const itemHeight = $(".main-con01-txt").height();
				textElements.forEach((text, index) => {
				  gsap.to(text, {
					backgroundSize: '100%',
					ease: 'none',
					scrollTrigger: {
					  trigger: text,
					  start: "top center" , // index에 따라 시작 위치 다르게
					  end: "bottom center",
					  scrub: true,
					},
				  });
				});
			}
		});
		
	/* ************************
	* Func : 메인 AI Active
	************************ */
	let $mainCon02 = $(".main-con02");
	let mainAiOffset = "70%";
	let ai_timer = null;
	let $mainAiList = $(".main-ai-list");
	let $mainAiItem = $mainAiList.find("li");
	let mainAiItemLength = $mainAiItem.length;

	let $mainAiTxtItems = $(".main-ai-txt-pc .main-ai-txt-con");
	let $mainAiTxtItemsM = $(".main-ai-txt-m .main-ai-txt-con");
	let isFirstPlay = true; // ⭐ 최초 실행 여부

	// 처음엔 전부 숨기되
	//$mainAiTxtItems.hide();
	//$mainAiTxtItemsM.hide();

	// ⭐ 첫 번째 텍스트는 그냥 보여주기 (깜빡임 X)
	$mainAiTxtItems
		.filter('[data-index="1"]')
		.addClass('on');
	$mainAiTxtItemsM
		.filter('[data-index="1"]')
		.addClass('on');
	
	$mainCon02.waypoint(function(direction) {
		if (direction === "down") {
			mainAiActive();
			$mainCon02.addClass('animated');
		}else if ( direction === "up") {
			$mainCon02.removeClass('animated');
		}
	},{
		triggerOnce: true,
		offset: mainAiOffset
	});

	function mainAiActive() {
		var startNum = 0;
		var rollingSpeed = $mainAiList.data("rolling-time");
	
		function showTxtCon(idx) {
			var targetIndex = idx + 1;

			if (isFirstPlay) {
				// 최초 1회는 애니메이션 없이
				//$mainAiTxtItems.hide();
				$mainAiTxtItems
					.filter('[data-index="' + targetIndex + '"]')
					.addClass('on')
				//$mainAiTxtItemsM.hide();
				$mainAiTxtItemsM
					.filter('[data-index="' + targetIndex + '"]')
					.addClass('on')

				isFirstPlay = false;
			} else {
				// 이후부터는 fade 전환
				$mainAiTxtItems
					.stop(true, true)
					.removeClass('on')

				$mainAiTxtItems
					.filter('[data-index="' + targetIndex + '"]')
					.stop(true, true)
					.addClass('on')
				
				$mainAiTxtItemsM
					.stop(true, true)
					.removeClass('on')

				$mainAiTxtItemsM
					.filter('[data-index="' + targetIndex + '"]')
					.stop(true, true)
					.addClass('on')
			}
		}

		function mainAiPlay() {
			// li on 처리
			$mainAiItem.each(function(id){
				$(this).toggleClass("on", id === startNum);
			});

			showTxtCon(startNum);
		}

		function mainAiTime(){
			if (startNum < mainAiItemLength - 1) startNum++;
			else startNum = 0;

			mainAiPlay();
		}

		// 최초 1회 (깜빡임 없음)
		mainAiPlay();

		if (ai_timer) clearInterval(ai_timer);
		ai_timer = setInterval(mainAiTime, rollingSpeed);
	}

	
	$('.main-con03').waypoint(function(direction) {
		if (direction === "down") {
			$('.main-con03').addClass('animated');
		}else if ( direction === "up") {
			$('.main-con03').removeClass('animated');
		}
	},{
		triggerOnce: true,
		offset: mainAiOffset
	});
		
	$('.main-con04-box').waypoint(function(direction) {
		if (direction === "down") {
			$('.main-con04-box').addClass('animated');
		}else if ( direction === "up") {
			$('.main-con04-box').removeClass('animated');
		}
	},{
		triggerOnce: true,
		offset: mainAiOffset
	});
		
	$('.main-con07').waypoint(function(direction) {
		if (direction === "down") {
			$('.main-con07').addClass('animated');
		}else if ( direction === "up") {
			$('.main-con07').removeClass('animated');
		}
	},{
		triggerOnce: true,
		offset: mainAiOffset
	});
	
	buildCountBox();
	followMousePointer();
	
	/* ************************
	* Func : 배경 스크롤 트리거
	************************ */
	var controller = new ScrollMagic.Controller();
	var timeline = new TimelineMax();
	function setSvgPosition(){
		if ( getWindowWidth () > 1280 ) {
			main1SvgX = -400;
			main1SvgY = $("#mainContent1").outerHeight() - 50;

			main2SvgX = -200;
			main2SvgY = main1SvgY + $("#mainContent2").outerHeight();

			main3SvgX = 30;
			main3SvgY = main2SvgY + $("#mainContent3").outerHeight()/2 - 40;

			main4SvgX = -410;
			main4SvgY = main3SvgY + $("#mainContent3").outerHeight() + $("#mainContent4").outerHeight()/2 + 150;

		}else{
			if( getWindowWidth () > 800) {
				main1SvgX = -250;
				main1SvgY = $("#mainContent1").outerHeight() - 20;

				main2SvgX = -120;
				main2SvgY = main1SvgY + $("#mainContent2").outerHeight();

				main3SvgX = 50;
				main3SvgY = main2SvgY + 400;

				main4SvgX = -250;
				main4SvgY = main3SvgY + $("#mainContent3").outerHeight() - 100;
			}else{
				main1SvgX = -100;
				main1SvgY = $("#mainContent1").outerHeight() - 100;

				main2SvgX = 50;
				main2SvgY = main1SvgY + $("#mainContent2").outerHeight()  ;

				main3SvgX = -100;
				main3SvgY = main2SvgY + $("#mainContent3").outerHeight()/2;

				main4SvgX = 50;
				main4SvgY = main3SvgY + $("#mainContent4").outerHeight();
			}
		}
	}

	/* 최초 실행 */
	setSvgPosition();


	/* resize 대응 */
	$(window).on("resize", function(){
		setSvgPosition();
	});
	
	
	// About -> Full-Stack AI 상단으로
	var tweenMain0 = TweenMax.to(".main-bg-svg", 1,{
		opacity: 1,
		ease:Power1.easeInOut,
	});
	var tweenMain1 = TweenMax.to(".main-bg-svg", 10, {
		xPercent: main1SvgX,	
		y: main1SvgY,
		scale: 1.3,
		//rotation: -90,
		opacity: 1,
		ease:Power1.easeInOut,
	});
	// Full-Stack AI  좌측 상단 ->   3섹션 우측 상단
	var tweenMain2 = TweenMax.to(".main-bg-svg", 7, {
		xPercent: main2SvgX,
		y: main2SvgY,
		scale: 2.0,
		//rotation: 118,
		opacity: 1,
		ease: Power1.easeInOut
	});
	var tweenMain3 = TweenMax.to(".main-bg-svg", 7, {
		xPercent: main3SvgX,
		y: main3SvgY,
		scale: 2.4,
		//rotation: 170,
		ease: Power1.easeInOut
	});
	var tweenMain4 = TweenMax.to(".main-bg-svg", {
		opacity: 0.2,
		ease: Power1.easeInOut
	});
	// 3섹션 우측 상단 -> Our Mission 좌측
	var tweenMain5 = TweenMax.to(".main-bg-svg", 15, {
		xPercent: main4SvgX,
		y: main4SvgY,
		scale:2.3,
		rotation: 30,
		ease: Power1.easeInOut
	});
	var tweenMain6 = TweenMax.to(".main-bg-svg", 3,{
		opacity: 1,
		ease: Power1.easeInOut
	});
	
	var scene1 = new ScrollMagic.Scene({
		triggerElement: "#mainContent1",
		triggerHook: 1.0, 
		duration: '380%',
	});
		
	timeline.add(tweenMain0).add(tweenMain1, "+=2").add(tweenMain2).add(tweenMain3).add(tweenMain4, "<3.5").add(tweenMain5).add(tweenMain6, "<2.0");
	scene1.setTween(timeline)
	scene1.addTo(controller);
	
	/* ************************
		* Func : 메인 파트너사 슬라이드 왼쪽
		************************ */
		// 롤링 배너 복제본 생성
		let rollerL = document.querySelector('.main-partners-roller.left');
		// 하오웹: 파트너 섹션을 사용하지 않으므로 요소가 없으면 이후 롤링 코드를 건너뛴다
		// (이 지점 이후 ready 블록 끝까지는 전부 파트너 슬라이드 코드)
		if (!rollerL) return;
		rollerL.id = 'roller1';

		let cloneL = rollerL.cloneNode(true);
		cloneL.id ='roller2';
		document.querySelector('.main-partners-top .main-partners-wrap').appendChild(cloneL); 

		//원본, 복제본 배너 위치 지정
		document.querySelector('#roller1').style.left = '0px';
		document.querySelector('#roller2').style.left = document.querySelector('.main-partners-roller.left .main-partners-list').offsetWidth+'px';

		//클래스할당
		rollerL.classList.add('original');
		cloneL.classList.add('clone');

		//인터벌 메서드로 애니메이션 생성
		let rollerLWidth = document.querySelector('.main-partners-roller.left .main-partners-list').offsetWidth;
		let betweenDistanceL = 1;
		originalID = window.setInterval(betweenRollCallback, parseInt(1000/100), betweenDistanceL, document.querySelector('#roller1'));
		cloneLID = window.setInterval(betweenRollCallback, parseInt(1000/100), betweenDistanceL, document.querySelector('#roller2'));

		//인터벌 애니메이션 함수(공용)
		function betweenRollCallback(d, rollerL){
			let left = parseInt(rollerL.style.left);
			rollerL.style.left = (left - d)+'px';//이동
			//조건부 위치 리셋
			if(rollerLWidth + (left - d) <= 0){
				rollerL.style.left = rollerLWidth+'px';
			}
		}

		/* ************************
		* Func : 메인 파트너사 슬라이드 오른쪽
		************************ */
		//롤링 배너 복제본 생성
		let rollerR = document.querySelector('.main-partners-roller.right');
		rollerR.id = 'roller3';

		let cloneR = rollerR.cloneNode(true);
		cloneR.id = 'roller4';
		document.querySelector('.main-partners-bottom .main-partners-wrap').appendChild(cloneR); //부착

		//원본, 복제본 배너 위치 지정
		document.querySelector('#roller3').style.right = '0px';
		document.querySelector('#roller4').style.right = document.querySelector('.main-partners-roller.right .main-partners-list').offsetWidth+'px';

		//클래스 할당
		rollerR.classList.add('original');
		cloneR.classList.add('clone');

		//인터벌 메서드로 애니메이션 생성
		let rollerRWidth = document.querySelector('.main-partners-roller.right .main-partners-list').offsetWidth;//회전 배너 너비값
		let betweenDistanceR = 1;//이동 크기 - 정수여야 함
		originalID = window.setInterval(betweenRollCallbackR, parseInt(1000/100), betweenDistanceR, document.querySelector('#roller3'));
		cloneRID = window.setInterval(betweenRollCallbackR, parseInt(1000/100), betweenDistanceR, document.querySelector('#roller4'));

		//인터벌 애니메이션 함수(공용)
		function betweenRollCallbackR(d, rollerR){
			let right = parseInt(rollerR.style.right);
			rollerR.style.right = (right - d)+'px';//이동
			//조건부 위치 리셋
			if(rollerRWidth + (right - d) <= 0){
				rollerR.style.right = rollerRWidth+'px';
			}
		}
	
});

/* ************************
* Func : mouse pointer 모션
************************ */
function followMousePointer () {
	var $mouse_follow_btn = $(".mouse-default");

	$("body").on('mousemove', function (e){
		var sxPos = e.pageX / $(this).width() * 100 - 50;
		var syPos = e.pageY / $(this).height() * 100 - 50;

		if ($.exists($mouse_follow_btn)) {
			TweenMax.to($mouse_follow_btn, 3, {
				x: e.clientX,
				y: e.clientY,
				ease: Expo.easeOut,
				duration: 2
			});
		}
	});
}

/* ************************
* Func : 카운팅 효과
************************ */
function buildCountBox() {
	const boxes = document.querySelectorAll('.count-num-box[data-countNum]');
	if (!boxes.length) return;

	boxes.forEach(box => {
		let raw = box.getAttribute('data-countNum') || '';
		raw = raw.replace(/,/g, '').trim();

		if (!/^\d+$/.test(raw)) return;

		const digits = raw.split('');
		const len = digits.length;

		box.innerHTML = '';

		digits.forEach((ch, idx) => {
			const d = parseInt(ch, 10);
			const isDown = (idx % 2 === 0);

			// html 구조 생성
			const wrap = document.createElement('div');
			wrap.classList.add('count-num-item-wrap');
			wrap.classList.add('num' + String(idx + 1).padStart(2, '0'));

			const ul = document.createElement('ul');
			ul.classList.add('count-num-item-box');
			if (isDown) {
				ul.classList.add('down');
			}

			const items = [];

			if (isDown) {
				// down 클래스 → 첫 번째 li가 최종 숫자
				let cur = d;
				for (let k = 0; k < 10; k++) {
				    items.push(cur);
				    cur = (cur + 9) % 10; // cur - 1
				}
			} else {
				// 디폴트 → 마지막(10번째) li가 최종 숫자
				for (let k = 0; k < 9; k++) {
				    const v = d - 1 - k;
				    const digit = ((v % 10) + 10) % 10;
				    items.push(digit);
				}
				items.push(d); // 마지막에 최종 숫자
			}

			items.forEach(num => {
				const li = document.createElement('li');
				li.classList.add('count-num-item');
				li.textContent = num;
				ul.appendChild(li);
			});

			wrap.appendChild(ul);
			box.appendChild(wrap);

			// 천 단위마다 콤마 <p>,</p> 추가
			const remaining = len - idx - 1;
			if (remaining > 0 && remaining % 3 === 0) {
				const commaP = document.createElement('p');
				commaP.textContent = ',';
				box.appendChild(commaP);
			}
		});
	});
}

/* 문의하기 select */
$('.inquiry-pop select').fakeselect();