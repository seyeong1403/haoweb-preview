/* *******************************************************
 * filename : sub.js
 * description : 서브컨텐츠에만 사용되는 JS
 * date : 2022-08-04
******************************************************** */


$(document).ready(function  () {
	/* ************************
	* Func : 서브 Visual Active 클래스 붙이기
	* addClassName () 필요
	************************ */
	setTimeout(function  () {
		addClassName($("#visual"), "active");
	},200);

	/* ************************
	* Func : 모달팝업 플러그인 사용
	* MagnificPopup.js 필요
	************************ */
	if ($.exists(".popup-gallery")) {
		magnificPopup($(".popup-gallery"));
	}

	/* ************************
	* Func : 일정 가로사이즈 아래부터 scroll 사용하기
	* mCustomScrollbar.js, customScrollX() 필요
	************************ */
	/* 서브 Scrollbar object  */
	$(".custom-scrollbar-wrapper").each(function  () {
		$(this).prepend("<div class='custom-scrollbar-cover'><div class='scroll-cover-txt'><i class='xi-touch'></i></div></div>");
		var $scrollObject = $(this).find(".scroll-object-box");
		if ($.exists($scrollObject)) {
			customScrollX($scrollObject);
		}
		$(this).on("touchmove click",function  () {
			$(this).find(".custom-scrollbar-cover").fadeOut(200);
		});
	});

	/* ************************
	* Func : 서브 상단 메뉴 FIXED
	* getWindowWidth(), checkOffset(), toFit() 필요
	************************ */
	if ($.exists(".fixed-sub-menu")) {
		var $fixedSubMenu = $(".fixed-sub-menu");
		var topMenuStart =  checkOffset($fixedSubMenu);
		$(window).resize(function  () {
			if ( getWindowWidth() > tabletWidth ) {
				topMenuStart =  checkOffset($fixedSubMenu);
			}else {
				$fixedSubMenu.removeClass("top-fixed");
			}
		});
		window.addEventListener('scroll', toFit(function  () {
			if ( getWindowWidth() > tabletWidth ) {
				objectFixed($fixedSubMenu, topMenuStart, "top-fixed");
			}else {
				$fixedSubMenu.removeClass("top-fixed");
			}
		}, {
		}),{ passive: true })
	}

	/* ************************
	* Func : 컨텐츠 메뉴 FIXED 및 클릭시 해당영역 이동
	* getScrollTop(), getWindowWidth(), checkOffset(), toFit(), checkFixedHeight(), moveScrollTop() 필요
	************************ */
	if ($.exists(".cm-fixed-tab-container-JS")) {
		var $fixedMoveTab = $(".cm-fixed-tab-list-JS");		// fixed되는 메뉴 클래스
		var $moveTabItem = $fixedMoveTab.find("li");
		var menuCount= $moveTabItem.length;
		var nav = [];
		
		$(window).on('load', function  () {
			checkStartOffset();
			nav = checkTopOffset();
		});
		$(window).on('resize', function  () {
			checkStartOffset();
			nav = checkTopOffset();
		}); 		
		
		// 탭이 붙기 시작하는 지점 체크
		function checkStartOffset () {
			var fixedStartPoint =  $(".cm-fixed-tab-container-JS").offset().top - checkFixedHeight();	
			return fixedStartPoint;
		}		

		// 해당되는 각각의 영역 상단값 측정
		function checkTopOffset () {
			var arr = [];
			for(var i=0;i < menuCount;i++){
				arr[i]=$($moveTabItem.eq(i).children("a").attr("href")).offset().top;
			}
			return arr;
		}
		
		// 스크롤 0일때 상단fixed되는 높이값 체크
		function checkFixedObjectHeight () {
			var fixedObjectTotalHeight = 0;
			for (var i=0; i<$(".top-fixed-object").length; i++) {
				var fixedObjectTotalHeight = fixedObjectTotalHeight + $(".top-fixed-object").eq(i).outerHeight();
			}
			return fixedObjectTotalHeight;
		}

		// 스크롤 event 
		window.addEventListener('scroll', toFit(function  () {
			// 메뉴fixed
			// objectFixed($fixedMoveTab, checkStartOffset(), "top-fixed");

			if ( getScrollTop() >  checkStartOffset() ) {
				$fixedMoveTab.addClass("top-fixed");
			}else if ( getScrollTop() <  (checkStartOffset() + $fixedMoveTab.height()) ) {
				$fixedMoveTab.removeClass("top-fixed");
			}

			$moveTabItem.each(function  (idx) {
				var eachOffset = nav[idx] -  checkFixedHeight();
				var minusOffset = $(window).height() / 6;	// 스크롤시 selected 붙는 지점을 조금 더 빠르게 하기위해 추가
				
				if( (getScrollTop() + minusOffset) >= eachOffset ){
					$moveTabItem.removeClass('selected');
					$moveTabItem.eq(idx).addClass('selected');
					// 모바일 드롭메뉴일때
					if ($.exists($moveTabItem.parents(".cm-drop-menu-box-JS"))) {
						$fixedMoveTab.find(".cm-drop-open-btn-JS > span").text($moveTabItem.eq(idx).find("em").text());
					}
				};
			});
			}, {
		}),{ passive: true })
		
		// 클릭 event 
		$moveTabItem.find("a").click(function  () {
			var goDivOffset = $($(this).attr("href")).offset().top - checkFixedHeight() +1;	// 이동해야할 지점
			if ( getScrollTop()  < checkStartOffset()) {
				if ( getScrollTop() == 0 ) {
					var goDiv = goDivOffset - checkFixedObjectHeight();
				}else {
					var goDiv = goDivOffset - $fixedMoveTab.height();
				}
			}else {
				var goDiv = goDivOffset;
			}
			setTimeout(function  () {
				moveScrollTop(goDiv);
			});

			// 모바일 드롭메뉴일때
			if ($.exists($(this).parents(".cm-drop-menu-box-JS")) ) {
				if ( getWindowWidth () < $fixedMoveTab.data("drop-width")+1 ) {
					$fixedMoveTab.find("ul").slideUp();
				}
			}
			 
			return false;
		});
	}

	/* ************************
	* Func : 에디터관련
	************************ */
	if ($.exists(".editor")) {
		/* 테이블 스크롤넣기 */ 
		$(".editor table").each(function  () {
			$(this).wrap("<div class='editor-table-box'></div>");
		});
		
		/* iframe 태그 감싸기 */ 
		$(".editor *:not('.editor-iframe-box') iframe").each(function  () {
			var iframeSrc = $(this).attr("src");
			var findStr = "https://www.youtube.com/embed"; 

			if (iframeSrc.indexOf(findStr) != -1) {
			  $(this).wrap("<div class='editor-iframe-box'></div>");
			}
		});
	}
	
	/* ************************
	* Func : INDUSTRY 페이지
	************************ */
	if ($.exists(".industry-func-list01")) {
		rollingActive($(".industry-func-list01"));
	}
	if ($.exists(".industry-func-list02")) {
		rollingActive($(".industry-func-list02"));
	}
	
	/* ************************
	* Func : TECHNOLOGY 페이지
	************************ */
	rollingActive(".tech-list");
	rollingActive(".tech-point-list");
	
	rollingActive2(".tech-list");
	
	function rollingActive2 (activeList2) {
		$(activeList2).each(function  (index) {
			var $itemList2 = $(this);
			var $item2 = $itemList2.find("li");
			var itemLength2 = $item2.length;
			var startNum2 = 0;
			var rollingSpeed2 = $itemList2.data("rolling-time");
			
			function visualTime2() {
				// 마지막까지 다 붙인 상태면 => 리셋
				if (startNum2 >= itemLength2) {
					$item2.removeClass("on"); 
					startNum2 = 0;
					
					setTimeout(function () {
						$item2.eq(startNum2).addClass("on");
						startNum2++;
					}, 30);

					return;
				}

				$item2.eq(startNum2).addClass("on");
				startNum2++;
			}

			visualTime2();
			setInterval(visualTime2, rollingSpeed2);
		});
	}
	
	/* 문의하기 select */
	$('.inquiry-pop select').fakeselect();
	
	/* ******* 연혁 소스 ******* */
	if ($.exists(".history-percent-bar")) {
		var $docCon = $(".sub-tab-con:visible .history-year-item");;
		var docCount = $docCon.length;
		var docNav = [];
			
		$(window).on('load', function  () {
			checkDocStartOffset();
			docNav = checkDocTopOffset();
		});
		$(window).on('resize', function  () {
			checkDocStartOffset();
			docNav = checkDocTopOffset();
		}); 		
		
		$(".history-tab-style a").on("click", function(){

			$(".history-year-item").removeClass("active");

			setTimeout(function(){
				docNav = checkDocTopOffset();
			},100);

		});
			
		var isVisible = false;
		
		$(window).on('scroll',function() {
			if (!isVisible) {
				checkDocStartOffset();
				docNav = checkDocTopOffset();
				isVisible=true;
			}
		});
		function checkDocStartOffset () {
			var docStartPoint =  $(".history-container-JS").offset().top;	
			return docStartPoint;
		}		
		function checkDocTopOffset () {
			var arr = [];
			var $docCon = $(".sub-tab-con:visible .history-year-item");

			$docCon.each(function(i){
				arr[i] = $(this).offset().top;
			});

			return arr;
		}
		$(window).scroll(function () {

			var $currentTab = $(".sub-tab-con:visible");
			var $docCon = $currentTab.find(".history-year-item");

			var scrollTop = $(window).scrollTop();
			var viewHeight = $(window).height();
			
			var startPoint = $currentTab.offset().top;	
			var $scrollBar = $currentTab.find(".percent-bar-child"); // ⭐ 현재 탭 기준
			var scrollBarOffset = $scrollBar.find(".point").offset().top;

			if ((scrollTop + viewHeight) > startPoint){
				var scrollPercent = (scrollTop + viewHeight) - (startPoint + viewHeight/2);
				$scrollBar.css('height', scrollPercent );
				$scrollBar.css('max-height', '100%');
				$scrollBar.find(".point").toggleClass("active", scrollTop > 0);
			}

			$docCon.each(function(idx){
				var eachOffset = $(this).offset().top;
				var minusOffset = checkFixedHeight();

				if (scrollBarOffset + minusOffset >= eachOffset){
					$docCon.removeClass('active');
					$(this).addClass('active');
				}
			});
		});
	}
	
	if ($.exists('.history-page')) {
		var awardTop;
		
		$('.award-tab-style ul li a').on('click', function (e) {			
			if (e.pointerType && e.pointerType !== 'mouse') return;

			if ( getWindowWidth () > tabletWidth ) {
				awardTop = $('.award-history-con').offset().top - 50;
			}else {
				awardTop = $('.award-history-con').offset().top - 100;
			}
			
			if ( getWindowWidth () > mobileWidth ) {
				moveScrollTop(awardTop, 400);
			}
		});
	}
	
	/* =========================
	   전역 anchor (selected 기준)
	   ========================= */
	let subMenuAnchor = null;


	/* =========================
	   selected 기준 위치 계산
	   ========================= */
	function setSelectedLine($li) {
		const $a = $li.find("a");

		return {
			left: $li.position().left,
			width: $a.outerWidth()
		};
	}


	/* =========================
	   서브 메뉴 move-line 제어
	   ========================= */
	function subMenuFunc () {
		const $subMenuList = $(".history-tab-style ul");
		const $line = $(".move-line span");

		// 초기 selected 기준 세팅
		const $selected = $subMenuList.find("li.selected");
		if ($selected.length) {
			subMenuAnchor = setSelectedLine($selected);
			$line.css(subMenuAnchor);
		}

		// hover (임시 이동)
		$subMenuList.children("li")
		.on("mouseenter focusin", function () {
			const $a = $(this).find("a");

			$subMenuList.children("li").addClass("none-hover");
			$(this).removeClass("none-hover").addClass("hover");

			$line.stop().animate({
				left: $(this).position().left,
				width: $a.outerWidth()
			}, 300, "swing");
		})

		// leave → selected(anchor)로 복귀
		.on("mouseleave focusout", function () {
			$subMenuList.children("li").removeClass("none-hover hover");

			if (!subMenuAnchor) return;

			$line.stop().animate(subMenuAnchor, 300, "swing");
		});
	}


	/* =========================
	   탭 클릭 시 selected + anchor 갱신
	   ========================= */
	$(".history-tab-style ul li a").on("click", function (e) {
		e.preventDefault();

		const $li = $(this).parent();

		// selected 변경
		$li.addClass("selected")
		   .siblings().removeClass("selected");

		// anchor 갱신 + move-line 고정
		subMenuAnchor = setSelectedLine($li);
		$(".move-line span").stop().animate(subMenuAnchor, 300, "swing");
	});


	/* =========================
	   DOM Ready
	   ========================= */
	$(function () {
		subMenuFunc();
	});
		
		// 스클로바
		/* 스크롤 가능 여부 체크 */
		function checkAwardScroll() {
  $(".sub-tab-con:visible .award-year-list-con").each(function () {
    const el = this;
    $(this).toggleClass(
      "has-scroll",
      el.scrollHeight > 508
    );
  });
}

$(window).on("load", function () {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      checkAwardScroll();
    });
  });
});

/* Edge는 resize 한 번 더 */
$(window).on("load", function () {
  setTimeout(() => {
    $(window).trigger("resize");
  }, 100);
});

		/* 탭 전환 예시 */
		$(".award-tab-style ul li a").on("click", function (e) {
			e.preventDefault();

			const target = $(this).attr("href");

			$(".award-tab-content-style .sub-tab-con").hide();
			$(target).show();

			$(".award-tab-style li").removeClass("selected");
			$(this).parent().addClass("selected");

			checkAwardScroll();
		});
});