<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ko">
<head>
<meta name="keywords" content="농촌진흥청, 병해충발생정보, OpenAip" charset="utf-8" />
<title>녹색기술 청색마을 함께하는 농촌진흥청(병해충예측정보 OpenAip Service)</title>
<script type="text/javascript" src="http://ncpms.rda.go.kr/npmsAPI/api/openapiFore.jsp"></script>
<script type="text/javascript">
	npmsJ(document).ready(function() {
		// Api Key
		setNpmsOpenApiKey( "[발급받는OpenAPI키]" );
		
		// 서비스 코드
		setNpmsOpenApiServiceCode("SVC31");
		
		// 크로스 도메인 처리를 위한 콜백페이지, 꼭 서비스 도메인으로 수정해주세요.
		setNpmsOpenApiProxyUrl("http://[서비스도메인]/openapiFore_ajax_callback.jsp");
		
		// 넓이 조절 : OpenAPI 특성상 600px 이하로는 조절이 안됨
		setNpmsOpenAPIWidth(600);
		
		// setCoordinateZoom([위도], [경도], [줌 레벨]) : 지도의 위치를 지정하는 함수 
		// 위도, 경도 : 지도의 중심이되는 위도, 경도를 넣어주세요. (※ 좌표계는 epsg:4326)
		// 줌 레벨 : 보여지고 싶은만큼의 줌 레벨을 설정하세요.(예 : 도단위는 9, 시군 단위는 11)
		// 해당 함수를 사용하지 않아도 지도 중심 및 줌 레벨이 기본값으로 지도가 조회됩니다.
		setCoordinateZoom("35.8312", "127.0563", 15);// 예시 : 농촌진흥청 (위도:35.8312 , 경도:127.0563 )
		
		// 서비스 작목
		// 작목코드 - 감귤:FT060614,감자:FC050501,고추:VC011205,논벼:FC010101,배:FT010602,사과:FT010601,파:VC041202,포도:FT040603
		// 서비스 하고 싶은 작목코드를 cropList 배열에 추가하여 주세요. 추가된 순서로 목록이 보여집니다.
		var cropList = new Array('FC010101', 'FT010601','VC011205');
		setCropList(cropList);
		
		// 지도 움직임 여부 설정
		setMoveMatAt( true );
		
		// 서비스요청
		actionMapInfo("defaultTag");
	});
</script>
</head>
<body>
	<div id="defaultTag"></div>
</body>
</html>