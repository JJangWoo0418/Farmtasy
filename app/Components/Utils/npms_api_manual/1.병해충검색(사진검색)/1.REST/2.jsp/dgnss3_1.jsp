<%@page import="java.io.InputStream"%>
<%@page import="java.net.URLEncoder"%>
<%@page import="java.net.URLDecoder"%>
<%@page import="org.w3c.dom.NodeList"%>
<%@page import="org.w3c.dom.Node"%>
<%@page import="org.w3c.dom.Element"%>
<%@page import="javax.xml.parsers.DocumentBuilderFactory"%>
<%@page import="org.w3c.dom.Document"%>
<%@page import="java.net.URL"%>

<%@ page contentType="text/html; charset=utf-8" %>
<html>
<head>
<meta http-dquiv="Content-Type" content="text/html" charset="utf-8">

<script type='text/javascript'>

//이전화면으로 이동
function fncBeforePage(){
	with(document.apiForm){
		method="get";
		action = "dgnss2.jsp";
		target = "_self";
		submit();
	}
}

//천적곤충으로 이동
function fncGoEnemy(key){
	with(document.apiForm){
		insectKey.value = key;
		method="get";
		action = "dgnss3_3.jsp";
		target = "_self";
		submit();
	}
}
</script>

</head>
<body>    
<form name="apiForm">
<input type="hidden" name="startPoint"/>
<input type="hidden" name="bfStartPoint" value="<%=request.getParameter("bfStartPoint")%>"/>
<input type="hidden" name="cropSectionCode" value="<%=request.getParameter("cropSectionCode")%>"/>
<input type="hidden" name="cropSectionName" value="<%=request.getParameter("cropSectionName")%>"/>
<input type="hidden" name="cropCode" value="<%=request.getParameter("cropCode")%>"/>
<input type="hidden" name="cropName" value="<%=request.getParameter("cropName")%>"/>
<input type="hidden" name="insectKey" value=""/>
<%
	//해충 상세조회

	String buildTime = null;
	String totalCnt = null;
	String startPoint = null;
	String displayCount = null;
	String errorMsg = null;
	String errorCode = null;
	
	String apiKey = "";//apiKey - NCPMS에서 신청 후 승인되면 확인 가능
	
	String serviceCode = "SVC07";// 해충상세조회의 서비스코드(상세한 내용은 Open API 이용안내 참조)
	
	//XML 받을 URL 생성
	String parameter = "apiKey="+ apiKey;
	parameter += "&serviceCode="+ serviceCode;
	parameter += "&insectKey="+ request.getParameter("pestKey");
	
	//서버와 통신
	URL apiUrl = new URL("http://ncpms.rda.go.kr/npmsAPI/service?"+parameter);
	InputStream apiStream = apiUrl.openStream();
	
	Document doc = null;
	try{
		//xml document
		doc =	DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(apiStream);
		
		//기본정보
		try{buildTime = doc.getElementsByTagName("buildTime").item(0).getFirstChild().getNodeValue();}catch(Exception e){buildTime = "";}//생성시간
		try{totalCnt = doc.getElementsByTagName("totalCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){totalCnt = "";}//전체 갯수
		try{startPoint = doc.getElementsByTagName("startPoint").item(0).getFirstChild().getNodeValue();}catch(Exception e){startPoint = "";}//시작지점
		try{displayCount = doc.getElementsByTagName("displayCount").item(0).getFirstChild().getNodeValue();}catch(Exception e){displayCount = "";}//출력갯수
		try{errorMsg = doc.getElementsByTagName("errorMsg").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorMsg = "";}//에러코드(에러발생시에만 생성)
		try{errorCode = doc.getElementsByTagName("errorCode").item(0).getFirstChild().getNodeValue();}catch(Exception e){errorCode = "";}//에러메시지(에러발생시에만 생성)
	}catch(Exception e){
		e.printStackTrace();
	}finally{
		apiStream.close();
	}
%>

    
   <%if( !errorCode.equals("")){%>
      농촌진흥청 국가농작물 관리시스템 OpenAPI 호출 시 장애가 발생하였습니다.<br/>잠시후에 다시 이용하십시오.
	  <br/>
	  <%=errorMsg%>
	<%}else{

		//이미지
		NodeList imageList = null;
		NodeList imageItems = null;
		int imageSize = 0;
		imageList = doc.getElementsByTagName("imageList");
		imageItems = imageList.item(0).getChildNodes();
		imageSize = imageItems.getLength();

		//천적곤충 리스트
		NodeList enemyList = null;
		NodeList enemyItems = null;
		int enemySize = 0;
		enemyList = doc.getElementsByTagName("enemyInsectList");
		enemyItems = enemyList.item(0).getChildNodes();
		enemySize = enemyItems.getLength();
		
		String cropName = null;
		String insectOrder = null;
		String insectGenus = null;
		String insectFamily = null;
		String insectSpecies = null;
		String insectSpeciesKor = null;
		String insectSubspecies = null;
		String insectSubgenus = null;
		String insectAuthor = null;
		String authYear = null;
		String ecologyInfo = null;
		String damageInfo = null;
		String preventMethod = null;

		try{cropName = doc.getElementsByTagName("cropName").item(0).getFirstChild().getNodeValue();}catch(Exception e){cropName = "";}//작물명
		try{insectOrder = doc.getElementsByTagName("insectOrder").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectOrder = "";}//해충목명
		try{insectGenus = doc.getElementsByTagName("insectGenus").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectGenus = "";}//해충속명
		try{insectFamily = doc.getElementsByTagName("insectFamily").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectFamily = "";}//해충과명
		try{insectSpecies = doc.getElementsByTagName("insectSpecies").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectSpecies = "";}//해충종명
		try{insectSpeciesKor = doc.getElementsByTagName("insectSpeciesKor").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectSpeciesKor = "";}//해충한국종명
		try{insectSubspecies = doc.getElementsByTagName("insectSubspecies").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectSubspecies = "";}//해충아종명
		try{insectSubgenus = doc.getElementsByTagName("insectSubgenus").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectSubgenus = "";}//해충아속명
		try{insectAuthor = doc.getElementsByTagName("insectAuthor").item(0).getFirstChild().getNodeValue();}catch(Exception e){insectAuthor = "";}//명명자
		try{authYear = doc.getElementsByTagName("authYear").item(0).getFirstChild().getNodeValue();}catch(Exception e){authYear = "";}//명명년도
		try{ecologyInfo = doc.getElementsByTagName("ecologyInfo").item(0).getFirstChild().getNodeValue();}catch(Exception e){ecologyInfo = "";}//생태정보
		try{damageInfo = doc.getElementsByTagName("damageInfo").item(0).getFirstChild().getNodeValue();}catch(Exception e){damageInfo = "";}//피해정보
		try{preventMethod = doc.getElementsByTagName("preventMethod").item(0).getFirstChild().getNodeValue();}catch(Exception e){preventMethod = "";}//방제방법
		
	%> 

		<table  border="1" cellspacing="0" cellpadding="0">
			<colgroup>
				<col width="20%">
				<col width="*">
			</colgroup>
			<tr>
				<td>작물</td>
				<td><%=cropName%></td>
			</tr>
			<tr>
				<td>목명</td>
				<td><%=insectOrder%></td>
			</tr>
			<tr>
				<td>속명</td>
				<td><%=insectGenus%></td>
			</tr>
			<tr>
				<td>과명</td>
				<td><%=insectFamily%></td>
			</tr>
			<tr>
				<td>종명</td>
				<td><%=insectSpecies%></td>
			</tr>
			<tr>
				<td>한국종명</td>
				<td><%=insectSpeciesKor%></td>
			</tr>
			<tr>
				<td>아종명</td>
				<td><%=insectSubspecies%></td>
			</tr>
			<tr>
				<td>아속명</td>
				<td><%=insectSubgenus%></td>
			</tr>
			<tr>
				<td>명명자</td>
				<td><%=insectAuthor%></td>
			</tr>
			<tr>
				<td>명명년도</td>
				<td><%=authYear%></td>
			</tr>
			<tr>
				<td>생태정보</td>
				<td><%=ecologyInfo%></td>
			</tr>
			<tr>
				<td>피해정보</td>
				<td><%=damageInfo%></td>
			</tr>
			<tr>
				<td>방제방법</td>
				<td><%=preventMethod%></td>
			</tr>

		</table>
		
	<br/>
	<br/>
	<%if(imageSize>0){%>
		&gt; 해충 이미지
		<table  border="1" cellspacing="0" cellpadding="0">
		<%for(int i=0; i<imageSize; i++){%>
			<tr>
				<td><%=imageItems.item(i).getChildNodes().item(0).getFirstChild().getNodeValue()%></td>
				<td><img src="<%=imageItems.item(i).getChildNodes().item(2).getFirstChild().getNodeValue()%>" width="320px" height="300px"/></td>
			</tr>
		<%}%>
		</table>
	<%}%>

	<br/>
	<br/>
	<%if(enemySize>0){%>
		&gt; 천적곤충 정보
		<table  border="1" cellspacing="0" cellpadding="0">
		<colgroup>
			<col width="15%">
			<col width="30%">
			<col width="*">
		</colgroup>
		<tr>
			<th>사진정보</th>
			<th>목/과</th>
			<th>국명(학명)</th>
		</tr>
		<%for(int i=0; i<enemySize; i++){%>
			<tr>
				<td><img src="<%=enemyItems.item(i).getChildNodes().item(2).getFirstChild().getNodeValue()%>" width="120px" height="80px"/></td>
				<td><%=enemyItems.item(i).getChildNodes().item(0).getFirstChild().getNodeValue()%>/<%=enemyItems.item(i).getChildNodes().item(1).getFirstChild().getNodeValue()%></td>
				<td><a href="javascript:fncGoEnemy('<%=enemyItems.item(i).getChildNodes().item(6).getFirstChild().getNodeValue()%>');"><%=enemyItems.item(i).getChildNodes().item(3).getFirstChild().getNodeValue()%>(<%=enemyItems.item(i).getChildNodes().item(5).getFirstChild().getNodeValue()%>)</a></td>
			</tr>
		<%}%>
		</table>
	<%}%>


	
	
	<%}%>
</form>

<br/>
<input type="button" onclick="javascript:location.href='dgnss.jsp'" value="처음화면으로"/>&nbsp;
<input type="button" onclick="javascript:fncBeforePage();" value="이전화면으로"/>
</body>
</html>