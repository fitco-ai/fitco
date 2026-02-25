export const DISPLAY_LOCATIONS = [
  'all',

  // 상품 관련
  'PRODUCT_LIST', // 상품 분류
  'PRODUCT_DETAIL', // 상품 상세
  'PRODUCT_SEARCH', // 상품 검색
  'PRODUCT_PROJECT', // 기획전
  'PRODUCT_RECENT', // 최근본상품
  'PRODUCT_COMPARE', // 상품비교

  // 게시판 - 자유게시판
  'BOARD_MAIN', // 게시판 메인
  'BOARD_FREE_LIST', // 게시판 목록
  'BOARD_FREE_DETAIL', // 게시판 상세보기
  'BOARD_FREE_WRITE', // 게시물 쓰기
  'BOARD_FREE_MODIFY', // 게시물 수정
  'BOARD_FREE_REPLY', // 게시물 답글
  'BOARD_FREE_COMMENTDEL', // 게시물 댓글삭제
  'BOARD_FREE_SECRET', // 게시물 비밀글

  // 게시판 - 상품사용후기
  'BOARD_PRODUCT_LIST', // 상품사용후기 목록
  'BOARD_PRODUCT_DETAIL', // 상품사용후기 상세보기
  'BOARD_PRODUCT_WRITE', // 상품사용후기 쓰기
  'BOARD_PRODUCT_MODIFY', // 상품사용후기 수정
  'BOARD_PRODUCT_REPLY', // 상품사용후기 답글

  // 게시판 - 갤러리
  'BOARD_GALLERY_LIST', // 갤러리 목록 (갤러리형)
  'BOARD_GALLERY_DETAIL', // 갤러리 상세보기
  'BOARD_GALLERY_WRITE', // 갤러리 쓰기
  'BOARD_GALLERY_MODIFY', // 갤러리 수정
  'BOARD_GALLERY_REPLY', // 갤러리 답글
  'BOARD_GALLERY_COMMENTDEL', // 갤러리 댓글삭제
  'BOARD_GALLERY_SECRET', // 갤러리 비밀글

  // 게시판 - 기타
  'BOARD_URGENCY', // 긴급문의접수
  'BOARD_CONSULT_LIST', // 1:1맞춤상담목록
  'BOARD_CONSULT_DETAIL', // 1:1맞춤상담상세
  'BOARD_CONSULT_WRITE', // 1:1 맞춤상담 쓰기
  'BOARD_CONSULT_MODIFY', // 1:1 맞춤상담 수정
  'BOARD_CONSULT_REPLY', // 1:1 맞춤상담 답글
  'BOARD_OPDIARY_LIST', // 운영일지 목록
  'BOARD_OPDIARY_DETAIL', // 운영일지 읽기
  'BOARD_INQUIRY_LIST', // 대량구매문의 목록
  'BOARD_INQUIRY_MODIFY', // 대량구매문의 수정
  'BOARD_INQUIRY_WRITE', // 대량구매문의 등록
  'BOARD_INQUIRY_DETAIL', // 대량구매문의 상세보기
  'BOARD_MEMO_LIST', // 한줄메모 목록

  // 회원
  'MEMBER_JOIN', // 회원가입
  'MEMBER_MODIFY', // 회원정보수정
  'MEMBER_AGREEMENT', // 이용약관
  'MEMBER_PRIVACY', // 개인정보 취급방침
  'MEMBER_JOINRESULT', // 회원가입결과
  'MEMBER_ID_FIND', // 아이디찾기
  'MEMBER_PW_FIND', // 비밀번호찾기
  'MEMBER_LOGIN', // 로그인 화면
  'MEMBER_CHECKPW', // 회원 비밀번호 인증
  'MEMBER_ID_FINDRESULT', // 아이디 찾기결과
  'MEMBER_PW_FINDRESULT', // 비밀번호찾기 결과
  'MEMBER_PW_FINDQUESTION', // 비밀번호찾기 질문
  'MEMBER_ADMINFAIL', // 접근 제한

  // 마이쇼핑
  'MYSHOP_MAIN', // 마이쇼핑 메인 화면
  'MYSHOP_ORDER_LIST', // 마이쇼핑 주문내역
  'MYSHOP_ORDER_DETAIL', // 마이쇼핑 주문상세내역
  'MYSHOP_MILEAGE_LIST', // 마이쇼핑 적립금내역
  'MYSHOP_COUPON_COUPON', // 마이쇼핑 쿠폰내역
  'MYSHOP_DEPOSIT_LIST', // 마이쇼핑 예치금내역
  'MYSHOP_ADDR_LIST', // 배송주소록목록
  'MYSHOP_ADDR_REGIST', // 배송주소록등록
  'MYSHOP_ADDR_MODIFY', // 배송주소록수정
  'MYSHOP_WISHLIST', // 마이쇼핑 관심상품 목록
  'MYSHOP_BOARDLIST', // 나의 게시글
  'MYSHOP_MILEAGE_UNAVAILLIST', // 미가용 적립내역보기
  'MYSHOP_ORDER_CANCEL', // 취소신청
  'MYSHOP_ORDER_EXCHANGE', // 교환신청
  'MYSHOP_ORDER_RETURN', // 반품신청
  'MYSHOP_ORDER_ISSUE_TAX', // 세금계산서 신청 양식
  'MYSHOP_ORDER_ISSUE_CASH', // 현금 영수증 신청 양식

  // 메인
  'MAIN', // 메인화면
  'MAIN_INTRO_MEMBER', // 회원만 접근 가능 페이지
  'MAIN_INTRO_ADULT', // 본인인증 페이지

  // 쇼핑 정보
  'SHOPINFO_FAQ', // 이용안내(FAQ)
  'SHOPINFO_COMPANY', // 회사소개

  // 주문
  'ORDER_BASKET', // 장바구니 화면
  'ORDER_ORDERFORM', // 주문서 작성화면
  'ORDER_ORDERRESULT', // 주문 완료
  'ORDER_GIFTLIST', // 사은품 안내

  // 쿠폰
  'COUPON_COUPONZONE', // 쿠폰존

  // 출석체크
  'ATTEND_COMMENT', // 출석체크 (댓글형)
  'ATTEND_STAMP', // 출석체크 (달력형)

  // 캘린더게시판
  'CALENDAR_DAY', // 캘린더게시판 (일간)
  'CALENDAR_FIELD', // 캘린더게시판 추가항목
  'CALENDAR_MONTH', // 캘린더게시판 (월간)
  'CALENDAR_WEEK', // 캘린더게시판 (주간)

  // 공급사
  'SUPPLY_INDEX', // 공급사 메인

  // 바로가기
  'LINK_LIVELINKON', // 바로가기(링콘)
] as const;
